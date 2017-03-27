package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.*;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobManager;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
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
    public JobTicket run() {
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


        Collector c = flow.getCollector();
        if (c instanceof ServerCollector) {
            ((ServerCollector)c).setClient(srcClient);
        }

        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        Vector<String> uris = c.run(options);

        FlowResource flowRunner = new FlowResource(srcClient, targetDatabase, flow);
        AtomicInteger count = new AtomicInteger(0);
        ArrayList<String> errorMessages = new ArrayList<>();

        DataMovementManager dataMovementManager = srcClient.newDataMovementManager();

        QueryBatcher queryBatcher = dataMovementManager.newQueryBatcher(uris.iterator())
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .onUrisReady((QueryBatch batch) -> {
                try {
                    String jobId = batch.getJobTicket().getJobId();
                    RunFlowResponse response = flowRunner.run(jobId, batch.getItems(), options);
                    failedEvents.addAndGet(response.errorCount);
                    successfulEvents.addAndGet(response.totalCount - response.errorCount);
                    successfulBatches.addAndGet(1);
                    count.addAndGet(1);
                    if (flowItemCompleteListeners.size() > 0) {
                        response.completedItems.forEach((String item) -> {
                            flowItemCompleteListeners.forEach((FlowItemCompleteListener listener) -> {
                                listener.processCompletion(jobId, item);
                            });
                        });
                    }

                    if (flowItemFailureListeners.size() > 0) {
                        response.failedItems.forEach((String item) -> {
                            flowItemFailureListeners.forEach((FlowItemFailureListener listener) -> {
                                listener.processFailure(jobId, item);
                            });
                        });
                    }
                }
                catch(Exception e) {
                    errorMessages.add(e.toString());
                }
            })
            .onQueryFailure((QueryBatchException failure) -> {
                failedBatches.addAndGet(1);
                failedEvents.addAndGet(batchSize);
            });

        JobTicket jobTicket = dataMovementManager.startJob(queryBatcher);
        JobManager jobManager = new JobManager(hubConfig.newJobDbClient());
        jobManager.saveJob(Job.withFlow(flow)
            .withJobId(jobTicket.getJobId())
        );

        runningThread = new Thread(() -> {
            queryBatcher.awaitCompletion();

            flowFinishedListeners.forEach((FlowFinishedListener::onFlowFinished));

            dataMovementManager.stopJob(queryBatcher);

            // store the thing in MarkLogic
            Job job = Job.withFlow(flow)
                .withJobId(jobTicket.getJobId())
                .setCounts(successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get())
                .withEndTime(new Date());

            if (errorMessages.size() > 0) {
                job.withJobOutput(String.join("\n", errorMessages));
            }
            jobManager.saveJob(job);
        });
        runningThread.start();

        return jobTicket;


    }

    class FlowResource extends ResourceManager {

        static final public String NAME = "flow";

        private DatabaseClient srcClient;
        private String targetDatabase;
        private Flow flow;
        StringHandle handle;

        public FlowResource(DatabaseClient srcClient, String targetDatabase, Flow flow) {
            super();
            this.flow = flow;
            this.srcClient = srcClient;
            this.targetDatabase = targetDatabase;
            this.srcClient.init(NAME, this);
            handle = new StringHandle(flow.serialize(true));
            handle.setFormat(Format.XML);
        }

        public RunFlowResponse run(String jobId, String[] items) {
            return run(jobId, items, null);
        }

        public RunFlowResponse run(String jobId, String[] items, Map<String, Object> options) {
            RunFlowResponse resp;
            try {
                RequestParameters params = new RequestParameters();
                params.put("job-id", jobId);
                params.put("identifier", items);
                params.put("target-database", targetDatabase);
                if (options != null) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    params.put("options", objectMapper.writeValueAsString(options));
                }
                ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, handle);
                if (resultItr == null || ! resultItr.hasNext()) {
                    resp = new RunFlowResponse();
                }
                ResourceServices.ServiceResult res = resultItr.next();
                StringHandle handle = new StringHandle();
                ObjectMapper objectMapper = new ObjectMapper();
                resp = objectMapper.readValue(res.getContent(handle).get(), RunFlowResponse.class);

            }
            catch(Exception e) {
                e.printStackTrace();
                throw new RuntimeException(e);
            }
            return resp;
        }
    }
}
