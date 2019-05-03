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
package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.*;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.DiskQueue;
import com.marklogic.hub.collector.impl.CollectorImpl;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.*;
import com.marklogic.hub.util.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

public class QueryStepRunner implements StepRunner {

    private static final int MAX_ERROR_MESSAGES = 10;
    private Flow flow;
    private int batchSize;
    private int threadCount;
    private DatabaseClient stagingClient;
    private String destinationDatabase;
    private Map<String, Object> options;
    private int previousPercentComplete;
    private boolean stopOnFailure = false;
    private String jobId;
    private boolean isFullOutput = false;
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private String step = "1";

    private List<StepItemCompleteListener> stepItemCompleteListeners = new ArrayList<>();
    private List<StepItemFailureListener> stepItemFailureListeners = new ArrayList<>();
    private List<StepStatusListener> stepStatusListeners = new ArrayList<>();
    private List<StepFinishedListener> stepFinishedListeners = new ArrayList<>();
    private Map<String, Object> stepConfig = new HashMap<>();
    private HubConfig hubConfig;
    private Thread runningThread = null;
    private DataMovementManager dataMovementManager = null;
    private QueryBatcher queryBatcher = null;
    private JobDocManager jobDocManager;
    private AtomicBoolean isStopped = new AtomicBoolean(false) ;

    public QueryStepRunner(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingClient();
        this.destinationDatabase = hubConfig.getDbName(DatabaseKind.FINAL);
    }

    public StepRunner withFlow(Flow flow) {
        this.flow = flow;
        return this;
    }

    public StepRunner withStep(String step) {
        this.step = step;
        return this;
    }

    public StepRunner withJobId(String jobId) {
        this.jobId = jobId;
        return this;
    }

    @Override
    public StepRunner withBatchSize(int batchSize) {
        this.batchSize = batchSize;
        return this;
    }

    @Override
    public StepRunner withThreadCount(int threadCount) {
        this.threadCount = threadCount;
        return this;
    }

    @Override
    public StepRunner withSourceClient(DatabaseClient stagingClient) {
        this.stagingClient = stagingClient;
        return this;
    }

    @Override
    public StepRunner withDestinationDatabase(String destinationDatabase) {
        this.destinationDatabase = destinationDatabase;
        return this;
    }

    @Override
    public StepRunner withStopOnFailure(boolean stopOnFailure) {
        this.stopOnFailure = stopOnFailure;
        return this;
    }

    @Override
    public StepRunner withOptions(Map<String, Object> options) {
        this.options = options;
        return this;
    }

    @Override
    public StepRunner withStepConfig(Map<String, Object> stepConfig) {
        this.stepConfig = stepConfig;
        return this;
    }

    @Override
    public StepRunner onItemComplete(StepItemCompleteListener listener) {
        this.stepItemCompleteListeners.add(listener);
        return this;
    }

    @Override
    public StepRunner onItemFailed(StepItemFailureListener listener) {
        this.stepItemFailureListeners.add(listener);
        return this;
    }

    @Override
    public StepRunner onStatusChanged(StepStatusListener listener) {
        this.stepStatusListeners.add(listener);
        return this;
    }

    @Override
    public StepRunner onFinished(StepFinishedListener listener) {
        this.stepFinishedListeners.add(listener);
        return this;
    }

    @Override
    public void awaitCompletion() {
        try {
            awaitCompletion(Long.MAX_VALUE, TimeUnit.DAYS);
        } catch (InterruptedException | TimeoutException e) {
        }
    }

    @Override
    public void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException,TimeoutException {
        if (runningThread != null) {
            runningThread.join(unit.convert(timeout, unit));
            if (runningThread.getState() != Thread.State.TERMINATED) {
                if ( dataMovementManager != null && queryBatcher != null ) {
                    dataMovementManager.stopJob(queryBatcher);
                }
                runningThread.interrupt();
                throw new TimeoutException("Timeout occurred after "+timeout+" "+unit.toString());
            }
        }
    }

    @Override
    public RunStepResponse run() {
        runningThread = null;
        if(stepConfig.get("batchSize") != null){
            this.batchSize = (int) stepConfig.get("batchSize");
        }
        if(stepConfig.get("threadCount") != null) {
            this.threadCount = (int) stepConfig.get("threadCount");
        }
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        jobDocManager = new JobDocManager(hubConfig.newJobDbClient());
        if (options == null) {
            options = new HashMap<>();
        } else {
            if (options.get("fullOutput") != null) {
                isFullOutput = Boolean.parseBoolean(options.get("fullOutput").toString());
            }
        }
        if(options.get("sourceDatabase") != null) {
            this.stagingClient = hubConfig.newStagingClient((String) options.get("sourceDatabase"));
        }
        if(options.get("targetDatabase") != null) {
            this.destinationDatabase = (String) options.get("targetDatabase");
        }
        options.put("flow", this.flow.getName());
        Collection<String> uris = null;
        //If current step is the first run step, a job doc is created
        try {
            StepRunnerUtil.initializeStepRun(jobDocManager, runStepResponse, flow, step, jobId);
        }
        catch (Exception e){
            throw e;
        }

        try {
            uris = runCollector();
        } catch (Exception e) {
            runStepResponse.setCounts(0,0, 0, 0, 0)
                .withStatus(JobStatus.FAILED_PREFIX + step);
            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            runStepResponse.withStepOutput(errors.toString());
            JsonNode jobDoc = null;
            try {
                jobDoc = jobDocManager.postJobs(jobId, JobStatus.FAILED_PREFIX + step, step, null, runStepResponse);
            }
            catch (Exception ex) {
                throw ex;
            }
            try {
                return StepRunnerUtil.getResponse(jobDoc, step);
            }
            catch (Exception ex)
            {
                return runStepResponse;
            }
        }
        return this.runHarmonizer(runStepResponse,uris);
    }

    @Override
    public void stop() {
        isStopped.set(true);
        if(queryBatcher != null) {
            dataMovementManager.stopJob(queryBatcher);
        }
    }

    @Override
    public RunStepResponse run(Collection uris) {
        runningThread = null;
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        try {
            StepRunnerUtil.initializeStepRun(jobDocManager, runStepResponse, flow, step, jobId);
        }
        catch (Exception e){
            throw e;
        }
        return this.runHarmonizer(runStepResponse,uris);
    }

    @Override
    public int getBatchSize(){
        return this.batchSize;
    }

    private Collection<String> runCollector() throws Exception {
        Collector c = new CollectorImpl(this.flow);
        c.setHubConfig(hubConfig);
        c.setClient(stagingClient);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(this.jobId, 0, JobStatus.RUNNING_PREFIX + step, 0, 0,  "running collector");
        });

        final DiskQueue<String> uris ;
        try {
            if(! isStopped.get()) {
                uris = c.run(this.flow.getName(), step, options);
            }
            else {
                uris = null;
            }
        }
        catch (Exception e) {
            throw e;
        }
        return uris;
    }

    private RunStepResponse runHarmonizer(RunStepResponse runStepResponse, Collection uris) {
        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(runStepResponse.getJobId(), 0, JobStatus.RUNNING_PREFIX + step, 0,0, "starting step execution");
        });

        if ( !isStopped.get() && (uris == null || uris.size() == 0 )) {
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, JobStatus.COMPLETED_PREFIX + step, 0, 0, "collector returned 0 items");
            });
            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));
            runStepResponse.setCounts(0,0,0,0,0);
            runStepResponse.withStatus(JobStatus.COMPLETED_PREFIX + step);
            JsonNode jobDoc = null;
            try {
                jobDoc = jobDocManager.postJobs(jobId, JobStatus.COMPLETED_PREFIX + step, step, step, runStepResponse);
            }
            catch (Exception e) {
                throw e;
            }
            try {
                return StepRunnerUtil.getResponse(jobDoc, step);
            }
            catch (Exception ex)
            {
                return runStepResponse;
            }
        }

        Vector<String> errorMessages = new Vector<>();

        dataMovementManager = stagingClient.newDataMovementManager();

        double batchCount = Math.ceil((double) uris.size() / (double) batchSize);

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();

        ConcurrentHashMap<DatabaseClient, FlowResource> databaseClientMap = new ConcurrentHashMap<>();
        Map<String,Object> fullResponse = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        queryBatcher = dataMovementManager.newQueryBatcher(uris.iterator())
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(runStepResponse.getJobId())
            .onUrisReady((QueryBatch batch) -> {
                try {
                    FlowResource flowResource;
                    Map<String,Object> optsMap = new HashMap<>(options);
                    if (databaseClientMap.containsKey(batch.getClient())) {
                        flowResource = databaseClientMap.get(batch.getClient());
                    } else {
                        flowResource = new FlowResource(batch.getClient(), destinationDatabase, flow);
                        databaseClientMap.put(batch.getClient(), flowResource);
                    }
                    optsMap.put("uris", batch.getItems());

                    ResponseHolder response = flowResource.run(runStepResponse.getJobId(), step, optsMap);
                    failedEvents.addAndGet(response.errorCount);
                    successfulEvents.addAndGet(response.totalCount - response.errorCount);
                    if (response.errors != null) {
                        if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                            errorMessages.addAll(response.errors.stream().map(jsonNode -> StepRunnerUtil.jsonToString(jsonNode)).collect(Collectors.toList()));
                        }
                    }
                    if(isFullOutput) {
                        fullResponse.putAll(mapper.convertValue(response.documents, Map.class));
                    }

                    if (response.errorCount < response.totalCount) {
                        successfulBatches.addAndGet(1);
                    } else {
                        failedBatches.addAndGet(1);
                    }

                    int percentComplete = (int) (((double) successfulBatches.get() / batchCount) * 100.0);

                    if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
                        previousPercentComplete = percentComplete;
                        stepStatusListeners.forEach((StepStatusListener listener) -> {
                            listener.onStatusChange(runStepResponse.getJobId(), percentComplete, JobStatus.RUNNING_PREFIX + step, successfulEvents.get(), failedEvents.get(), "");
                        });
                    }

                    if (stepItemCompleteListeners.size() > 0) {
                        response.completedItems.forEach((String item) -> {
                            stepItemCompleteListeners.forEach((StepItemCompleteListener listener) -> {
                                listener.processCompletion(runStepResponse.getJobId(), item);
                            });
                        });
                    }

                    if (stepItemFailureListeners.size() > 0) {
                        response.failedItems.forEach((String item) -> {
                            stepItemFailureListeners.forEach((StepItemFailureListener listener) -> {
                                listener.processFailure(runStepResponse.getJobId(), item);
                            });
                        });
                    }

                    if (stopOnFailure && response.errorCount > 0) {
                        JobTicket jobTicket = ticketWrapper.get("jobTicket");
                        if (jobTicket != null) {
                            dataMovementManager.stopJob(jobTicket);
                        }
                    }
                } catch (Exception e) {
                    if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                        errorMessages.add(e.toString());
                    }
                }
            })
            .onQueryFailure((QueryBatchException failure) -> {
                failedBatches.addAndGet(1);
                failedEvents.addAndGet(batchSize);
            });

        if(! isStopped.get()) {
            JobTicket jobTicket = dataMovementManager.startJob(queryBatcher);
            ticketWrapper.put("jobTicket", jobTicket);
        }

        runningThread = new Thread(() -> {
            queryBatcher.awaitCompletion();

            String stepStatus;
            if (failedEvents.get() > 0 && stopOnFailure) {
                stepStatus = JobStatus.STOP_ON_ERROR_PREFIX + step;
            } else if( isStopped.get()){
                stepStatus = JobStatus.CANCELED_PREFIX + step;
            } else if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                stepStatus = JobStatus.COMPLETED_WITH_ERRORS_PREFIX + step;
            } else if (failedEvents.get() == 0 && successfulEvents.get() > 0)  {
                stepStatus = JobStatus.COMPLETED_PREFIX + step;
            } else {
                stepStatus = JobStatus.FAILED_PREFIX + step;
            }

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, stepStatus, successfulEvents.get(), failedEvents.get(), "");
            });

            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));

            dataMovementManager.stopJob(queryBatcher);

            runStepResponse.setCounts(uris.size(),successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get());
            runStepResponse.withStatus(stepStatus);
            if (errorMessages.size() > 0) {
                runStepResponse.withStepOutput(errorMessages);
            }
            if(isFullOutput) {
                runStepResponse.withFullOutput(fullResponse);
            }
            JsonNode jobDoc = null;
            try {
                jobDoc = jobDocManager.postJobs(jobId, stepStatus, step, (JobStatus.COMPLETED_PREFIX + step).equalsIgnoreCase(stepStatus) ? step : null, runStepResponse);
            }
            catch (Exception e) {
                logger.error(e.getMessage());
            }
            if(jobDoc != null) {
                try {
                    RunStepResponse tempResp =  StepRunnerUtil.getResponse(jobDoc, step);
                    runStepResponse.setStepStartTime(tempResp.getStepStartTime());
                    runStepResponse.setStepEndTime(tempResp.getStepEndTime());
                }
                catch (Exception ex)
                {
                    logger.error(ex.getMessage());
                }
            }
        });

        runningThread.start();
        return runStepResponse;
    }

    class FlowResource extends ResourceManager {

        private DatabaseClient srcClient;
        private String targetDatabase;
        private Flow flow;

        public FlowResource(DatabaseClient srcClient, String targetDatabase, Flow flow) {
            super();
            this.flow = flow;
            this.srcClient = srcClient;
            this.targetDatabase = targetDatabase;
            this.srcClient.init("ml:runFlow" , this);
        }


        public ResponseHolder run(String jobId, String step, Map<String, Object> options) {
            ResponseHolder resp;

                RequestParameters params = new RequestParameters();
                params.add("flow-name", flow.getName());
                params.put("step", step);
                params.put("job-id", jobId);
                params.put("target-database", targetDatabase);
                if (options != null) {
                    try {
                        params.put("options", JSONObject.writeValueAsString(options));
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException(e);
                    }
                }
                ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
                try {
                    if (resultItr == null || !resultItr.hasNext()) {
                        resp = new ResponseHolder();
                    } else {
                        ResourceServices.ServiceResult res = resultItr.next();
                        StringHandle handle = new StringHandle();
                        ObjectMapper objectMapper = new ObjectMapper();
                        resp = objectMapper.readValue(res.getContent(handle).get(), ResponseHolder.class);
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                } finally {
                    if (resultItr != null) {
                        resultItr.close();
                    }
                }

            return resp;
        }

    }
}
