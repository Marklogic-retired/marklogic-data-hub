package com.marklogic.spring.batch.hub;

import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.client.helper.DatabaseClientConfig;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.spring.batch.config.support.BatchDatabaseClientProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;

@Configuration
public class StagingConfig extends LoggingObject {

    @Autowired
    HubConfig hubConfig;

    @Bean
    public TaskExecutor taskExecutor() {
        return new SimpleAsyncTaskExecutor();
    }

    @Bean
    public DatabaseClientProvider databaseClientProvider() {
        DatabaseClientConfig config = new DatabaseClientConfig(
            hubConfig.host,
            hubConfig.stagingPort,
            hubConfig.username,
            hubConfig.password
        );

        config.setDatabase(hubConfig.stagingDbName);
        config.setAuthentication(DatabaseClientFactory.Authentication.valueOfUncased(hubConfig.authMethod.toLowerCase()));

        logger.info("Connecting to MarkLogic via: " + config);
        return new BatchDatabaseClientProvider(config);
    }

    @Bean
    public DatabaseClientProvider jobRepositoryDatabaseClientProvider() {
        DatabaseClientConfig config = new DatabaseClientConfig(
            hubConfig.host,
            hubConfig.jobPort,
            hubConfig.username,
            hubConfig.password
        );

        config.setDatabase(hubConfig.jobDbName);
        config.setAuthentication(DatabaseClientFactory.Authentication.valueOfUncased(hubConfig.authMethod.toLowerCase()));

        logger.info("Connecting to MarkLogic JobRepository via: " + config);
        return new BatchDatabaseClientProvider(config);
    }
}
