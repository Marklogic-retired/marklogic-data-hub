package com.marklogic.spring.batch.hub;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.spring.batch.Options;
import com.marklogic.spring.batch.config.support.JobRepositoryConfigurer;
import org.springframework.batch.core.configuration.annotation.BatchConfigurer;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

/**
 * Abstract class for a Spring Batch Configuration class that depends on a MarkLogic DatabaseClient.
 * The assumption is most MarkLogic Spring Batch config classes will need at least a JobBuilderFactory,
 * a StepBuilderFactory, and a DatabaseClient.
 */
@EnableBatchProcessing
public abstract class AbstractMarkLogicBatchConfig extends LoggingObject implements ApplicationContextAware {

    protected ApplicationContext ctx;

    @Autowired
    protected JobBuilderFactory jobBuilderFactory;

    @Autowired
    protected StepBuilderFactory stepBuilderFactory;

    /**
     * Note that your subclass can introduce additional DatabaseClientProvider beans - just need to
     * give them different names, and then clients need to specify which ones they want.
     */
    @Autowired
    protected DatabaseClientProvider databaseClientProvider;

    @Autowired
    private Environment env;

    /**
     * Convenience method for retrieving the "main" DatabaseClient instance.
     *
     * @return
     */
    protected DatabaseClient getDatabaseClient() {
        return databaseClientProvider.getDatabaseClient();
    }

    @Bean
    public BatchConfigurer jobRepositoryConfigurer() {
        return new JobRepositoryConfigurer();
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.ctx = applicationContext;
    }

    public Integer getChunkSize() {
        String val = env.getProperty(Options.CHUNK_SIZE);
        return val != null ? Integer.parseInt(val) : 10;
    }
}
