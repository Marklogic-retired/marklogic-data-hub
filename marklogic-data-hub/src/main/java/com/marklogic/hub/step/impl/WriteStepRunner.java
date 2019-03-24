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
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.job.JobUpdate;
import com.marklogic.hub.step.*;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

public class WriteStepRunner implements StepRunner {

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


    private String step = "1";

    private List<StepItemCompleteListener> stepItemCompleteListeners = new ArrayList<>();
    private List<StepItemFailureListener> stepItemFailureListeners = new ArrayList<>();
    private List<StepStatusListener> stepStatusListeners = new ArrayList<>();
    private List<StepFinishedListener> stepFinishedListeners = new ArrayList<>();

    private HubConfig hubConfig;
    private Thread runningThread = null;
    private DataMovementManager dataMovementManager = null;
    private WriteBatcher writeBatcher = null;
    private JobUpdate jobUpdate = new JobUpdate(hubConfig.newJobDbClient());

    public WriteStepRunner(HubConfig hubConfig) {
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
                if ( dataMovementManager != null && writeBatcher != null ) {
                    dataMovementManager.stopJob(writeBatcher);
                }
                runningThread.interrupt();
                throw new TimeoutException("Timeout occurred after "+timeout+" "+unit.toString());
            }
        }
    }

    @Override
    public Job run() {
        runningThread = null;
        Job job = createJob();

        if (options == null) {
            options = new HashMap<>();
        } else {
            if (options.get("fullOutput") != null) {
                isFullOutput = Boolean.parseBoolean(options.get("fullOutput").toString());
            }
        }
        options.put("flow", this.flow.getName());
        Collection<String> uris = null;
        try {
            uris = runCollector();
        } catch (Exception e) {
            job.setCounts(0,0, 0, 0, 0)
                .withStatus(JobStatus.FAILED.toString());
            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            job.withJobOutput(errors.toString());
            jobUpdate.postJobs(jobId, JobStatus.FAILED.toString(), step);
            return job;
        }
        this.runHarmonizer(job,uris);
        return job;
    }

    @Override
    public void stop() {
        dataMovementManager.stopJob(writeBatcher);
    }

    @Override
    public Job run(Collection uris) {
        runningThread = null;
        Job job = createJob();
        return this.runHarmonizer(job,uris);
    }

    private Collection<String> runCollector() throws Exception {
        Collector c = new CollectorImpl(this.flow, jobId);
        c.setHubConfig(hubConfig);
        c.setClient(stagingClient);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(this.jobId, 0, "running collector");
        });

        final DiskQueue<String> uris;
        uris = c.run(this.flow.getName(), step, this.jobId, options);
        return uris;
    }

    private Job runHarmonizer(Job job,Collection uris) {
        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(job.getJobId(), 0, "starting step execution");
        });

        if ( uris == null || uris.size() == 0 ) {
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(job.getJobId(), 100, "collector returned 0 items");
            });
            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));
            job.setCounts(0,0,0,0,0);
            job.withStatus(JobStatus.COMPLETED_PREFIX + step);
            jobUpdate.postJobs(jobId, JobStatus.COMPLETED_PREFIX + step, step);
            return job;
        }

        Vector<String> errorMessages = new Vector<>();

        dataMovementManager = stagingClient.newDataMovementManager();

        double batchCount = Math.ceil((double) uris.size() / (double) batchSize);

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();

        ConcurrentHashMap<DatabaseClient, FlowResource> databaseClientMap = new ConcurrentHashMap<>();
        Map<String,Object> fullResponse = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(job.getJobId())
            .onBatchFailure((batch,throwable) -> {
                failedBatches.addAndGet(1);
                failedEvents.addAndGet(batchSize);
            });

        JobTicket jobTicket = dataMovementManager.startJob(writeBatcher);
        ticketWrapper.put("jobTicket", jobTicket);

        runningThread = new Thread(() -> {
            writeBatcher.awaitCompletion();

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(job.getJobId(), 100, "");
            });

            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));

            dataMovementManager.stopJob(writeBatcher);

            String status;


            if (failedEvents.get() > 0 && stopOnFailure) {
                status = JobStatus.STOP_ON_ERROR.toString();
            } else if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                status = JobStatus.FINISHED_WITH_ERRORS.toString();
            } else if (failedEvents.get() == 0 && successfulEvents.get() > 0)  {
                status = JobStatus.COMPLETED_PREFIX + step ;
            } else {
                status = JobStatus.FAILED.toString();
            }
            job.setCounts(uris.size(),successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get());
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

    private Job createJob() {
        Job job = Job.withFlow(flow);
        if (this.jobId == null) {
            jobId = UUID.randomUUID().toString();
        }
        job.withJobId(jobId);
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


        public RunStepResponse run(String jobId, String step, Map<String, Object> options) {
            RunStepResponse resp;
            try {
                RequestParameters params = new RequestParameters();
                params.add("flow-name", flow.getName());
                params.put("step", step);
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


}
