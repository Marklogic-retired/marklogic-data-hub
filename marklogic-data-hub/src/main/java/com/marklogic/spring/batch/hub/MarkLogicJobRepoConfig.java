package com.marklogic.spring.batch.hub;

import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.helper.DatabaseClientConfig;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.spring.batch.config.support.BatchDatabaseClientProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MarkLogicJobRepoConfig extends FlowConfig {

    @Bean
    public DatabaseClientProvider databaseClientProvider() {
        DatabaseClientConfig config = new DatabaseClientConfig(
            hubConfig.host,
            hubConfig.jobPort,
            hubConfig.adminUsername,
            hubConfig.adminPassword
        );

        config.setDatabase(hubConfig.jobDbName);
        config.setAuthentication(DatabaseClientFactory.Authentication.valueOfUncased(hubConfig.authMethod.toLowerCase()));

        logger.info("Connecting to MarkLogic via: " + config);
        return new BatchDatabaseClientProvider(config);
    }

    @Bean
    public DatabaseClientProvider jobRepositoryDatabaseClientProvider() {
        DatabaseClientConfig config = new DatabaseClientConfig(
            hubConfig.host,
            hubConfig.jobPort,
            hubConfig.adminUsername,
            hubConfig.adminPassword
        );

        config.setDatabase(hubConfig.jobDbName);
        config.setAuthentication(DatabaseClientFactory.Authentication.valueOfUncased(hubConfig.authMethod.toLowerCase()));

        logger.info("Connecting to MarkLogic JobRepository via: " + config);
        return new BatchDatabaseClientProvider(config);
    }

}
