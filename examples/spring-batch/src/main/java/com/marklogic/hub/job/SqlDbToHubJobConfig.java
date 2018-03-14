package com.marklogic.hub.job;

import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.ext.helper.DatabaseClientProvider;
import com.marklogic.spring.batch.columnmap.ColumnMapSerializer;
import com.marklogic.spring.batch.columnmap.XmlStringColumnMapSerializer;
import com.marklogic.spring.batch.item.rdbms.AllTablesItemReader;
import com.marklogic.spring.batch.item.writer.DataHubItemWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobExecutionListener;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.*;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.PropertySource;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@EnableBatchProcessing
@Import(value = {
    com.marklogic.spring.batch.config.MarkLogicBatchConfiguration.class,
    com.marklogic.spring.batch.config.MarkLogicConfiguration.class})
@PropertySource("classpath:job.properties")
public class SqlDbToHubJobConfig {

    protected final Logger logger = LoggerFactory.getLogger(getClass());
    private final String JOB_NAME = "sqlDbToHubJob";

    @Bean(name = JOB_NAME)
    public Job job(JobBuilderFactory jobBuilderFactory, Step step) {
        JobExecutionListener listener = new JobExecutionListener() {
            @Override
            public void beforeJob(JobExecution jobExecution) {
                logger.info("BEFORE JOB");
            }

            @Override
            public void afterJob(JobExecution jobExecution) {
                logger.info("AFTER JOB");
            }
        };

        return jobBuilderFactory.get(JOB_NAME)
            .start(step)
            .incrementer(new RunIdIncrementer())
            .listener(listener)
            .build();
    }

    @Bean
    @JobScope
    public Step step(
        StepBuilderFactory stepBuilderFactory,
        DataSource dataSource,
        DatabaseClientProvider databaseClientProvider,
        @Value("#{jobParameters['hubJobId']}") String jobId,
        @Value("#{jobParameters['entity']}") String entity,
        @Value("#{jobParameters['flow']}") String flow) {

        AllTablesItemReader reader = new AllTablesItemReader(dataSource);
        Set<String> excludeTableNameSet = new HashSet<String>();
        excludeTableNameSet.add("INVOICE");
        excludeTableNameSet.add("ITEM");
        excludeTableNameSet.add("PRODUCT");
        reader.setExcludeTableNames(excludeTableNameSet);

        // Processor - this is a very basic implementation for converting a column map to an XML string
        ColumnMapSerializer serializer = new XmlStringColumnMapSerializer();
        RowItemProcessor processor = new RowItemProcessor(serializer);

        ItemWriter writer = new DataHubItemWriter(databaseClientProvider.getDatabaseClient(),
            entity,
            flow,
            jobId);

        return stepBuilderFactory.get("step1")
            .<Map<String, Object>, DocumentWriteOperation>chunk(10)
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .build();
    }

    @Bean
    @Qualifier("customerDatabase")
    public DataSource dataSource(
        @Value("${jdbc.driver:null}") String jdbcDriverClassName,
        @Value("${jdbc.url:null}") String jdbcUrl,
        @Value("${jdbc.username:sa}") String username,
        @Value("${jdbc.password:sa}") String password

    ) {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName(jdbcDriverClassName);
        dataSource.setUrl(jdbcUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        return dataSource;
    }

    @Component
    public class BasicBatchConfigurer extends DefaultBatchConfigurer {

        @Override
        public void setDataSource(DataSource dataSource) {

        }
    }


}
