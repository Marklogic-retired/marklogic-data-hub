/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.legacy.flow.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.datamovement.*;
import com.marklogic.client.datamovement.impl.JobTicketImpl;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.collector.DiskQueue;
import com.marklogic.hub.legacy.collector.LegacyCollector;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.legacy.job.Job;
import com.marklogic.hub.legacy.job.JobStatus;
import com.marklogic.hub.legacy.job.LegacyJobManager;
import org.apache.commons.lang3.StringUtils;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

public class LegacyFlowRunnerImpl implements LegacyFlowRunner {

    private static final int DEFAULT_BATCH_SIZE = 100;
    private static final int DEFAULT_THREAD_COUNT = 4;
    private static final int MAX_ERROR_MESSAGES = 10;
    private LegacyFlow flow;
    private int batchSize = DEFAULT_BATCH_SIZE;
    private int threadCount = DEFAULT_THREAD_COUNT;
    private DatabaseClient stagingClient;
    private String destinationDatabase;
    private Map<String, Object> options;
    private int previousPercentComplete;
    private boolean stopOnFailure = false;

    private List<LegacyFlowItemCompleteListener> flowItemCompleteListeners = new ArrayList<>();
    private List<LegacyFlowItemFailureListener> flowItemFailureListeners = new ArrayList<>();
    private List<LegacyFlowStatusListener> flowStatusListeners = new ArrayList<>();
    private List<LegacyFlowFinishedListener> flowFinishedListeners = new ArrayList<>();

    private HubConfig hubConfig;
    private Thread runningThread = null;

    public LegacyFlowRunnerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingClient();
        this.destinationDatabase = hubConfig.getDbName(DatabaseKind.FINAL);
    }

    //This constructor is only for unit testing purposes
    protected LegacyFlowRunnerImpl(){}

    @Override
    public LegacyFlowRunner withFlow(LegacyFlow flow) {
        this.flow = flow;
        return this;
    }

    @Override
    public LegacyFlowRunner withBatchSize(int batchSize) {
        this.batchSize = batchSize;
        return this;
    }

    @Override
    public LegacyFlowRunner withThreadCount(int threadCount) {
        this.threadCount = threadCount;
        return this;
    }

    @Override
    public LegacyFlowRunner withSourceClient(DatabaseClient stagingClient) {
        this.stagingClient = stagingClient;
        return this;
    }

    @Override
    public LegacyFlowRunner withDestinationDatabase(String destinationDatabase) {
        this.destinationDatabase = destinationDatabase;
        return this;
    }

    @Override
    public LegacyFlowRunner withStopOnFailure(boolean stopOnFailure) {
        this.stopOnFailure = stopOnFailure;
        return this;
    }

    @Override
    public LegacyFlowRunner withOptions(Map<String, Object> options) {
        this.options = options;
        return this;
    }

    @Override
    public LegacyFlowRunner onItemComplete(LegacyFlowItemCompleteListener listener) {
        this.flowItemCompleteListeners.add(listener);
        return this;
    }

    @Override
    public LegacyFlowRunner onItemFailed(LegacyFlowItemFailureListener listener) {
        this.flowItemFailureListeners.add(listener);
        return this;
    }

    @Override
    public LegacyFlowRunner onStatusChanged(LegacyFlowStatusListener listener) {
        this.flowStatusListeners.add(listener);
        return this;
    }

    @Override
    public LegacyFlowRunner onFinished(LegacyFlowFinishedListener listener) {
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
        if (runningThread != null) {
            runningThread.join(unit.convert(timeout, TimeUnit.MILLISECONDS));
        }
    }

    @Override
    public JobTicket run() {
        String jobId = UUID.randomUUID().toString();
        LegacyJobManager jobManager = LegacyJobManager.create(hubConfig.newJobDbClient());

        Job job = Job.withFlow(flow)
            .withJobId(jobId);
        jobManager.saveJob(job);

        LegacyCollector c = flow.getCollector();
        c.setHubConfig(hubConfig);
        c.setClient(stagingClient);

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

        flowStatusListeners.forEach((LegacyFlowStatusListener listener) -> {
            listener.onStatusChange(jobId, 0, "running collector");
        });

        jobManager.saveJob(job.withStatus(JobStatus.RUNNING_COLLECTOR));
        final DiskQueue<String> uris;
        try {
            uris = c.run(jobId, this.flow.getEntityName(), this.flow.getName(), threadCount, options);
        }
        catch(Exception e) {
            job.setCounts(0, 0, 0, 0)
                .withStatus(JobStatus.FAILED)
                .withEndTime(new Date());

            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            job.withJobOutput(errors.toString());
            jobManager.saveJob(job);
            return new JobTicketImpl(jobId, JobTicket.JobType.QUERY_BATCHER);
        }

        flowStatusListeners.forEach((LegacyFlowStatusListener listener) -> {
            listener.onStatusChange(jobId, 0, "starting harmonization");
        });

        Vector<String> errorMessages = new Vector<>();

        DataMovementManager dataMovementManager = stagingClient.newDataMovementManager();

        int uriCount = uris.size();

        double batchCount = Math.ceil((double)uris.size() / (double)batchSize);

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();

        ConcurrentHashMap<DatabaseClient, FlowResource> databaseClientMap = new ConcurrentHashMap<>();



        QueryBatcher queryBatcher = dataMovementManager.newQueryBatcher(uris.iterator())
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(jobId)
            .onUrisReady((QueryBatch batch) -> {
                try {
                    FlowResource flowResource;

                    if (databaseClientMap.containsKey(batch.getClient())){
                        flowResource = databaseClientMap.get(batch.getClient());
                    }
                    else {
                        flowResource = new FlowResource(batch.getClient(), destinationDatabase, flow);
                        databaseClientMap.put(batch.getClient(), flowResource);
                    }

                    RunFlowResponse response = flowResource.run(jobId, batch.getItems(), options);
                    failedEvents.addAndGet(response.errorCount);
                    successfulEvents.addAndGet(response.totalCount - response.errorCount);
                    if (response.errors != null) {
                        if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                            errorMessages.addAll(response.errors.stream().map(jsonNode -> jsonToString(jsonNode)).collect(Collectors.toList()));
                        }
                    }

                    if (response.errorCount < response.totalCount) {
                        successfulBatches.addAndGet(1);
                    }
                    else {
                        failedBatches.addAndGet(1);
                    }

                    int percentComplete = (int) (((double)successfulBatches.get() / batchCount) * 100.0);

                    if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
                        previousPercentComplete = percentComplete;
                        flowStatusListeners.forEach((LegacyFlowStatusListener listener) -> {
                            listener.onStatusChange(jobId, percentComplete, "");
                        });
                    }

                    if (flowItemCompleteListeners.size() > 0) {
                        response.completedItems.forEach((String item) -> {
                            flowItemCompleteListeners.forEach((LegacyFlowItemCompleteListener listener) -> {
                                listener.processCompletion(jobId, item);
                            });
                        });
                    }

                    if (flowItemFailureListeners.size() > 0) {
                        response.failedItems.forEach((String item) -> {
                            flowItemFailureListeners.forEach((LegacyFlowItemFailureListener listener) -> {
                                listener.processFailure(jobId, item);
                            });
                        });
                    }

                    if (stopOnFailure && response.errorCount > 0) {
                        JobTicket jobTicket = ticketWrapper.get("jobTicket");
                        if (jobTicket != null) {
                            dataMovementManager.stopJob(jobTicket);
                        }
                    }

                }
                catch(Exception e) {
                    if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                        errorMessages.add(e.toString());
                    }
                }
            })
            .onQueryFailure((QueryBatchException failure) -> {
                failedBatches.addAndGet(1);
                failedEvents.addAndGet(batchSize);
            });


        JobTicket jobTicket = dataMovementManager.startJob(queryBatcher);
        ticketWrapper.put("jobTicket", jobTicket);
        jobManager.saveJob(job.withStatus(JobStatus.RUNNING_HARMONIZE));

        runningThread = new Thread(() -> {
            queryBatcher.awaitCompletion();

            flowStatusListeners.forEach((LegacyFlowStatusListener listener) -> {
                listener.onStatusChange(jobId, 100, "");
            });

            flowFinishedListeners.forEach((LegacyFlowFinishedListener::onFlowFinished));

            dataMovementManager.stopJob(queryBatcher);

            JobStatus status;
            if (failedEvents.get() > 0 && stopOnFailure) {
                status = JobStatus.STOP_ON_ERROR;
            }
            else if (failedEvents.get() + successfulEvents.get() != uriCount) {
                status = JobStatus.CANCELED;
            }
            else if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                status = JobStatus.FINISHED_WITH_ERRORS;
            }
            //empty collector or no failure events => JobStatus.FINISHED
            else if ((failedEvents.get() == 0 && successfulEvents.get() > 0) || uriCount == 0) {
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
                job.withJobOutput(errorMessages);
            }
            jobManager.saveJob(job);
        });
        runningThread.start();

        return jobTicket;
    }

    private String jsonToString(JsonNode node) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    class FlowResource extends ResourceManager {

        private DatabaseClient srcClient;
        private String targetDatabase;
        private LegacyFlow flow;

        public FlowResource(DatabaseClient srcClient, String targetDatabase, LegacyFlow flow) {
            super();
            this.flow = flow;
            this.srcClient = srcClient;
            this.targetDatabase = targetDatabase;
            this.srcClient.init(flow.getCodeFormat().equals(CodeFormat.JAVASCRIPT) ? "mlSjsFlow" : "mlFlow", this);
        }

        public RunFlowResponse run(String jobId, String[] items) {
            return run(jobId, items, null);
        }

        public RunFlowResponse run(String jobId, String[] items, Map<String, Object> options) {
            RunFlowResponse resp = null;
            ObjectMapper objectMapper = new ObjectMapper();
            try {
                RequestParameters params = new RequestParameters();
                params.add("entity-name", flow.getEntityName());
                params.add("flow-name", flow.getName());
                params.put("job-id", jobId);
                params.put("identifiers", items);
                params.put("target-database", targetDatabase);
                if (options != null) {
                    params.put("options", objectMapper.writeValueAsString(options));
                }
                ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
                try {
                    if (resultItr == null || !resultItr.hasNext()) {
                        resp = new RunFlowResponse();
                    }
                    else {
                        ResourceServices.ServiceResult res = resultItr.next();
                        StringHandle handle = new StringHandle();
                        resp = objectMapper.readValue(res.getContent(handle).get(), RunFlowResponse.class);
                    }
                }
                finally {
                    if (resultItr != null) {
                        resultItr.close();
                    }
                }
            }
            catch(Exception e) {
                resp = handleFlowRunnerException (e);
            }
            return resp;
        }
    }

    protected RunFlowResponse handleFlowRunnerException (Exception e) {
        ObjectMapper objectMapper = new ObjectMapper();
        RunFlowResponse resp = null;
        if(e instanceof FailedRequestException && StringUtils.containsIgnoreCase(((FailedRequestException) e).getFailedRequest().getStatus(), "Plugin error")){
            try {
                resp = objectMapper.readValue(((FailedRequestException)e).getFailedRequest().getMessage(), RunFlowResponse.class);
            } catch (IOException ex) {
                throw new RuntimeException("Unexpected IO error while parsing exception from running flow; original exception: " + e.getMessage());
            }
        }
        else{
            throw new RuntimeException(e);
        }
        return resp;
    }
}
