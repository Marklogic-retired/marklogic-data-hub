package com.marklogic.hub.flow.impl;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.job.JobManager;
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
import java.util.concurrent.atomic.AtomicLong;

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
    private List<BatchCompleteListener> batchCompleteListeners = new ArrayList<>();

    private HubConfig hubConfig;
    private Thread runningThread = null;
    private boolean isFinished = false;
    private JobExecution result = null;


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
        result.stop();
    }

    @Override
    public JobExecution run() {
        result = null;
        if (options == null) {
            options = new HashMap<>();
        }
        flow.setOptions(options);
        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);
        JobManager jobManager = new JobManager(hubConfig.newJobDbClient());
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

            flowItemCompleteListeners.add((jobId, itemId) -> {
                successfulEvents.addAndGet(1);
            });

            flowItemFailureListeners.add((jobId, itemId) -> {
                failedEvents.addAndGet(1);
            });

            flowFinishedListeners.add(() -> {
                // store the thing in MarkLogic
                com.marklogic.hub.job.Job job = com.marklogic.hub.job.Job.withFlow(flow)

                    .withJobId(Long.toString(result.getJobId()))
                    .setCounts(successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get())
                    .withEndTime(new Date());
                jobManager.saveJob(job);
                isFinished = true;
            });

            batchCompleteListeners.add(new BatchCompleteListener() {
                @Override
                public void onBatchFailed() {
                    failedBatches.addAndGet(1);
                }

                @Override
                public void onBatchSucceeded() {
                    successfulBatches.addAndGet(1);
                }
            });

            JobParameters params = buildJobParameters(flow, batchSize, threadCount, targetDatabase);
            JobLauncher launcher = ctx.getBean(JobLauncher.class);
            Job job = ctx.getBean(Job.class);
            result = launcher.run(job, params);
        } catch (Exception e) {
            e.printStackTrace();
        }

        runningThread = new Thread(() -> {
            while(true) {
                if (isFinished) {
                    break;
                }
                Thread.yield();
            }
        });

        runningThread.start();

        jobManager.saveJob(com.marklogic.hub.job.Job.withFlow(flow)
            .withJobId(Long.toString(result.getJobId()))
        );

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
            System.out.println("FIRING finished listeners");
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

        ctx.getBeanFactory().registerSingleton("batchCompleteListener", new BatchCompleteListener() {
            @Override
            public void onBatchFailed() {
                batchCompleteListeners.forEach((BatchCompleteListener listener) -> {
                    listener.onBatchFailed();
                });
            }

            @Override
            public void onBatchSucceeded() {
                batchCompleteListeners.forEach((BatchCompleteListener listener) -> {
                    listener.onBatchSucceeded();
                });
            }
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
