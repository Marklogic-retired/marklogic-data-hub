package com.marklogic.hub.job;

import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.spring.batch.columnmap.ColumnMapSerializer;
import com.marklogic.spring.batch.columnmap.XmlStringColumnMapSerializer;
import com.marklogic.spring.batch.item.reader.AllTablesItemReader;
import com.marklogic.spring.batch.item.writer.DataHubItemWriter;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

import javax.sql.DataSource;
import java.util.Map;
import java.util.UUID;

@EnableBatchProcessing
@Import(value = {com.marklogic.spring.batch.config.MarkLogicBatchConfiguration.class})
public class SqlDbToHubJobConfig {

    private final String JOB_NAME = "sqlDbToHubJob";

    @Bean
    public Job job(JobBuilderFactory jobBuilderFactory, Step step) {
        return jobBuilderFactory.get(JOB_NAME).start(step).build();
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

        // Processor - this is a very basic implementation for converting a column map to an XML string
        ColumnMapSerializer serializer = new XmlStringColumnMapSerializer();
        ItemProcessor processor = new AllTablesColumnMapProcessor(serializer);

        // Uncomment to push data directly into MarkLogic without going through DataHub
        //ItemWriter<DocumentWriteOperation> writer = new MarkLogicItemWriter(databaseClientProvider.getDatabaseClient());

        ItemWriter writer = new DataHubItemWriter(databaseClientProvider.getDatabaseClient(),
            entity,
            DataHubItemWriter.FlowType.INPUT,
            flow,
            jobId);

        return stepBuilderFactory.get("step1")
            .<Map<String, Object>, DocumentWriteOperation>chunk(10)
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .build();
    }

}
