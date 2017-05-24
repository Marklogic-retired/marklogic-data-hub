package example;

import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.spring.batch.item.processor.ResourceToDocumentWriteOperationItemProcessor;
import com.marklogic.spring.batch.item.reader.EnhancedResourcesItemReader;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.JobBuilderFactory;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.configuration.annotation.StepBuilderFactory;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import com.marklogic.hub.HubConfig;

import java.util.*;

@EnableBatchProcessing
public class LoadAndRunFlow implements EnvironmentAware {

    private Environment env;

    private final String JOB_NAME = "yourJob";

    @Bean
    public Job job(JobBuilderFactory jobBuilderFactory, Step step) {
        return jobBuilderFactory.get(JOB_NAME).start(step).build();
    }

    @Bean
    @JobScope
    public Step step(
            StepBuilderFactory stepBuilderFactory,
            DatabaseClientProvider databaseClientProvider,
            @Value("#{jobParameters['project_dir']}") String projectDir,
            @Value("#{jobParameters['input_file_path']}") String inputFilePath,
            @Value("#{jobParameters['input_file_pattern']}") String inputFilePattern,
            @Value("#{jobParameters['entity_name']}") String entityName,
            @Value("#{jobParameters['flow_name']}") String flowName,
            @Value("#{jobParameters['output_collections']}") String[] collections) {

        HubConfig hubConfig = HubConfig.hubFromEnvironment(projectDir, "local");

        GenericDocumentManager docMgr = hubConfig.newStagingClient().newDocumentManager();

        ItemProcessor<Resource, DocumentWriteOperation> processor = new ResourceToDocumentWriteOperationItemProcessor();
        ItemWriter<DocumentWriteOperation> writer = new ItemWriter<DocumentWriteOperation>() {
            @Override
            public void write(List<? extends DocumentWriteOperation> items) throws Exception {
                DocumentWriteSet batch = docMgr.newWriteSet();
                for (DocumentWriteOperation item : items) {
                    String uri = item.getUri();
                    batch.add(uri, item.getMetadata(), item.getContent());
                }
                ServerTransform runFlow = new ServerTransform("run-flow");
                runFlow.addParameter("job-id", UUID.randomUUID().toString());
                runFlow.addParameter("entity", entityName);
                runFlow.addParameter("flow", flowName);
                docMgr.write(batch, runFlow);
            }
        };

        return stepBuilderFactory.get("step1")
            .<Resource, DocumentWriteOperation>chunk(10)
            .reader(new EnhancedResourcesItemReader(inputFilePath, inputFilePattern))
            .processor(processor)
            .writer(writer)
            .build();
    }


    @Override
    public void setEnvironment(Environment environment) {
        this.env = environment;
    }

}
