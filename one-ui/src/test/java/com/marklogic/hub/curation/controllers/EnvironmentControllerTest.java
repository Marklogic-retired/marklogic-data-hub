package com.marklogic.hub.curation.controllers;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.Appender;
import ch.qos.logback.core.Context;
import ch.qos.logback.core.LogbackException;
import ch.qos.logback.core.filter.Filter;
import ch.qos.logback.core.spi.FilterReply;
import ch.qos.logback.core.status.Status;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

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
    void before(){
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
        try(ZipInputStream zipStream = new ZipInputStream(new ByteArrayInputStream(response.getContentAsByteArray()))) {
            ZipEntry entry = null;
            while ((entry = zipStream.getNextEntry()) != null) {
                String entryName = entry.getName();
                zipContent.add(entryName);
                zipStream.closeEntry();
            }
        }

        Assertions.assertFalse(zipContent.isEmpty());
        Assertions.assertTrue(zipContent.contains("entities" + File.separator));
        Assertions.assertTrue(zipContent.contains("flows" + File.separator));
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
        Appender<ILoggingEvent> testAppender = new Appender<ILoggingEvent>() {
            @Override
            public String getName() {
                return null;
            }

            @Override
            public void doAppend(ILoggingEvent event) throws LogbackException {
                containsUnexpectedDirectory[0] = containsUnexpectedDirectory[0] || event.getMessage().contains(unexpectedDirectory);
                containsExpectedDirectory[0] = containsExpectedDirectory[0] || event.getMessage().contains(expectedDirectory);
            }

            @Override
            public void setName(String name) {}

            @Override
            public void setContext(Context context) {}

            @Override
            public Context getContext() {
                return null;
            }

            @Override
            public void addStatus(Status status) {}

            @Override
            public void addInfo(String msg) {}

            @Override
            public void addInfo(String msg, Throwable ex) {}

            @Override
            public void addWarn(String msg) {}

            @Override
            public void addWarn(String msg, Throwable ex) {}

            @Override
            public void addError(String msg) {}

            @Override
            public void addError(String msg, Throwable ex) {}

            @Override
            public void addFilter(Filter<ILoggingEvent> newFilter) {}

            @Override
            public void clearAllFilters() {}

            @Override
            public List<Filter<ILoggingEvent>> getCopyOfAttachedFiltersList() {
                return null;
            }

            @Override
            public FilterReply getFilterChainDecision(ILoggingEvent event) {
                return null;
            }

            @Override
            public void start() {

            }

            @Override
            public void stop() {

            }

            @Override
            public boolean isStarted() {
                return false;
            }
        };
        // Subset of classes that look read from project directory for install
        Class<?>[] classes = {HubConfigImpl.class, DeployDatabaseFieldCommand.class, DeployHubOtherServersCommand.class, DeployHubTriggersCommand.class, DeployPrivilegesCommand.class, DeployRolesCommand.class};
        Object[] loggers = Stream.of(classes).map(loggerContext::getLogger).toArray();

        Stream.of(loggers).forEach((logger -> ((Logger)logger).addAppender(testAppender)));
        try {
            environmentController.install(new ObjectMapper().createObjectNode().put("directory",expectedDirectory));
        } finally {
            Stream.of(loggers).forEach((logger -> ((Logger)logger).detachAppender(testAppender)));
        }
        Assertions.assertFalse(containsUnexpectedDirectory[0], "Shouldn't find reference to old directory in logs");
        Assertions.assertTrue(containsExpectedDirectory[0], "Should find reference to new directory in logs");
    }
}
