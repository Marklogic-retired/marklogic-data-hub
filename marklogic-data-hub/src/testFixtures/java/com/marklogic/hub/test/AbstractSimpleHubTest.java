package com.marklogic.hub.test;

import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import org.junit.jupiter.api.BeforeEach;

import java.io.File;
import java.util.HashMap;
import java.util.Properties;

/**
 * Subprojects that wish to reuse these testFixtures module can likely have their tests extend this class.
 */
public abstract class AbstractSimpleHubTest extends AbstractHubTest {

    private HubConfigImpl hubConfig;
    private HubClient hubClient;
    private HubProject testHubProject;
    private String testProjectDirectory = "build/hub-test";

    @BeforeEach
    void beforeEachSimpleHubTest() {
        testHubProject = new HubProjectImpl();
        testHubProject.createProject(testProjectDirectory);
        testHubProject.init(new HashMap<>());
        hubConfig = new HubConfigImpl(testHubProject);
        resetHubProject();
        runAsDataHubDeveloper();
    }

    @Override
    protected HubClient getHubClient() {
        if (hubClient == null) {
            hubClient = getHubConfig().newHubClient();
        }
        return hubClient;
    }

    @Override
    protected HubClient doRunAsUser(String username, String password) {
        Properties props = new Properties();
        props.setProperty("mlUsername", username);
        props.setProperty("mlPassword", password);
        hubConfig.applyProperties(props);
        hubClient = null;
        return getHubClient();
    }

    @Override
    protected HubConfigImpl getHubConfig() {
        return hubConfig;
    }

    @Override
    protected File getTestProjectDirectory() {
        return new File(testProjectDirectory);
    }
}
