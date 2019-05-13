package com.marklogic.hub;

import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.helper.DatabaseClientProvider;
import com.marklogic.client.ext.spring.SimpleDatabaseClientProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;

/**
 * Spring configuration class that defines a connection to the final REST server in the test project.
 */
@Configuration
@PropertySource(
    value = {"file:gradle.properties", "file:gradle-local.properties"},
    ignoreResourceNotFound = true
)
public class TestConfig {

    @Value("${mlUsername}")
    private String username;

    @Value("${mlPassword}")
    private String password;

    @Value("${mlHost:localhost}")
    private String host;

    @Value("${mlFinalPort:8011}")
    private Integer finalPort;

    /**
     * Has to be static so that Spring instantiates it first.
     */
    @Bean
    public static PropertySourcesPlaceholderConfigurer propertyConfigurer() {
        PropertySourcesPlaceholderConfigurer c = new PropertySourcesPlaceholderConfigurer();
        c.setIgnoreResourceNotFound(true);
        return c;
    }

    /**
     * AbstractSpringMarkLogicTest depends on an instance of DatabaseClientProvider.
     *
     * @return
     */
    @Bean
    public DatabaseClientProvider databaseClientProvider() {
        return new SimpleDatabaseClientProvider(
            new DatabaseClientConfig(host, finalPort, username, password)
        );
    }
}
