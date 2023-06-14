/*
 * Copyright (c) 2021 MarkLogic Corporation
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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.client.dataservices.InputOutputCaller;
import com.marklogic.client.dataservices.OutputCaller;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.io.marker.BufferableHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.dataservices.DataServiceOrchestrator;
import com.marklogic.hub.dataservices.JobService;
import com.marklogic.hub.dataservices.StepRunnerService;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.JobStatus;
import com.marklogic.hub.step.ResponseHolder;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.StepItemCompleteListener;
import com.marklogic.hub.step.StepItemFailureListener;
import com.marklogic.hub.step.StepRunner;
import com.marklogic.hub.step.StepStatusListener;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;

public class QueryStepRunner extends LoggingObject implements StepRunner {

    private static final int MAX_ERROR_MESSAGES = 10;
    private Flow flow;
    private int batchSize;
    private int threadCount;
    private Map<String, Object> combinedOptions;
    private int previousPercentComplete;
    private boolean stopOnFailure = false;
    private String jobId;
    private boolean isFullOutput = false;

    private String step = "1";

    private final List<StepItemCompleteListener> stepItemCompleteListeners = new ArrayList<>();
    private final List<StepItemFailureListener> stepItemFailureListeners = new ArrayList<>();
    private final List<StepStatusListener> stepStatusListeners = new ArrayList<>();
    private Map<String, Object> stepConfig = new HashMap<>();
    private final HubClient hubClient;
    private Thread runningThread = null;
    final AtomicBoolean isStopped = new AtomicBoolean(false) ;
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
    public StepRunner withRuntimeOptions(Map<String, Object> runtimeOptions) {
        if(flow == null){
            throw new DataHubConfigurationException("Flow has to be set before setting options");
        }
        this.combinedOptions = StepRunnerUtil.makeCombinedOptions(this.flow, this.stepDef, this.step, runtimeOptions);
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
                runningThread.interrupt();
                throw new TimeoutException("Timeout occurred after "+timeout+" "+ unit);
            }
        }
    }

    private boolean jobOutputIsEnabled() {
        if (combinedOptions != null && combinedOptions.containsKey("disableJobOutput")) {
            return !Boolean.parseBoolean(combinedOptions.get("disableJobOutput").toString());
        }
        return true;
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
        if(stepConfig.get("stopOnFailure") != null){
            this.withStopOnFailure(Boolean.parseBoolean(stepConfig.get("stopOnFailure").toString()));
        }
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        if (combinedOptions == null) {
            combinedOptions = new HashMap<>();
        } else {
            if (combinedOptions.get("fullOutput") != null) {
                isFullOutput = Boolean.parseBoolean(combinedOptions.get("fullOutput").toString());
            }
        }

        combinedOptions.put("flow", this.flow.getName());

        // Needed to support constrainSourceQueryToJob
        combinedOptions.put("jobId", jobId);

        if (jobOutputIsEnabled()) {
            JobService.on(hubClient.getJobsClient()).startStep(jobId, step, flow.getName(), new ObjectMapper().valueToTree(this.combinedOptions));
        }

        return this.runHarmonizer(runStepResponse);
    }

    @Override
    public void stop() {
        isStopped.set(true);
    }

    @Override
    public RunStepResponse run(Collection<String> uris) {
        runningThread = null;
        if (jobOutputIsEnabled()) {
            JobService.on(hubClient.getJobsClient()).startStep(jobId, step, flow.getName(), new ObjectMapper().valueToTree(this.combinedOptions));
        }
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        return this.runHarmonizer(runStepResponse);
    }

    @Override
    public int getBatchSize(){
        return this.batchSize;
    }


    private RunStepResponse runHarmonizer(RunStepResponse runStepResponse) {
        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(runStepResponse.getJobId(), 0, JobStatus.RUNNING_PREFIX + step, 0,0, "starting step execution");
        });
        final ObjectNode endpointConstants = new ObjectMapper().createObjectNode();
        endpointConstants.put("jobId", jobId);
        endpointConstants.put("stepNumber", step);
        endpointConstants.put("flowName", flow.getName());
        final JsonNode optionsNode = StepRunnerUtil.jsonToNode(combinedOptions);
        endpointConstants.set("options", optionsNode);

        final String finalDatabaseName = hubClient.getDbName(DatabaseKind.FINAL);
        final String stagingDatabaseName = hubClient.getDbName(DatabaseKind.STAGING);
        final String sourceDatabase = Optional.ofNullable((String) combinedOptions.get("sourceDatabase")).orElse(stagingDatabaseName);

        final DatabaseClient executeClient;
        if (sourceDatabase.equals(finalDatabaseName)) {
            executeClient = hubClient.getFinalClient();
        } else if (sourceDatabase.equals(stagingDatabaseName)) {
            executeClient = hubClient.getStagingClient();
        } else {
            executeClient = hubClient.getStagingClient(sourceDatabase);
        }
        final String feedAPI = "ml-modules/root/data-hub/data-services/stepRunner/queryBatchFeed.api";
        final String processAPI = "ml-modules/root/data-hub/data-services/stepRunner/processBatch.api";
        final long urisCount;
        long tempUrisCount;
        ConcurrentHashMap<String, Object> errorMessages = new ConcurrentHashMap<>(MAX_ERROR_MESSAGES);
        try {
            tempUrisCount = StepRunnerService.on(executeClient).queryCount(endpointConstants).longValue();
        } catch (FailedRequestException e) {
            String message = String.format("Unable to collect items to process for flow %s and step %s.", flow.getName(), step) + " Exception: " + e.getServerMessage();
            logger.warn(message, e);
            errorMessages.put(message, "");
            tempUrisCount = 0;
        }
        urisCount = tempUrisCount;
        double batchCount = Math.ceil((double) urisCount / (double) batchSize);
        StepMetrics stepMetrics = new StepMetrics(urisCount, (long) batchCount);
        ErrorListener errorListener = new ErrorListener(this, stepMetrics, stopOnFailure, optionsNode.path("retryLimit").asInt(0));

        runningThread = new Thread(() -> {
            final ObjectMapper objectMapper = new ObjectMapper();
            Map<String, JsonNode> fullOutputMap = new HashMap<>(isFullOutput ? (int) urisCount : 0);
            if (urisCount != 0) {
                DataServiceOrchestrator orchestrator = new DataServiceOrchestrator(executeClient, feedAPI, processAPI);
                orchestrator
                    .withThreadCount(threadCount)
                    .withEndpointConstants(endpointConstants)
                    .withOutputListener(result -> {
                        try {
                            ResponseHolder response = objectMapper.readerFor(ResponseHolder.class).readValue(result);
                            stepMetrics.getFailedEvents().addAndGet(response.errorCount);
                            stepMetrics.getSuccessfulEvents().addAndGet(response.totalCount - response.errorCount);
                            if (response.errors != null) {
                                if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                                    response.errors.stream()
                                            .limit(MAX_ERROR_MESSAGES - errorMessages.size())
                                            .map(StepRunnerUtil::jsonToString)
                                            .forEach(msg -> errorMessages.put(msg, ""));
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
                                            fullOutputMap.put(node.get("uri").asText(), node);
                                        }
                                    }
                                } catch (Exception ex) {
                                    logger.warn("Unable to add written documents to fullOutput map in RunStepResponse; cause: " + ex.getMessage());
                                }
                            }

                            // Prior to DHFPROD-5997 / 5.4.0, if the count of errors and total count of events were both zero,
                            // then the batch was considered to have failed. I don't think this could have possibly happened though
                            // prior to 5997. Now that 5997 can filter out items after they've been collected, failed batches is
                            // only incremented if there are actually errors (which seems intuitive too).
                            if (response.errorCount < 1) {
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

                            if (!stepItemCompleteListeners.isEmpty()) {
                                response.completedItems.forEach((String item) -> {
                                    stepItemCompleteListeners.forEach((StepItemCompleteListener listener) -> {
                                        listener.processCompletion(runStepResponse.getJobId(), item);
                                    });
                                });
                            }

                            if (!stepItemFailureListeners.isEmpty()) {
                                response.failedItems.forEach((String item) -> {
                                    stepItemFailureListeners.forEach((StepItemFailureListener listener) -> {
                                        listener.processFailure(runStepResponse.getJobId(), item);
                                    });
                                });
                            }
                        } catch (FailedRequestException | IOException e) {
                            if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                                if (e instanceof FailedRequestException) {
                                    errorMessages.put(((FailedRequestException) e).getServerMessage(), "");
                                } else {
                                    errorMessages.put(e.toString(), "");
                                }
                            }
                            // if exception is thrown update the failed related metrics
                            stepMetrics.getFailedBatches().addAndGet(1);
                            stepMetrics.getFailedEvents().addAndGet(batchSize);

                            if (flow != null && flow.isStopOnError()) {
                                stepItemFailureListeners.forEach((StepItemFailureListener listener) -> {
                                    listener.processFailure(runStepResponse.getJobId(), null);
                                });
                            }
                        }
                        if (isStopped.get()) {
                            orchestrator.interrupt();
                        }
                    }).withFeedErrorListener(errorListener)
                        .withProcessErrorListener(errorListener);

                orchestrator.run();
            }
            if (!(errorListener.getThrowables().isEmpty() && errorMessages.isEmpty())) {
                errorListener
                        .getThrowables().stream()
                        .filter(Objects::nonNull)
                        .map(t -> t instanceof FailedRequestException ? ((FailedRequestException)t).getServerMessage(): t.toString())
                        .filter(Objects::nonNull)
                        .limit(MAX_ERROR_MESSAGES - errorMessages.size())
                        .forEach(msg -> errorMessages.put(msg, ""));
            }
            final List<String> finalErrorMessages = new ArrayList<>(errorMessages.keySet());
            if (!finalErrorMessages.isEmpty()) {
                runStepResponse.withStepOutput(finalErrorMessages);
            }
            errorListener.getThrowables().clear();
            String stepStatus = determineStepStatus(stepMetrics, finalErrorMessages);

            stepStatusListeners.forEach((StepStatusListener listener) -> listener.onStatusChange(runStepResponse.getJobId(), 100, stepStatus, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), ""));

            runStepResponse.setCounts(urisCount, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), stepMetrics.getSuccessfulBatchesCount(), stepMetrics.getFailedBatchesCount());
            runStepResponse.withStatus(stepStatus);

            if (isFullOutput) {
                runStepResponse.withFullOutput(fullOutputMap);
            }

            if (jobOutputIsEnabled()) {
                JsonNode jobDoc = null;
                try {
                    jobDoc = JobService.on(hubClient.getJobsClient()).finishStep(jobId, step, stepStatus, runStepResponse.toObjectNode());
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
            }
        });
        runningThread.start();
        return runStepResponse;
    }

    private String determineStepStatus(StepMetrics stepMetrics, List<String> errorMessages) {
        if ((stepMetrics.getFailedEventsCount() > 0 || !errorMessages.isEmpty()) && stopOnFailure) {
            // Re: DHFPROD-6720 - it is surprising that stop-on-error is only feasible when the undocumented
            // stopOnFailure option is used (it's actually documented for DHF 4, but not for DHF 5). If the
            // documented stopOnError option is used, then 'canceled' becomes the step status.
            return JobStatus.STOP_ON_ERROR_PREFIX + step;
        } else if( isStopped.get()){
            return JobStatus.CANCELED_PREFIX + step;
        } else if (stepMetrics.getFailedEventsCount() > 0 && stepMetrics.getSuccessfulEventsCount() > 0) {
            return JobStatus.COMPLETED_WITH_ERRORS_PREFIX + step;
        } else if (stepMetrics.getFailedEventsCount() == 0 && errorMessages.isEmpty())  {
            // Based on DHFPROD-5997, it is possible for a step to complete successfully but not process anything.
            // Previously, this was treated as a failure. I think one reason for that was because when the collector
            // threw an error due to e.g. an invalid source query, it was not treated as an error. In fact, the error
            // message would be sent as a single item to be processed by the step, which then resulted in the step not
            // processing anything. CollectorImpl now properly throws an exception when it gets back a non-200 response,
            // which means that a count of zero failed events should indicate successful completion.
            return JobStatus.COMPLETED_PREFIX + step;
        }
        return JobStatus.FAILED_PREFIX + step;
    }

    void runStatusListener(StepMetrics stepMetrics) {
        double batchCount = (double) stepMetrics.getTotalBatchesCount();
        long totalRunBatches = stepMetrics.getSuccessfulBatchesCount() + stepMetrics.getFailedBatchesCount();
        int percentComplete = (int) (((double) totalRunBatches/ batchCount) * 100.0);
        if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
            previousPercentComplete = percentComplete;
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(jobId, percentComplete, JobStatus.RUNNING_PREFIX + step, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), "Ingesting");
            });
        }
    }

    static class ErrorListener implements OutputCaller.BulkOutputCaller.ErrorListener, InputOutputCaller.BulkInputOutputCaller.ErrorListener {
        QueryStepRunner stepRunner;
        StepMetrics stepMetrics;
        final List<Throwable> throwables = new ArrayList<>();
        StepStatusListener[] stepStatusListeners = null;
        int retryLimit;
        boolean stopOnFailure;

        public ErrorListener(QueryStepRunner stepRunner, StepMetrics stepMetrics, boolean stopOnFailure, int retryLimit) {
            this.stepRunner = stepRunner;
            this.stepMetrics = stepMetrics;
            this.stopOnFailure = stopOnFailure;
            this.retryLimit = retryLimit;
        }

        public List<Throwable> getThrowables() {
            return throwables;
        }

        public QueryStepRunner.ErrorListener withStepListeners(StepStatusListener ...stepStatusListeners) {
            this.stepStatusListeners = stepStatusListeners;
            return this;
        }

        @Override
        public IOEndpoint.BulkIOEndpointCaller.ErrorDisposition processError(int retryCount, Throwable throwable, IOEndpoint.CallContext callContext) {
            if (stepRunner.isStopped.get()) {
                return IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.STOP_ALL_CALLS;
            }
            if (retryCount < retryLimit) {
                return IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.RETRY;
            }
            stepMetrics.getFailedBatches().incrementAndGet();
            long failedEvents = stepRunner.batchSize;
            stepMetrics.getFailedEvents().addAndGet(failedEvents);
            stepRunner.runStatusListener(stepMetrics);
            if (throwable != null){
                throwables.add(throwable);
            }
            return stopOnFailure ? IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.STOP_ALL_CALLS: IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.SKIP_CALL;
        }

        @Override
        public IOEndpoint.BulkIOEndpointCaller.ErrorDisposition processError(int retryCount, Throwable throwable, IOEndpoint.CallContext callContext, BufferableHandle[] input) {
            return processError(retryCount, throwable, callContext);
        }
    }
}
