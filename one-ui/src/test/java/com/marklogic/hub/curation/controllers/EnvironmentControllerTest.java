package com.marklogic.hub.curation.controllers;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.LogbackException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.deploy.commands.DeployHubOtherServersCommand;
import com.marklogic.hub.deploy.commands.DeployHubTriggersCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;
import com.marklogic.hub.oneui.controllers.EnvironmentController;
import com.marklogic.hub.oneui.exceptions.ProjectDirectoryException;
import com.marklogic.hub.oneui.listener.UIDeployListener;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.DataHubProjectUtils;
import com.marklogic.hub.oneui.services.EnvironmentConfig;
import com.marklogic.hub.oneui.utils.TestLoggingAppender;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
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
        final ObjectNode nonExistentPayload = new ObjectMapper().createObjectNode().put("directory", "/non-existent");
        assertThrows(ProjectDirectoryException.class, () -> {
            environmentController.install(nonExistentPayload);
        });
    }

    @Test
    public void testUploadProject() throws Exception {
        testHelper.authenticateSessionAsEnvironmentManager();
        ObjectMapper om = new ObjectMapper();
        EnvironmentConfig envConfig = om.treeToValue(environmentController.getProjectInfo(), EnvironmentConfig.class);
        if (envConfig == null || StringUtils.isEmpty(envConfig.getProjectDir())) {
            return;
        }

        File file = new File(EnvironmentControllerTest.class.getClassLoader().getResource("datahub-project.zip").getFile());
        FileInputStream input = new FileInputStream(file);

        MultipartFile mockMultipartFile = new MockMultipartFile("datahub-project.zip", "", "application/zip", input);

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
}
