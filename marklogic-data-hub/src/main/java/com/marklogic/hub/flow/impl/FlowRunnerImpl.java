package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.*;
import com.marklogic.client.datamovement.impl.JobTicketImpl;
import com.marklogic.client.datamovement.impl.QueryBatcherImpl;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubDatabase;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.DiskQueue;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobManager;
import com.marklogic.hub.job.JobStatus;

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
    private int previousPercentComplete;

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

    private DatabaseClient getSourceClient() {
        DatabaseClient srcClient;
        if (sourceDatabase.equals(HubDatabase.STAGING)) {
            srcClient = hubConfig.newStagingClient();
        }
        else {
            srcClient = hubConfig.newFinalClient();
        }
        return srcClient;
    }

    @Override
    public JobTicket run() {
        String jobId = UUID.randomUUID().toString();
        JobManager jobManager = new JobManager(hubConfig.newJobDbClient());

        Job job = Job.withFlow(flow)
            .withJobId(jobId);
        jobManager.saveJob(job);

        DatabaseClient srcClient = getSourceClient();

        Collector c = flow.getCollector();
        if (c instanceof ServerCollector) {
            ((ServerCollector)c).setHubConfig(hubConfig);
            ((ServerCollector)c).setHubDatabase(sourceDatabase);
            ((ServerCollector)c).setClient(srcClient);
        }

        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        if (options == null) {
            options = new HashMap<>();
        }
        options.put("entity", this.flow.getEntityName());
        options.put("flow", this.flow.getName());
        options.put("flowType", this.flow.getType().toString());

        flowStatusListeners.forEach((FlowStatusListener listener) -> {
            listener.onStatusChange(jobId, 0, "running collector");
        });

        jobManager.saveJob(job.withStatus(JobStatus.RUNNING_COLLECTOR));
        DiskQueue<String> uris = c.run(jobId, threadCount, options);

        flowStatusListeners.forEach((FlowStatusListener listener) -> {
            listener.onStatusChange(jobId, 0, "starting harmonization");
        });

        ArrayList<String> errorMessages = new ArrayList<>();

        DataMovementManager dataMovementManager = srcClient.newDataMovementManager();

        double batchCount = Math.ceil((double)uris.size() / (double)batchSize);

        QueryBatcher queryBatcher = dataMovementManager.newQueryBatcher(uris.iterator())
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .onUrisReady((QueryBatch batch) -> {
                try {
                    FlowResource flowRunner = new FlowResource(batch.getClient(), batch.getClient().getDatabase(), flow);
                    RunFlowResponse response = flowRunner.run(jobId, batch.getItems(), options);
                    failedEvents.addAndGet(response.errorCount);
                    successfulEvents.addAndGet(response.totalCount - response.errorCount);
                    successfulBatches.addAndGet(1);

                    int percentComplete = (int) (((double)successfulBatches.get() / batchCount) * 100.0);

                    if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
                        previousPercentComplete = percentComplete;
                        flowStatusListeners.forEach((FlowStatusListener listener) -> {
                            listener.onStatusChange(jobId, percentComplete, "");
                        });
                    }

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
        jobManager.saveJob(job.withStatus(JobStatus.RUNNING_HARMONIZE));

        runningThread = new Thread(() -> {
            queryBatcher.awaitCompletion();

            flowStatusListeners.forEach((FlowStatusListener listener) -> {
                listener.onStatusChange(jobId, 100, "");
            });

            flowFinishedListeners.forEach((FlowFinishedListener::onFlowFinished));

            dataMovementManager.stopJob(queryBatcher);

            JobStatus status;
            if (failedEvents.get() + successfulEvents.get() != uris.size()) {
                status = JobStatus.CANCELED;
            }
            else if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                status = JobStatus.FINISHED_WITH_ERRORS;
            }
            else if (failedEvents.get() == 0 && successfulEvents.get() > 0) {
                status = JobStatus.FINISHED;
            }
            else {
                status = JobStatus.FAILED;
            }

            // store the thing in MarkLogic
            job.setCounts(successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get())
                .withStatus(status)
                .withEndTime(new Date());

            if (errorMessages.size() > 0) {
                job.withJobOutput(String.join("\n", errorMessages));
            }
            jobManager.saveJob(job);
        });
        runningThread.start();

        // hack until https://github.com/marklogic/java-client-api/issues/752 is fixed
        return new JobTicketImpl(jobId, JobTicket.JobType.QUERY_BATCHER).withQueryBatcher((QueryBatcherImpl)queryBatcher);
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
                else {
                    ResourceServices.ServiceResult res = resultItr.next();
                    StringHandle handle = new StringHandle();
                    ObjectMapper objectMapper = new ObjectMapper();
                    resp = objectMapper.readValue(res.getContent(handle).get(), RunFlowResponse.class);
                }

            }
            catch(Exception e) {
                e.printStackTrace();
                throw new RuntimeException(e);
            }
            return resp;
        }
    }
}
