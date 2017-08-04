package com.marklogic.hub.job;

import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.spring.batch.columnmap.ColumnMapSerializer;
import com.marklogic.spring.batch.columnmap.DefaultStaxColumnMapSerializer;
import com.marklogic.spring.batch.columnmap.XmlStringColumnMapSerializer;
import com.marklogic.spring.batch.item.processor.ColumnMapProcessor;
import com.marklogic.spring.batch.item.reader.AllTablesItemReader;
import com.marklogic.spring.batch.item.writer.MarkLogicItemWriter;
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

@EnableBatchProcessing
@Import(value = {com.marklogic.spring.batch.config.MarkLogicBatchConfiguration.class })
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
        @Value("#{jobParameters['output_collections']}") String[] collections) {

        AllTablesItemReader reader = new AllTablesItemReader(dataSource);

        // Processor - this is a very basic implementation for converting a column map to an XML string
        ColumnMapSerializer serializer = new XmlStringColumnMapSerializer();
        ItemProcessor processor = new AllTablesColumnMapProcessor(serializer);

        ItemWriter<DocumentWriteOperation> writer = new MarkLogicItemWriter(databaseClientProvider.getDatabaseClient());

        return stepBuilderFactory.get("step1")
            .<Map<String, Object>, DocumentWriteOperation>chunk(10)
            .reader(reader)
            .processor(processor)
            .writer(writer)
            .build();
    }

}
