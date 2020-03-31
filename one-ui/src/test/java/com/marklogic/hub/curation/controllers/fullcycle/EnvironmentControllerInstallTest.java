package com.marklogic.hub.curation.controllers.fullcycle;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.LogbackException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.appdeployer.command.security.DeployPrivilegesCommand;
import com.marklogic.appdeployer.command.security.DeployRolesCommand;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.deploy.commands.DeployHubOtherServersCommand;
import com.marklogic.hub.deploy.commands.DeployHubTriggersCommand;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.oneui.AbstractOneUiTest;
import com.marklogic.hub.oneui.auth.AuthenticationFilter;
import com.marklogic.hub.oneui.controllers.EnvironmentController;
import com.marklogic.hub.oneui.listener.UIDeployListener;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.DataHubProjectUtils;
import com.marklogic.hub.oneui.services.EnvironmentConfig;
import com.marklogic.hub.oneui.services.EnvironmentService;
import com.marklogic.hub.oneui.utils.TestLoggingAppender;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.ManageConfig;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.User;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * These tests are all being disabled, because as of 2020-03-31, we know that DH Central will not be allowed to install
 * DHF in a DHS environment. Keeping the test though, as we can likely rework it for the new "Install user project"
 * capability that we'll need in DHS.
 */
@Tag("Destructive")
public class EnvironmentControllerInstallTest extends AbstractOneUiTest {

    @Autowired
    EnvironmentController environmentController;

    @Autowired
    EnvironmentService environmentService;

    @AfterEach
    void after() {
        /*  The tests uninstalls/installs datahub, hence the roles have to be reassigned to users
            after datahub is reinstalled. */
        //assignRoleToUsers();
    }

//    private void assignRoleToUsers() {
//        assignRoleToUser(testConfig.dataHubOperatorUsername, "data-hub-operator");
//        assignRoleToUser(testConfig.dataHubDeveloperUsername, "data-hub-developer");
//        assignRoleToUser(testConfig.dataHubEnvironmentManagerUsername, "data-hub-environment-manager");
//    }
//
//    private void assignRoleToUser(String username, String role) {
//        ManageClient client = new ManageClient();
//        client.setManageConfig(new ManageConfig(testConfig.host, 8002, testConfig.adminUsername, testConfig.adminPassword));
//
//        User user = new User(new API(client), username);
//        user.setRole(Stream.of(role).collect(Collectors.toList()));
//        user.save();
//    }

    @Test
    void installProjectWithNewDirectory() throws Exception {
        if (true) return;
        runAsEnvironmentManager();
        String unexpectedDirectory = environmentService.getProjectDirectory();
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


    /*  The testUpload* tests uninstalls datahub and hence testHelper.assignRoleToUsers() is called to reassign roles to
        users after installation.
     */
    @Test
    public void testUploadProjectWithoutArchiveFolder() throws Exception {
        if (true) return;
        testUploadProject("dhfWithoutArchiveFolder.zip");
    }

    @Test
    public void testUploadProjectWithArchiveFolder() throws Exception {
        if (true) return;
        testUploadProject("dhfWithArchiveFolder.zip");
    }

    private void testUploadProject(String zipFileName) throws Exception {
        runAsAdmin();
        TestAuthenticationFilter authenticationFilter = new TestAuthenticationFilter(environmentService, hubConfig);
        boolean installed = authenticationFilter.isDataHubInstalled();
        if (!installed) {
            //can not test upload project unless it is installed first
            return;
        }
        assertFalse(StringUtils.isEmpty(hubConfig.getProjectDir()), "Project directory should exist!");

        ObjectMapper om = new ObjectMapper();
        EnvironmentConfig envConfig = om.treeToValue(environmentController.getProjectInfo(), EnvironmentConfig.class);
        assertFalse(envConfig == null || StringUtils.isEmpty(envConfig.getProjectDir()), "Project directory should exist!");

        File file = new File(com.marklogic.hub.curation.controllers.EnvironmentControllerTest.class.getClassLoader().getResource(zipFileName).getFile());
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
                        File projectFolder = new File(hubConfig.getProjectDir());
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

    static class TestAuthenticationFilter extends AuthenticationFilter {
        public TestAuthenticationFilter(EnvironmentService environmentService, HubConfigSession hubConfig) {
            super(environmentService, hubConfig);
        }

        public boolean isDataHubInstalled() {
            return super.isDataHubInstalled();
        }
    }
}
