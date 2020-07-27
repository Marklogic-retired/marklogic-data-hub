/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.datamovement.*;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.collector.DiskQueue;
import com.marklogic.hub.collector.impl.CollectorImpl;
import com.marklogic.hub.dataservices.StepRunnerService;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

public class QueryStepRunner implements StepRunner {

    private static final int MAX_ERROR_MESSAGES = 10;
    private Flow flow;
    private int batchSize;
    private int threadCount;
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
    private HubClient hubClient;
    private Thread runningThread = null;
    private DataMovementManager dataMovementManager = null;
    private QueryBatcher queryBatcher = null;
    private JobDocManager jobDocManager;
    private AtomicBoolean isStopped = new AtomicBoolean(false) ;
    private StepDefinition stepDef;

    public QueryStepRunner(HubClient hubClient) {
        this.hubClient = hubClient;
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

    public StepRunner withStepDefinition(StepDefinition stepDefinition){
        this.stepDef = stepDefinition;
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
    public StepRunner withStopOnFailure(boolean stopOnFailure) {
        this.stopOnFailure = stopOnFailure;
        return this;
    }

    @Override
    @SuppressWarnings("unchecked")
    public StepRunner withOptions(Map<String, Object> options) {
        if(flow == null){
            throw new DataHubConfigurationException("Flow has to be set before setting options");
        }
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> stepDefMap = null;
        if(stepDef != null) {
            stepDefMap = mapper.convertValue(stepDef.getOptions(), Map.class);
        }
        Map<String, Object> stepMap = mapper.convertValue(this.flow.getStep(step).getOptions(), Map.class);
        Map<String,Object> flowMap = mapper.convertValue(flow.getOptions(), Map.class);
        Map<String, Object> combinedOptions = new HashMap<>();

        if(stepDefMap != null){
            combinedOptions.putAll(stepDefMap);
        }
        if(flowMap != null) {
            combinedOptions.putAll(flowMap);
        }
        if(stepMap != null){
            combinedOptions.putAll(stepMap);
        }
        if(options != null) {
            combinedOptions.putAll(options);
        }
        this.options = combinedOptions;
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
        boolean disableJobOutput = false;
        if (options != null && options.containsKey("disableJobOutput")) {
            disableJobOutput = Boolean.parseBoolean(options.get("disableJobOutput").toString());
        }
        runningThread = null;
        if(stepConfig.get("batchSize") != null){
            this.batchSize = (int) stepConfig.get("batchSize");
        }
        if(stepConfig.get("threadCount") != null) {
            this.threadCount = (int) stepConfig.get("threadCount");
        }
        if(stepConfig.get("stopOnFailure") != null){
            this.withStopOnFailure(Boolean.parseBoolean(stepConfig.get("stopOnFailure").toString()));
        }
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        if (options == null) {
            options = new HashMap<>();
        } else {
            if (options.get("fullOutput") != null) {
                isFullOutput = Boolean.parseBoolean(options.get("fullOutput").toString());
            }
        }

        options.put("flow", this.flow.getName());

        // Needed to support constrainSourceQueryToJob
        options.put("jobId", jobId);

        //If current step is the first run step job output isn't disabled, a job doc is created
        if (!disableJobOutput) {
            jobDocManager = new JobDocManager(hubClient.getJobsClient());
            StepRunnerUtil.initializeStepRun(jobDocManager, runStepResponse, flow, step, jobId);
        } else {
            jobDocManager = null;
        }

        DiskQueue<String> uris;
        try {
            final String sourceDatabase = options.get("sourceDatabase") != null ?
                StepRunnerUtil.objectToString(options.get("sourceDatabase")) :
                hubClient.getDbName(DatabaseKind.STAGING);

            logger.info(String.format("Collecting items for step '%s' in flow '%s'", this.step, this.flow.getName()));
            uris = runCollector(sourceDatabase);
        } catch (Exception e) {
            runStepResponse.setCounts(0,0, 0, 0, 0)
                .withStatus(JobStatus.FAILED_PREFIX + step);
            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            runStepResponse.withStepOutput(errors.toString());
            if (!disableJobOutput) {
                JsonNode jobDoc = jobDocManager.postJobs(jobId, JobStatus.FAILED_PREFIX + step, flow.getName(), step, null, runStepResponse);
                try {
                    return StepRunnerUtil.getResponse(jobDoc, step);
                } catch (Exception ignored) {
                }
            }
            return runStepResponse;
        }

        return this.runHarmonizer(runStepResponse, uris);
    }

    @Override
    public void stop() {
        isStopped.set(true);
        if(queryBatcher != null) {
            dataMovementManager.stopJob(queryBatcher);
        }
    }

    @Override
    public RunStepResponse run(Collection<String> uris) {
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

    private DiskQueue<String> runCollector(String sourceDatabase) {
        Collector c = new CollectorImpl(hubClient, sourceDatabase);

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

    private RunStepResponse runHarmonizer(RunStepResponse runStepResponse, Collection<String> uris) {
        StepMetrics stepMetrics = new StepMetrics();

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(runStepResponse.getJobId(), 0, JobStatus.RUNNING_PREFIX + step, 0,0, "starting step execution");
        });

        if (uris == null || uris.size() == 0) {
            JsonNode jobDoc = null;
            final String stepStatus;
            if(isStopped.get()) {
                stepStatus = JobStatus.CANCELED_PREFIX + step;
            }
            else {
                stepStatus = JobStatus.COMPLETED_PREFIX + step;
            }

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, stepStatus, 0, 0,
                    (stepStatus.contains(JobStatus.COMPLETED_PREFIX) ? "collector returned 0 items" : "job was stopped"));
            });
            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));
            runStepResponse.setCounts(0,0,0,0,0);
            runStepResponse.withStatus(stepStatus);

            try {
                jobDoc = jobDocManager.postJobs(jobId, stepStatus, flow.getName(), step, stepStatus.contains(JobStatus.COMPLETED_PREFIX) ? step : null, runStepResponse);
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

        // The client used here doesn't matter, given that a QueryBatcher is going to be constructed based on an
        // Iterator. It's the step options that determine where documents are written to.
        dataMovementManager = hubClient.getStagingClient().newDataMovementManager();

        final ObjectMapper objectMapper = new ObjectMapper();

        double batchCount = Math.ceil((double) uris.size() / (double) batchSize);

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();

        Map<String,Object> fullResponse = new HashMap<>();
        queryBatcher = dataMovementManager.newQueryBatcher(uris.iterator())
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(runStepResponse.getJobId())
            .onUrisReady((QueryBatch batch) -> {
                try {
                    // Create the inputs for the processUris DS
                    ObjectNode inputs = objectMapper.createObjectNode();
                    inputs.put("flowName", flow.getName());
                    inputs.put("stepNumber", step);
                    inputs.put("jobId", runStepResponse.getJobId());

                    // Make a copy of the calculated options and then add the items from this batch
                    Map<String, Object> batchOptions = new HashMap<>(options);
                    batchOptions.put("uris", batch.getItems());
                    inputs.set("options", objectMapper.valueToTree(batchOptions));

                    // Invoke the DS endpoint. A StepRunnerService is created based on the DatabaseClient associated
                    // with the batch to help distribute load, per DHFPROD-1172.
                    JsonNode jsonResponse = StepRunnerService.on(batch.getClient()).processUris(inputs);
                    ResponseHolder response = objectMapper.readerFor(ResponseHolder.class).readValue(jsonResponse);

                    stepMetrics.getFailedEvents().addAndGet(response.errorCount);
                    stepMetrics.getSuccessfulEvents().addAndGet(response.totalCount - response.errorCount);
                    if (response.errors != null) {
                        if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                            errorMessages.addAll(response.errors.stream().limit(MAX_ERROR_MESSAGES - errorMessages.size()).map(jsonNode -> StepRunnerUtil.jsonToString(jsonNode)).collect(Collectors.toList()));
                        }
                    }

                    if (isFullOutput && response.documents != null) {
                        // Using a try/catch. As of DH 5.1, the "fullOutput" feature is undocumented and untested, and
                        // the work for DHFPROD-3176 is to at least not throw an error if someone does set fullOutput=true.
                        // Note that the output is also not visible in QuickStart, but it can be seen when running a flow
                        // via Gradle.
                        try {
                            for (JsonNode node : response.documents) {
                                if (node.has("uri")) {
                                    fullResponse.put(node.get("uri").asText(), node.toString());
                                }
                            }
                        } catch (Exception ex) {
                            logger.warn("Unable to add written documents to fullResponse map in RunStepResponse; cause: " + ex.getMessage(), ex);
                        }
                    }

                    if (response.errorCount < response.totalCount) {
                        stepMetrics.getSuccessfulBatches().addAndGet(1);
                    } else {
                        stepMetrics.getFailedBatches().addAndGet(1);
                    }

                    int percentComplete = (int) (((double) stepMetrics.getSuccessfulBatchesCount() / batchCount) * 100.0);

                    if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
                        previousPercentComplete = percentComplete;
                        stepStatusListeners.forEach((StepStatusListener listener) -> {
                            listener.onStatusChange(runStepResponse.getJobId(), percentComplete, JobStatus.RUNNING_PREFIX + step, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), "");
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
                    // if exception is thrown update the failed related metrics
                    stepMetrics.getFailedBatches().addAndGet(1);
                    stepMetrics.getFailedEvents().addAndGet(batchSize);
                }
            })
            .onQueryFailure((QueryBatchException failure) -> {
                stepMetrics.getFailedBatches().addAndGet(1);
                stepMetrics.getFailedEvents().addAndGet(batchSize);
            });

        if(! isStopped.get()) {
            logger.info(String.format("Starting processing of items for step '%s' in flow '%s'", this.step, this.flow.getName()));
            JobTicket jobTicket = dataMovementManager.startJob(queryBatcher);
            ticketWrapper.put("jobTicket", jobTicket);
        }

        runningThread = new Thread(() -> {
            queryBatcher.awaitCompletion();
            logger.info(String.format("Finished processing of items for step '%s' in flow '%s'", this.step, this.flow.getName()));

            // now that the job has completed we can close the resource
            if (uris instanceof DiskQueue) {
                ((DiskQueue<String>)uris).close();
            }

            String stepStatus;
            if (stepMetrics.getFailedEventsCount() > 0 && stopOnFailure) {
                stepStatus = JobStatus.STOP_ON_ERROR_PREFIX + step;
            } else if( isStopped.get()){
                stepStatus = JobStatus.CANCELED_PREFIX + step;
            } else if (stepMetrics.getFailedEventsCount() > 0 && stepMetrics.getSuccessfulEventsCount() > 0) {
                stepStatus = JobStatus.COMPLETED_WITH_ERRORS_PREFIX + step;
            } else if (stepMetrics.getFailedEventsCount() == 0 && stepMetrics.getSuccessfulEventsCount() > 0)  {
                stepStatus = JobStatus.COMPLETED_PREFIX + step;
            } else {
                stepStatus = JobStatus.FAILED_PREFIX + step;
            }

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, stepStatus, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), "");
            });

            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));

            dataMovementManager.stopJob(queryBatcher);

            runStepResponse.setCounts(uris.size(),stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), stepMetrics.getSuccessfulBatchesCount(), stepMetrics.getFailedBatchesCount());
            runStepResponse.withStatus(stepStatus);
            if (errorMessages.size() > 0) {
                runStepResponse.withStepOutput(errorMessages);
            }
            if(isFullOutput) {
                runStepResponse.withFullOutput(fullResponse);
            }
            JsonNode jobDoc = null;
            try {
                jobDoc = jobDocManager.postJobs(jobId, stepStatus, flow.getName(), step, (JobStatus.COMPLETED_PREFIX + step).equalsIgnoreCase(stepStatus) ? step : null, runStepResponse);
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
}
