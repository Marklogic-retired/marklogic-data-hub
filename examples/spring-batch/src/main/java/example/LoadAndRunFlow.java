package example;

import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.helper.DatabaseClientProvider;
import com.marklogic.hub.HubConfig;
import com.marklogic.spring.batch.hub.AbstractMarkLogicBatchConfig;
import com.marklogic.spring.batch.hub.FlowConfig;
import com.marklogic.spring.batch.hub.StagingConfig;
import com.marklogic.spring.batch.item.processor.ResourceToDocumentWriteOperationItemProcessor;
import com.marklogic.spring.batch.item.reader.EnhancedResourcesItemReader;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;

import java.util.List;

@Import({ StagingConfig.class, FlowConfig.class })
public class LoadAndRunFlow extends AbstractMarkLogicBatchConfig implements EnvironmentAware {

    private Environment env;

    private final String JOB_NAME = "yourJob";

    @Bean
    public Job job(Step step) {
        return jobBuilderFactory.get(JOB_NAME).start(step).build();
    }

    // This provider gives us the connection info for talking to MarkLogic
    @Autowired
    private DatabaseClientProvider databaseClientProvider;

    @Bean
    @JobScope
    public Step step(
        @Value("#{jobParameters['input_file_path']}") String inputFilePath,
        @Value("#{jobParameters['input_file_pattern']}") String inputFilePattern,
        @Value("#{jobParameters['entity_name']}") String entityName,
        @Value("#{jobParameters['flow_name']}") String flowName) {


        GenericDocumentManager docMgr = databaseClientProvider.getDatabaseClient().newDocumentManager();

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
                runFlow.addParameter("entity-name", entityName);
                runFlow.addParameter("flow-name", flowName);
                docMgr.write(batch, runFlow);
            }
        };

        return stepBuilderFactory.get("step1")
            .<Resource, DocumentWriteOperation>chunk(getChunkSize())
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
