package com.marklogic.hub.cloud.aws.glue;

import com.marklogic.hub.HubClient;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.test.AbstractHubTest;
import org.junit.jupiter.api.BeforeEach;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

/**
 * Base class for all glue-connector tests. This assumes that we want to run every test as a data-hub-operator user.
 */
public class AbstractGlueConnectorTest extends AbstractHubTest {

    private HubConfigImpl hubConfig;
    private HubClient hubClient;

    protected Properties hubProperties;

    @BeforeEach
    void beforeEachTest() {
        hubConfig = new HubConfigImpl();
        resetDatabases();
        runAsDataHubOperator();
    }

    @Override
    protected HubClient getHubClient() {
        return hubClient;
    }

    @Override
    protected HubConfigImpl getHubConfig() {
        return hubConfig;
    }

    @Override
    protected File getTestProjectDirectory() {
        // We don't have any need for a HubProject within the connector
        return null;
    }

    @Override
    protected HubConfigImpl runAsUser(String username, String password) {
        hubProperties = new Properties();
        // Assumes localhost for now; this will be improved once this project is developed on the 5.4 branch
        hubProperties.setProperty("mlHost", "localhost");
        hubProperties.setProperty("mlUsername", username);
        hubProperties.setProperty("mlPassword", password);
        this.hubConfig = HubConfigImpl.withProperties(hubProperties);
        this.hubClient = hubConfig.newHubClient();
        return hubConfig;
    }

    protected Map<String, String> getHubPropertiesAsMap() {
        Map<String, String> params = new HashMap<>();
        hubProperties.keySet().forEach(key -> params.put((String) key, hubProperties.getProperty((String) key)));
        return params;
    }
}
