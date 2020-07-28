package com.marklogic.hub_unit_test;

import com.marklogic.bootstrap.Installer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.DatabaseClientConfig;
import com.marklogic.client.ext.DefaultConfiguredDatabaseClientFactory;
import com.marklogic.client.ext.helper.DatabaseClientProvider;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.impl.HubConfigImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration class that defines the DatabaseClientProvider needed by AbstractSpringMarkLogicTest.
 * <p>
 * This isn't in the "com.marklogic.hub" package so that it's not picked up by Spring ComponentScan annotations that
 * scan that package.
 */
@Configuration
public class TestConfig {

    @Autowired
    HubConfigImpl hubConfig;

    @Bean
    public DatabaseClientProvider databaseClientProvider() {
        return new HubConfigDatabaseClientProvider(hubConfig);
    }
}

class HubConfigDatabaseClientProvider implements DatabaseClientProvider {

    private HubConfigImpl hubConfig;
    private boolean loadedTestModules = false;

    public HubConfigDatabaseClientProvider(HubConfigImpl hubConfig) {
        this.hubConfig = hubConfig;
    }

    /**
     * This delays instantiation of a DatabaseClientConfig until after HubConfig has been initialized.
     *
     * @return
     */
    @Override
    public DatabaseClient getDatabaseClient() {
        if (!loadedTestModules) {
            Installer.loadTestModules(hubConfig);
            loadedTestModules = true;
        }

        DatabaseClientConfig config = new DatabaseClientConfig(hubConfig.getHost(), hubConfig.getPort(DatabaseKind.FINAL),
            hubConfig.getMlUsername(), hubConfig.getMlPassword());
        return new DefaultConfiguredDatabaseClientFactory().newDatabaseClient(config);
    }
}
