package com.marklogic.hub.ext.junit5;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;

@Configuration
@PropertySource(
    name = "hubPropertySource",
    value = {"file:gradle.properties", "file:gradle-local.properties"},
    ignoreResourceNotFound = true
)
public class HubTestConfig {

    @Autowired
    Environment environment;

    @Bean
    public HubConfigManager hubConfigManager() {
        return new HubConfigManager(environment);
    }

    @Bean
    public DatabasePreparer databasePreparer() {
        return new HubDatabasePreparer(hubConfigManager().getHubClient());
    }

}
