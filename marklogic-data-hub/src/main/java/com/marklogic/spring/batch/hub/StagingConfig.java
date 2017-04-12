package com.marklogic.spring.batch.hub;

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
        DatabaseClientConfig config = hubConfig.getStagingDbClientConfig();
        logger.info("Connecting to MarkLogic via: " + config);
        return new BatchDatabaseClientProvider(config);
    }
}
