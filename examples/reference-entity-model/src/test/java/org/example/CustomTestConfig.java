package org.example;

import com.marklogic.hub.ext.junit5.DatabasePreparer;
import com.marklogic.hub.ext.junit5.HubConfigManager;
import com.marklogic.hub.ext.junit5.HubDatabasePreparer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

/**
 * This configuration class is used by CustomRunCustomerFlowTest to wire up marklogic-data-hub-junit5 support classes
 * in a Spring container. The intent of that test is to show you how to use marklogic-data-hub-junit5 without being
 * forced to extend a base test class. You are thus free to customize this class as you see fit.
 */
@Configuration
@PropertySource(
    name = "customPropertySource",
    value = {"file:gradle.properties", "file:gradle-local.properties"},
    ignoreResourceNotFound = false
)
public class CustomTestConfig {

    @Autowired
    Environment environment;

    /**
     * HubConfigManager is a convenience class for providing access to a HubConfig object based on a Spring
     * Environment, which most significantly supports loading properties from a variety of locations.
     *
     * @return
     */
    @Bean
    public HubConfigManager hubConfigManager() {
        return new HubConfigManager(environment);
    }

    /**
     * The PrepareDatabasesTestExecutionListener class depends on an instance of DatabasePreparer being available,
     * which handles preparing the staging, final, and job databases before a test method is run.
     */
    @Bean
    public DatabasePreparer databasePreparer() {
        return new HubDatabasePreparer(hubConfigManager().getHubClient());
    }
}
