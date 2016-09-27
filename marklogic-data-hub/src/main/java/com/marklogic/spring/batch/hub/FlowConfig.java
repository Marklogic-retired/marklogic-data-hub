package com.marklogic.spring.batch.hub;

import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.hub.HubConfig;
import com.marklogic.spring.batch.core.repository.dao.MarkLogicExecutionContextDao;
import com.marklogic.spring.batch.core.repository.dao.MarkLogicJobExecutionDao;
import com.marklogic.spring.batch.core.repository.dao.MarkLogicJobInstanceDao;
import com.marklogic.spring.batch.core.repository.dao.MarkLogicStepExecutionDao;
import com.marklogic.spring.batch.jdbc.support.incrementer.UriIncrementer;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.explore.support.SimpleJobExplorer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.dao.ExecutionContextDao;
import org.springframework.batch.core.repository.dao.JobExecutionDao;
import org.springframework.batch.core.repository.dao.JobInstanceDao;
import org.springframework.batch.core.repository.dao.StepExecutionDao;
import org.springframework.batch.core.repository.support.SimpleJobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlowConfig extends LoggingObject {

    @Autowired
    private DatabaseClientProvider databaseClientProvider;


    @Autowired
    protected HubConfig hubConfig;

    @Bean
    public JobInstanceDao jobInstanceDao() throws Exception {
        MarkLogicJobInstanceDao jobInstanceDao = new MarkLogicJobInstanceDao(databaseClientProvider.getDatabaseClient());
        jobInstanceDao.setIncrementer(new UriIncrementer());
        return jobInstanceDao;
    }

    @Bean
    public JobExecutionDao jobExecutionDao() throws Exception {
        MarkLogicJobExecutionDao dao = new MarkLogicJobExecutionDao(databaseClientProvider.getDatabaseClient());
        dao.setIncrementer(new UriIncrementer());
        return dao;
    }

    @Bean
    public StepExecutionDao stepExecutionDao() throws Exception {
        MarkLogicStepExecutionDao stepExecutionDao = new MarkLogicStepExecutionDao(databaseClientProvider.getDatabaseClient(), jobExecutionDao());
        stepExecutionDao.setJobExecutionDao(jobExecutionDao());
        stepExecutionDao.setIncrementer(new UriIncrementer());
        return stepExecutionDao;
    }

    @Bean
    public ExecutionContextDao executionContextDao() throws Exception {
        return new MarkLogicExecutionContextDao(jobExecutionDao(), stepExecutionDao());
    }

    @Bean
    public JobRepository jobRepository() throws Exception {
        return new SimpleJobRepository(jobInstanceDao(), jobExecutionDao(), stepExecutionDao(), executionContextDao());
    }

    @Bean
    public JobExplorer jobExplorer() throws Exception {
        return new SimpleJobExplorer(jobInstanceDao(), jobExecutionDao(), stepExecutionDao(), executionContextDao());
    }

}
