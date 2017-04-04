package com.marklogic.spring.batch.hub;

import org.springframework.batch.core.configuration.BatchConfigurationException;
import org.springframework.batch.core.configuration.annotation.BatchConfigurer;
import org.springframework.batch.core.explore.JobExplorer;
import org.springframework.batch.core.explore.support.MapJobExplorerFactoryBean;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.launch.support.SimpleJobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.repository.support.MapJobRepositoryFactoryBean;
import org.springframework.batch.support.transaction.ResourcelessTransactionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;

import javax.annotation.PostConstruct;

@Component
public class HubBatchConfigurer implements BatchConfigurer {

    private JobRepository jobRepository;

    private JobExplorer jobExplorer;

    private JobLauncher jobLauncher;
    private PlatformTransactionManager transactionManager;

    @Autowired(required = false)
    private TaskExecutor taskExecutor;

    protected HubBatchConfigurer() {}

    @PostConstruct
    public void initialize() throws Exception {
        if(this.transactionManager == null) {
            this.transactionManager = new ResourcelessTransactionManager();
        }

        MapJobRepositoryFactoryBean jobRepositoryFactory = new MapJobRepositoryFactoryBean(this.transactionManager);
        jobRepositoryFactory.afterPropertiesSet();
        jobRepositoryFactory.clear();
        this.jobRepository = jobRepositoryFactory.getObject();

        MapJobExplorerFactoryBean jobExplorerFactory = new MapJobExplorerFactoryBean(jobRepositoryFactory);
        jobExplorerFactory.afterPropertiesSet();
        this.jobExplorer = jobExplorerFactory.getObject();

        SimpleJobLauncher jbl = new SimpleJobLauncher();
        jbl.setJobRepository(getJobRepository());
        if (taskExecutor != null) {
            jbl.setTaskExecutor(taskExecutor);
        }
        try {
            jbl.afterPropertiesSet();
        } catch (Exception e) {
            throw new BatchConfigurationException(e);
        }
        this.jobLauncher = jbl;
    }

    @Override
    public JobRepository getJobRepository() throws Exception {
        return jobRepository;
    }

    @Override
    public PlatformTransactionManager getTransactionManager() throws Exception {
        return transactionManager;
    }

    @Override
    public JobLauncher getJobLauncher() throws Exception {
        return jobLauncher;
    }

    @Override
    public JobExplorer getJobExplorer() throws Exception {
        return jobExplorer;
    }

}
