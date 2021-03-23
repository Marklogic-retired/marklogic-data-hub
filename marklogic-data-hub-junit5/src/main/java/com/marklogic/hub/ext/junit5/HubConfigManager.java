package com.marklogic.hub.ext.junit5;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.DatabaseClientProvider;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import org.springframework.core.env.Environment;

/**
 * This will hold onto an instance of HubConfig, which is useful for tests that don't need to change users.
 * If a test does change a user via runAs, then it's up to the test to reset that back to the original user if
 * needed.
 */
public class HubConfigManager implements DatabaseClientProvider {

    private Environment environment;
    private HubConfigImpl hubConfig;
    private HubClient hubClient;

    public HubConfigManager(Environment environment) {
        this.environment = environment;
    }

    /**
     * @return a new HubConfigImpl instance based on the Spring environment properties
     */
    public HubConfigImpl newHubConfig() {
        return runAsUser(null, null);
    }

    /**
     * @param username
     * @param password
     * @return a new HubConfigImpl instance based on the Spring environment properties and the given username
     * and password, which, if not null, are used for mlUsername/mlPassword
     */
    public HubConfigImpl runAsUser(String username, String password) {
        this.hubClient = null;
        this.hubConfig = new HubConfigImpl(newHubProject());
        this.hubConfig.applyProperties(propertyName -> {
            switch (propertyName) {
                case "mlUsername":
                    return username != null ? username : environment.getProperty(propertyName);
                case "mlPassword":
                    return password != null ? password : environment.getProperty(propertyName);
                default:
                    return environment.getProperty(propertyName);
            }
        }, null);
        return this.hubConfig;
    }

    public HubConfigImpl getHubConfig() {
        if (hubConfig == null) {
            newHubConfig();
        }
        return hubConfig;
    }

    /**
     * Assumes that the directory in which tests are being run is also the DHF project directory.
     *
     * @return
     */
    protected HubProjectImpl newHubProject() {
        HubProjectImpl hubProject = new HubProjectImpl();
        hubProject.createProject(".");
        return hubProject;
    }

    public HubClient getHubClient() {
        if (hubClient == null) {
            hubClient = getHubConfig().newHubClient();
        }
        return hubClient;
    }

    /**
     * For marklogic-junit5 functionality that depends on a DatabaseClientProvider, this class implements that
     * interface by returning a DatabaseClient for the final database.
     *
     * @return
     */
    @Override
    public DatabaseClient getDatabaseClient() {
        return getHubClient().getFinalClient();
    }
}

