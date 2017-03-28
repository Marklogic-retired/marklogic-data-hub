package com.marklogic.spring.batch.hub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.*;
import org.springframework.batch.core.*;
import org.springframework.batch.core.configuration.annotation.JobScope;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.support.PassThroughItemProcessor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.task.SimpleAsyncTaskExecutor;

import java.io.IOException;
import java.util.List;

@Configuration
public class RunHarmonizeFlowConfig extends AbstractMarkLogicBatchConfig {

    @Autowired
    private Flow flow;

    @Autowired(required = false)
    FlowStatusListener statusListener;

    @Autowired(required = false)
    FlowFinishedListener finishedListener;

    @Autowired(required = false)
    FlowItemCompleteListener flowItemCompleteListener;

    @Autowired(required = false)
    FlowItemFailureListener flowItemFailureListener;

    private int totalItems = 0;
    private int completedItems = 0;
    private long jobId;

    @Bean
    public Job job(@Qualifier("step1") Step step1) {
        return jobBuilderFactory.get("Harmonize")
            .start(step1)
            .preventRestart()
            .listener(new JobExecutionListener() {
            @Override
            public void beforeJob(JobExecution jobExecution) {
                jobId = jobExecution.getJobId();
            }

            @Override
            public void afterJob(JobExecution jobExecution) {
                if (statusListener != null) {
                    statusListener.onStatusChange(jobId, 100, "");
                }

                if (finishedListener != null) {
                    finishedListener.onFlowFinished();
                }
            }
        }).build();
    }

    @Bean
    @JobScope
    protected Step step1(
        @Value("#{jobParameters['batchSize']}") int batchSize,
        @Value("#{jobParameters['threadCount']}") int threadCount,
        @Value("#{jobParameters['targetDatabase']}") String targetDatabase) {

        Collector c = flow.getCollector();
        if (c instanceof ServerCollector) {
            ((ServerCollector)c).setClient(getDatabaseClient());
        }

        ItemProcessor<String, String> ip = new PassThroughItemProcessor<>();
        SimpleAsyncTaskExecutor taskExecutor = new SimpleAsyncTaskExecutor();
        taskExecutor.setConcurrencyLimit(threadCount);


        return stepBuilderFactory.get("step1")
            .<String, String>chunk(batchSize)
            .reader(new CollectorReader(c, flow.getOptions()))
            .processor(ip)
            .listener(new ItemWriteListener<String>() {
                @Override
                public void beforeWrite(List<? extends String> items) {

                }

                @Override
                public void afterWrite(List<? extends String> items) {
                    completedItems += items.size();
                    if (statusListener != null) {
                        int percentComplete = 0;
                        if (totalItems > 0) {
                            percentComplete = (int)(((float)completedItems / (float) totalItems) * 100.0);
                        }
                        statusListener.onStatusChange(jobId, percentComplete, "");
                    }
                }

                @Override
                public void onWriteError(Exception exception, List<? extends String> items) {

                }
            })
            .writer(new FlowWriter(getDatabaseClient(), jobId, targetDatabase, flow, flow.getOptions()))
            .listener(new ChunkListener() {
                @Override
                public void beforeChunk(ChunkContext context) {
                    totalItems = context.getStepContext().getStepExecution().getExecutionContext().getInt("totalItems");
                }

                @Override
                public void afterChunk(ChunkContext context) {
                    String flowResponse = (String)context.getAttribute("flowResponse");
                    if (flowResponse == null) {
                        return;
                    }
                    ObjectMapper objectMapper = new ObjectMapper();
                    try {
                        RunFlowResponse response = objectMapper.readValue(flowResponse, RunFlowResponse.class);
                        if (flowItemCompleteListener != null) {
                            response.completedItems.forEach((String item) -> {
                                flowItemCompleteListener.processCompletion(jobId, item);
                            });
                        }

                        if (flowItemFailureListener != null) {
                            response.failedItems.forEach((String item) -> {
                                flowItemFailureListener.processFailure(jobId, item);
                            });
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }

                }

                @Override
                public void afterChunkError(ChunkContext context) {

                }
            })
            .taskExecutor(taskExecutor)
            .build();
    }
}
