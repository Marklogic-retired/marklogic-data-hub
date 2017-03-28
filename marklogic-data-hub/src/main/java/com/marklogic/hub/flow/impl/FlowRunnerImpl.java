package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.hub.flow.*;
import com.marklogic.spring.batch.hub.FlowConfig;
import com.marklogic.spring.batch.hub.RunHarmonizeFlowConfig;
import com.marklogic.spring.batch.hub.StagingConfig;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import java.util.*;
import java.util.concurrent.TimeUnit;

public class FlowRunnerImpl implements FlowRunner {

    private static final int DEFAULT_BATCH_SIZE = 100;
    private static final int DEFAULT_THREAD_COUNT = 4;
    private Flow flow;
    private int batchSize = DEFAULT_BATCH_SIZE;
    private int threadCount = DEFAULT_THREAD_COUNT;
    private HubDatabase sourceDatabase = HubDatabase.STAGING;
    private HubDatabase destinationDatabase = HubDatabase.FINAL;
    private Map<String, Object> options;

    private List<FlowItemCompleteListener> flowItemCompleteListeners = new ArrayList<>();
    private List<FlowItemFailureListener> flowItemFailureListeners = new ArrayList<>();
    private List<FlowStatusListener> flowStatusListeners = new ArrayList<>();
    private List<FlowFinishedListener> flowFinishedListeners = new ArrayList<>();

    private HubConfig hubConfig;
    private Thread runningThread = null;

    public FlowRunnerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public FlowRunner withFlow(Flow flow) {
        this.flow = flow;
        return this;
    }

    @Override
    public FlowRunner withBatchSize(int batchSize) {
        this.batchSize = batchSize;
        return this;
    }

    @Override
    public FlowRunner withThreadCount(int threadCount) {
        this.threadCount = threadCount;
        return this;
    }

    @Override
    public FlowRunner withSourceDatabase(HubDatabase sourceDatabase) {
        this.sourceDatabase = sourceDatabase;
        return this;
    }

    @Override
    public FlowRunner withDestinationDatabase(HubDatabase destinationDatabase) {
        this.destinationDatabase = destinationDatabase;
        return this;
    }

    @Override
    public FlowRunner withOptions(Map<String, Object> options) {
        this.options = options;
        return this;
    }

    @Override
    public FlowRunner onItemComplete(FlowItemCompleteListener listener) {
        this.flowItemCompleteListeners.add(listener);
        return this;
    }

    @Override
    public FlowRunner onItemFailed(FlowItemFailureListener listener) {
        this.flowItemFailureListeners.add(listener);
        return this;
    }

    @Override
    public FlowRunner onStatusChanged(FlowStatusListener listener) {
        this.flowStatusListeners.add(listener);
        return this;
    }

    @Override
    public FlowRunner onFinished(FlowFinishedListener listener) {
        this.flowFinishedListeners.add(listener);
        return this;
    }

    @Override
    public void awaitCompletion() {
        try {
            awaitCompletion(Long.MAX_VALUE, TimeUnit.DAYS);
        }
        catch(InterruptedException e) {}
    }

    @Override
    public void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException {
        runningThread.join(unit.convert(timeout, TimeUnit.MILLISECONDS));
    }

    @Override
    public JobExecution run() {
        JobExecution result = null;
        if (options == null) {
            options = new HashMap<>();
        }
        flow.setOptions(options);
        try {
            DatabaseClient srcClient;
            if (sourceDatabase.equals(HubDatabase.STAGING)) {
                srcClient = hubConfig.newStagingClient();
            }
            else {
                srcClient = hubConfig.newFinalClient();
            }

            String targetDatabase;
            if (destinationDatabase.equals(HubDatabase.STAGING)) {
                targetDatabase = hubConfig.stagingDbName;
            }
            else {
                targetDatabase = hubConfig.finalDbName;
            }

            ConfigurableApplicationContext ctx = buildApplicationContext(flow, srcClient);

            JobParameters params = buildJobParameters(flow, batchSize, threadCount, targetDatabase);
            JobLauncher launcher = ctx.getBean(JobLauncher.class);
            Job job = ctx.getBean(Job.class);
            result = launcher.run(job, params);
        } catch (Exception e) {
            e.printStackTrace();
        }

        runningThread = new Thread(new Runnable() {
            private boolean isFinished = false;

            @Override
            public void run() {
                flowFinishedListeners.add(() -> {
                    isFinished = true;
                });

                while(true) {
                    if (isFinished) {
                        break;
                    }
                    Thread.yield();
                }

            }

        });

        runningThread.start();

        return result;
    }

    private ConfigurableApplicationContext buildApplicationContext(Flow flow, DatabaseClient srcClient) {
        if (options == null) {
            options = new HashMap<>();
        }
        AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext();
        ctx.register(StagingConfig.class);
        ctx.register(FlowConfig.class);
        ctx.register(RunHarmonizeFlowConfig.class);
        ctx.getBeanFactory().registerSingleton("hubConfig", hubConfig);
        ctx.getBeanFactory().registerSingleton("flow", flow);
        ctx.getBeanFactory().registerSingleton("srcClient", srcClient);
        ctx.getBeanFactory().registerSingleton("statusListener", (FlowStatusListener) (jobId, percentComplete, message) -> {
            flowStatusListeners.forEach((FlowStatusListener listener) -> {
                listener.onStatusChange(jobId, percentComplete, message);
            });
        });

        ctx.getBeanFactory().registerSingleton("finishedListener", (FlowFinishedListener) () -> {
            flowFinishedListeners.forEach((FlowFinishedListener listener) -> {
                listener.onFlowFinished();
            });
        });

        ctx.getBeanFactory().registerSingleton("flowItemCompleteListener", (FlowItemCompleteListener) (jobId, itemId) -> {
            flowItemCompleteListeners.forEach((FlowItemCompleteListener listener) -> {
                listener.processCompletion(jobId, itemId);
            });
        });

        ctx.getBeanFactory().registerSingleton("flowItemFailureListener", (FlowItemFailureListener) (jobId, itemId) -> {
            flowItemFailureListeners.forEach((FlowItemFailureListener listener) -> {
                listener.processFailure(jobId, itemId);
            });
        });
        ctx.refresh();
        return ctx;
    }

    private JobParameters buildJobParameters(Flow flow, int batchSize, int threadCount, String targetDatabase) {
        JobParametersBuilder jpb = new JobParametersBuilder();
        jpb.addLong("batchSize", Integer.toUnsignedLong(batchSize));
        jpb.addLong("threadCount", Integer.toUnsignedLong(threadCount));
        jpb.addString("uid", UUID.randomUUID().toString());
        jpb.addString("flowType", flow.getType().toString());
        jpb.addString("entity", flow.getEntityName());
        jpb.addString("flow", flow.getName());
        jpb.addString("targetDatabase", targetDatabase);
        return jpb.toJobParameters();
    }
}
