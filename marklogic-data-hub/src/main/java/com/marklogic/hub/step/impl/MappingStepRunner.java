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
import com.marklogic.hub.flow.*;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.step.*;
import com.marklogic.hub.job.JobStatus;

import java.io.PrintWriter;
import java.io.StringWriter;


import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Vector;
import java.util.UUID;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

public class MappingStepRunner implements StepRunner {

    private static final int DEFAULT_BATCH_SIZE = 100;
    private static final int DEFAULT_THREAD_COUNT = 4;
    private static final int MAX_ERROR_MESSAGES = 10;
    private Flow flow;
    private int batchSize = DEFAULT_BATCH_SIZE;
    private int threadCount = DEFAULT_THREAD_COUNT;
    private DatabaseClient stagingClient;
    private String destinationDatabase;
    private Map<String, Object> options;
    private int previousPercentComplete;
    private boolean stopOnFailure = false;
    private String jobId;
    private boolean isFullOutput = false;


    private int step = 1;

    private List<StepItemCompleteListener> stepItemCompleteListeners = new ArrayList<>();
    private List<StepItemFailureListener> stepItemFailureListeners = new ArrayList<>();
    private List<StepStatusListener> stepStatusListeners = new ArrayList<>();
    private List<StepFinishedListener> stepFinishedListeners = new ArrayList<>();

    private HubConfig hubConfig;
    private Thread runningThread = null;

    public MappingStepRunner(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingClient();
        this.destinationDatabase = hubConfig.getDbName(DatabaseKind.FINAL);
    }

    public StepRunner withFlow(Flow flow) {
        this.flow = flow;
        return this;
    }

    public StepRunner withStep(int step) {
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
        } catch (InterruptedException e) {
        }
    }

    @Override
    public void awaitCompletion(long timeout, TimeUnit unit) throws InterruptedException {
        if (runningThread != null) {
            runningThread.join(unit.convert(timeout, TimeUnit.MILLISECONDS));
        }
    }

    @Override
    public Job run() {
        Job job = Job.withFlow(flow);
        if(this.jobId == null) {
            jobId = UUID.randomUUID().toString();
        }
        job.withJobId(jobId);
        Collector c = new CollectorImpl(this.flow, jobId);
        c.setHubConfig(hubConfig);
        c.setClient(stagingClient);

        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        if (options == null) {
            options = new HashMap<>();
        }
        else {
            if(options.get("fullOutput") != null) {
                isFullOutput = Boolean.parseBoolean(options.get("fullOutput").toString());
            }
        }
        options.put("flow", this.flow.getName());

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(this.jobId, 0, "running collector");
        });

        final DiskQueue<String> uris;
        try {
            uris = c.run(this.flow.getName(),  String.valueOf(step), this.jobId, options);
        } catch (Exception e) {
            job.setCounts(0, 0, 0, 0)
                .withStatus(JobStatus.FAILED.toString());

            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            job.withJobOutput(errors.toString());
            return job;
        }

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(job.getJobId(), 0, "starting step execution");
        });
        Vector<String> errorMessages = new Vector<>();

        DataMovementManager dataMovementManager = stagingClient.newDataMovementManager();

        double batchCount = Math.ceil((double) uris.size() / (double) batchSize);

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();

        ConcurrentHashMap<DatabaseClient, FlowResource> databaseClientMap = new ConcurrentHashMap<>();
        Map<String,Object> fullResponse = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        QueryBatcher queryBatcher = dataMovementManager.newQueryBatcher(uris.iterator())
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(job.getJobId())
            .onUrisReady((QueryBatch batch) -> {
                try {
                    FlowResource flowResource;

                    if (databaseClientMap.containsKey(batch.getClient())) {
                        flowResource = databaseClientMap.get(batch.getClient());
                    } else {
                        flowResource = new FlowResource(batch.getClient(), destinationDatabase, flow);
                        databaseClientMap.put(batch.getClient(), flowResource);
                    }
                    options.put("uris", batch.getItems());

                    RunStepResponse response = flowResource.run(job.getJobId(), step, options);
                    failedEvents.addAndGet(response.errorCount);
                    successfulEvents.addAndGet(response.totalCount - response.errorCount);
                    if (response.errors != null) {
                        if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                            errorMessages.addAll(response.errors.stream().map(jsonNode -> jsonToString(jsonNode)).collect(Collectors.toList()));
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
                            listener.onStatusChange(job.getJobId(), percentComplete, "");
                        });
                    }

                    if (stepItemCompleteListeners.size() > 0) {
                        response.completedItems.forEach((String item) -> {
                            stepItemCompleteListeners.forEach((StepItemCompleteListener listener) -> {
                                listener.processCompletion(job.getJobId(), item);
                            });
                        });
                    }

                    if (stepItemFailureListeners.size() > 0) {
                        response.failedItems.forEach((String item) -> {
                            stepItemFailureListeners.forEach((StepItemFailureListener listener) -> {
                                listener.processFailure(job.getJobId(), item);
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

        JobTicket jobTicket = dataMovementManager.startJob(queryBatcher);
        ticketWrapper.put("jobTicket", jobTicket);

        runningThread = new Thread(() -> {
            queryBatcher.awaitCompletion();

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(job.getJobId(), 100, "");
            });

            stepFinishedListeners.forEach((StepFinishedListener::onFlowFinished));

            dataMovementManager.stopJob(queryBatcher);

            String status;
            JobUpdate jobUpdate = new JobUpdate(hubConfig.newJobDbClient());

            if (failedEvents.get() > 0 && stopOnFailure) {
                status = JobStatus.STOP_ON_ERROR.toString();
            } else if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                status = JobStatus.FINISHED_WITH_ERRORS.toString();
            } else if ((failedEvents.get() == 0 && successfulEvents.get() > 0) || uris.size() == 0) {
                status = "completed step " + step ;
            } else {
                status = JobStatus.FAILED.toString();
            }
            job.setCounts(successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get());
            job.withStatus(status);
            jobUpdate.postJobs(jobId, status, step);
            if (errorMessages.size() > 0) {
                job.withJobOutput(errorMessages);
            }
            if(isFullOutput) {
                job.withFullOutput(fullResponse);
            }
        });

        runningThread.start();
        return job;
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
        private Flow flow;

        public FlowResource(DatabaseClient srcClient, String targetDatabase, Flow flow) {
            super();
            this.flow = flow;
            this.srcClient = srcClient;
            this.targetDatabase = targetDatabase;
            this.srcClient.init("ml:runFlow" , this);
        }


        public RunStepResponse run(String jobId, int step, Map<String, Object> options) {
            RunStepResponse resp;
            try {
                RequestParameters params = new RequestParameters();
                params.add("flow-name", flow.getName());
                params.put("step", String.valueOf(step));
                params.put("job-id", jobId);
                params.put("identifiers", (String) null);
                params.put("target-database", targetDatabase);
                if (options != null) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    params.put("options", objectMapper.writeValueAsString(options));
                }
                ResourceServices.ServiceResultIterator resultItr = this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
                try {
                    if (resultItr == null || !resultItr.hasNext()) {
                        resp = new RunStepResponse();
                    } else {
                        ResourceServices.ServiceResult res = resultItr.next();
                        StringHandle handle = new StringHandle();
                        ObjectMapper objectMapper = new ObjectMapper();
                        resp = objectMapper.readValue(res.getContent(handle).get(), RunStepResponse.class);
                    }
                } finally {
                    if (resultItr != null) {
                        resultItr.close();
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
                throw new RuntimeException(e);
            }
            return resp;
        }

    }

    class JobUpdate extends ResourceManager {
        private static final String NAME = "ml:jobs";

        private RequestParameters params;

        public JobUpdate(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        private void postJobs(String jobId, String status, int step) {
            params = new RequestParameters();
            params.put("jobid", jobId);
            params.put("status", status);
            params.put("step", String.valueOf(step));
            try {
                this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
            }
            catch (Exception e) {
                throw new RuntimeException("Unable to update the job document");
            }

        }

    }
}
