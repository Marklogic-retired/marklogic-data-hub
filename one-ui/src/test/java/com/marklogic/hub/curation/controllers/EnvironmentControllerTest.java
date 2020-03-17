package com.marklogic.hub.curation.controllers;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.LogbackException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.deploy.commands.DeployHubOtherServersCommand;
import com.marklogic.hub.deploy.commands.DeployHubTriggersCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;
import com.marklogic.hub.oneui.auth.AuthenticationFilter;
import com.marklogic.hub.oneui.controllers.EnvironmentController;
import com.marklogic.hub.oneui.exceptions.ProjectDirectoryException;
import com.marklogic.hub.oneui.listener.UIDeployListener;
import com.marklogic.hub.oneui.models.EnvironmentInfo;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.DataHubProjectUtils;
import com.marklogic.hub.oneui.services.EnvironmentConfig;
import com.marklogic.hub.oneui.services.EnvironmentService;
import com.marklogic.hub.oneui.utils.TestLoggingAppender;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.multipart.MultipartFile;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class, ApplicationConfig.class, FlowControllerTest.class})
public class EnvironmentControllerTest {

    @Autowired
    private TestHelper testHelper;

    @Autowired
    private HubConfigSession hubConfigSession;

    @Autowired
    private EnvironmentController environmentController;

    @Autowired
    private EnvironmentService environmentService;

    @Autowired
    LoadDataController controller;

    private boolean hasBeenInitialized = false;

    @BeforeEach
    void before() {
        if (!hasBeenInitialized) {
            testHelper.setHubProjectDirectory();
            testHelper.authenticateSession();
            hasBeenInitialized = true;
        }
    }

    @AfterEach
    void after() {
        testHelper.setHubProjectDirectory();
    }

    @Test
    void downloadProject() throws IOException {
        //Creating a load data artifact so it can be verified for download test
        testHelper.authenticateSession();
        controller.updateArtifact("validArtifact", testHelper.validLoadDataConfig);

        ArrayNode resultList = (ArrayNode) controller.getArtifacts().getBody();

        assertEquals(1, resultList.size(), "List of load data artifacts should now be 1");

        Path artifactProjectLocation = testHelper.getArtifactManager().buildArtifactProjectLocation(controller.getArtifactType(), "validArtifact", null, false);
        ObjectNode resultByName = controller.getArtifact("validArtifact").getBody();
        assertEquals("validArtifact", resultByName.get("name").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("xml", resultByName.get("sourceFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("json", resultByName.get("targetFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertTrue(artifactProjectLocation.toFile().exists(), "File should have been created in the project directory");

        ObjectNode enrichedJson = controller.setData("validArtifact", new MockMultipartFile[]{ new MockMultipartFile("file", "orig", null, "docTest".getBytes())}).getBody();
        assertEquals(1, enrichedJson.get("fileCount").asInt(), "File should be added to data set.");

        MockHttpServletResponse response = new MockHttpServletResponse();
        environmentController.downloadProject(new MockHttpServletRequest(), response);
        List<String> zipContent = new ArrayList();
        try (ZipInputStream zipStream = new ZipInputStream(new ByteArrayInputStream(response.getContentAsByteArray()))) {
            ZipEntry entry = null;
            while ((entry = zipStream.getNextEntry()) != null) {
                String entryName = entry.getName();
                zipContent.add(entryName);
                zipStream.closeEntry();
            }
        }

        assertFalse(zipContent.isEmpty());
        assertTrue(zipContent.contains("entities" + File.separator));
        assertTrue(zipContent.contains("flows" + File.separator));
        assertTrue(zipContent.contains("loadData" + File.separator));
        assertFalse(zipContent.contains("data-sets" + File.separator));
    }

    @Test
    void installProjectWithNewDirectory() throws Exception {
        testHelper.authenticateSessionAsEnvironmentManager();
        String unexpectedDirectory = testHelper.tempProjectDirectory.toAbsolutePath().toString();
        String expectedDirectory = Files.createTempDirectory("one-ui-hub-project-different-dir").toAbsolutePath().toString();
        boolean[] containsUnexpectedDirectory = {false};
        boolean[] containsExpectedDirectory = {false};
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
        // Special test appender to check for directories in output
        TestLoggingAppender<ILoggingEvent> testAppender = new TestLoggingAppender<>() {
            @Override
            public void doAppend(ILoggingEvent event) throws LogbackException {
                containsUnexpectedDirectory[0] = containsUnexpectedDirectory[0] || event.getMessage().contains(unexpectedDirectory);
                containsExpectedDirectory[0] = containsExpectedDirectory[0] || event.getMessage().contains(expectedDirectory);
            }
        };
        // Subset of classes that look read from project directory for install
        Class<?>[] classes = {HubConfigImpl.class, DeployDatabaseFieldCommand.class, DeployHubOtherServersCommand.class, DeployHubTriggersCommand.class, DeployPrivilegesCommand.class, DeployRolesCommand.class};
        Object[] loggers = Stream.of(classes).map(loggerContext::getLogger).toArray();

        Stream.of(loggers).forEach((logger -> ((Logger) logger).addAppender(testAppender)));
        try {
            environmentController.install(new ObjectMapper().createObjectNode().put("directory", expectedDirectory));
        } finally {
            Stream.of(loggers).forEach((logger -> ((Logger) logger).detachAppender(testAppender)));
        }
        assertFalse(containsUnexpectedDirectory[0], "Shouldn't find reference to old directory in logs");
        assertTrue(containsExpectedDirectory[0], "Should find reference to new directory in logs");
    }

    @Test
    void installAttemptWithBadDirectory() {
        final ObjectNode relativePayload = new ObjectMapper().createObjectNode().put("directory", "relative-path");
        assertThrows(ProjectDirectoryException.class, () -> {
            environmentController.install(relativePayload);
            fail("Should have thrown exception for relative path!");
        });
        // check that the environment service indicates that the install is in a dirty state
        assertTrue(environmentService.isInDirtyState(), "Install should be in a dirty state");
        // check that the AuthenticationFilter shows the Data Hub isn't installed after a failed install attempt
        TestAuthenticationFilter authenticationFilter = new TestAuthenticationFilter(environmentService, hubConfigSession);
        assertFalse(authenticationFilter.isDataHubInstalled(), "AuthenticationFilter shouldn't indicate the Data Hub is installed");
        final ObjectNode nonExistentPayload = new ObjectMapper().createObjectNode().put("directory", "/non-existent");
        assertThrows(ProjectDirectoryException.class, () -> {
            environmentController.install(nonExistentPayload);
        });
    }

    @Test
    public void testUploadProjectWithoutArchiveFolder() throws Exception {
        testUploadProject("dhfWithoutArchiveFolder.zip");

        //in the dhfWithoutArchiveFolder.zip, no loadData artifact
        DatabaseClient databaseClient = hubConfigSession.newFinalClient();
        JSONDocumentManager docMgr = databaseClient.newJSONDocumentManager();
        assertThrows(ResourceNotFoundException.class, () -> docMgr.read("/loadData/haoDL-json.loadData.json", new StringHandle().withFormat(Format.JSON)));
        assertThrows(ResourceNotFoundException.class, () -> docMgr.read("/loadData/haoDL-json.setting.json", new StringHandle().withFormat(Format.JSON)));
    }

    @Test
    public void testUploadProjectWithArchiveFolder() throws Exception {
        testUploadProject("dhfWithArchiveFolder.zip");

        //in the dhfWithArchiveFolder.zip, it includes /loadData/haoDL-json.loadData.json and /loadData/haoDL-json.settings.json
        DatabaseClient databaseClient = hubConfigSession.newFinalClient();
        JSONDocumentManager docMgr = databaseClient.newJSONDocumentManager();
        StringHandle searchResult  = docMgr.read("/loadData/haoDL-json.loadData.json", new StringHandle().withFormat(Format.JSON));
        assertTrue(searchResult.get().startsWith("{\"name\":\"haoDL-json\""), "haoDL-json.loadData.json should be deployed into ML content Database");

        searchResult = docMgr.read("/loadData/haoDL-json.settings.json", new StringHandle().withFormat(Format.JSON));
        assertTrue(searchResult.get().startsWith("{\"artifactName\":\"haoDL-json\""), "haoDL-json.setting.json should be deployed into ML content Database");
    }

    public void testUploadProject(String zipFileName) throws Exception {
        EnvironmentInfo environmentInfo = new EnvironmentInfo("localhost", "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
        hubConfigSession.setCredentials(environmentInfo, testHelper.adminUserName, testHelper.adminPassword);

        TestAuthenticationFilter authenticationFilter = new TestAuthenticationFilter(environmentService, hubConfigSession);
        boolean installed = authenticationFilter.isDataHubInstalled();
        if (!installed) {
            //can not test upload project unless it is installed first
            return;
        }
        assertFalse(StringUtils.isEmpty(hubConfigSession.getProjectDir()), "Project directory should exist!");

        ObjectMapper om = new ObjectMapper();
        EnvironmentConfig envConfig = om.treeToValue(environmentController.getProjectInfo(), EnvironmentConfig.class);
        assertFalse(envConfig == null || StringUtils.isEmpty(envConfig.getProjectDir()), "Project directory should exist!");

        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource(zipFileName).getFile());
        FileInputStream input = new FileInputStream(file);

        MultipartFile mockMultipartFile = new MockMultipartFile(zipFileName, "", "application/zip", input);

        Set<String> SUCCESS_LOG_MSG = new HashSet<>(Arrays.asList("Backed up the existing project", "Cleaned the existing project folder",
            "Extracted the uploaded zip project", "100% Uninstallation Complete", "100% Installation Complete"));
        LoggerContext loggerContext = (LoggerContext) LoggerFactory.getILoggerFactory();
        TestLoggingAppender<ILoggingEvent> testAppender = new TestLoggingAppender<>() {
            @Override
            public void doAppend(ILoggingEvent event) throws LogbackException {
                String[] matched = {null};
                boolean found = SUCCESS_LOG_MSG.stream().anyMatch(e -> {
                    if (event.getMessage().startsWith(e)) {
                        matched[0] = e;
                        return true;
                    } else return false;
                });
                if (found) {
                    SUCCESS_LOG_MSG.remove(matched[0]);
                    if ("Extracted the uploaded zip project".equals(matched[0])) {
                        File projectFolder = new File(hubConfigSession.getProjectDir());
                        assertTrue(Stream.of(projectFolder.list()).anyMatch(e -> "gradle.properties".equals(e)));
                        assertTrue(Stream.of(projectFolder.list()).anyMatch(e -> "flows".equals(e)));
                        assertTrue(Stream.of(projectFolder.list()).anyMatch(e -> "src".equals(e)));
                    }
                }
            }
        };

        Class<?>[] classes = {DataHubProjectUtils.class, UIDeployListener.class};
        Object[] loggers = Stream.of(classes).map(loggerContext::getLogger).toArray();
        Stream.of(loggers).forEach((logger -> ((Logger) logger).addAppender(testAppender)));

        try {
            environmentController.uploadProject(mockMultipartFile);
        } finally {
            Stream.of(loggers).forEach((logger -> ((Logger) logger).detachAppender(testAppender)));
        }

        assertTrue(SUCCESS_LOG_MSG.isEmpty(), "has error or exception thrown.");
    }

    @Test
    public void testManageAdminAndSecurityAuthoritiesForArtifacts() {
        testHelper.authenticateSessionAsEnvironmentManager();
        ArtifactManager mgr = testHelper.getArtifactManager();
        List<ArtifactTypeInfo> listTypeInfo = mgr.getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertTrue(typeInfo.getUserCanRead());
        }
    }

    @Test
    public void testAdminAuthoritiesForArtifacts()  {
        EnvironmentInfo environmentInfo = new EnvironmentInfo("localhost", "DIGEST", 8000,"DIGEST", 8002,"DIGEST", 8010, "DIGEST", 8011);
        hubConfigSession.setCredentials(environmentInfo, testHelper.adminUserName, testHelper.adminPassword);
        ArtifactManager mgr = testHelper.getArtifactManager();
        List<ArtifactTypeInfo> listTypeInfo = mgr.getArtifactTypeInfoList();
        for (ArtifactTypeInfo typeInfo : listTypeInfo) {
            assertTrue(typeInfo.getUserCanUpdate());
            assertFalse(typeInfo.getUserCanRead(), "admin would not allow read but write for deployment!");
        }
    }

    static class TestAuthenticationFilter extends AuthenticationFilter {
        public TestAuthenticationFilter(EnvironmentService environmentService, HubConfigSession hubConfig) {
            super(environmentService, hubConfig);
        }

        public boolean isDataHubInstalled() {
            return super.isDataHubInstalled();
        }
    }
}
