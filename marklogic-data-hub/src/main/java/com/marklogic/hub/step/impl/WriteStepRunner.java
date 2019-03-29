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
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.datamovement.WriteEvent;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.job.JobUpdate;
import com.marklogic.hub.step.*;
import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicLong;

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
    private String filePath = null;
    private JobUpdate jobUpdate ;

    //TODO: Change source and destination db
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
        jobUpdate = new JobUpdate(hubConfig.newJobDbClient());

        if (options == null || options.get("input_location") == null) {
            throw new RuntimeException("File type and location cannot be empty");
        } else {
            if (options.get("fullOutput") != null) {
                isFullOutput = Boolean.parseBoolean(options.get("fullOutput").toString());
            }
        }

        options.put("flow", this.flow.getName());
        filePath = (String) options.get("input_location");
        this.runIngester(job);
        return job;
    }

    @Override
    public Job run(Collection<String> uris) {
        return null;
    }

    @Override
    public void stop() {
        dataMovementManager.stopJob(writeBatcher);
    }

    private Job runIngester(Job job) {
        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(job.getJobId(), 0, "starting step execution");
        });


        Vector<String> errorMessages = new Vector<>();

        dataMovementManager = stagingClient.newDataMovementManager();

        //TODO: Count number of files to evaluate percent complete

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();


        Map<String,Object> fullResponse = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        //TODO: write the transform e-node code and change its name here
        String transform =  "ml:inputFlow";
        ServerTransform serverTransform = new ServerTransform(transform);
        serverTransform.addParameter("job-id", jobId);
        serverTransform.addParameter("flow-name", flow.getName());
        //TODO: convert options to jsonstring
        //String optionString = jsonToString(options);
        String optionString = null;
        serverTransform.addParameter("options", optionString);

        writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(job.getJobId())
            .withTransform(serverTransform)

        //TODO:percentComplete
/*        //int percentComplete = (int) (((double) successfulBatches.get() / batchCount) * 100.0);
        int percentComplete = 0;
        if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
            previousPercentComplete = percentComplete;
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(job.getJobId(), percentComplete, "");
            });
        }*/
            .onBatchSuccess(batch ->{
                successfulEvents.addAndGet(batch.getItems().length );
                successfulBatches.addAndGet(1);
                if (stepItemCompleteListeners.size() > 0) {
                    Arrays.stream(batch.getItems()).forEach((WriteEvent e) -> {
                        stepItemCompleteListeners.forEach((StepItemCompleteListener listener) -> {
                            listener.processCompletion(job.getJobId(), e.getTargetUri());
                        });
                    });
                }

            })
            .onBatchFailure((batch, ex) -> {
                failedEvents.addAndGet(batch.getItems().length);
                failedBatches.addAndGet(1);
                if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                    errorMessages.add(ex.toString());
                }
                if(stepItemFailureListeners.size() > 0) {
                    Arrays.stream(batch.getItems()).forEach((WriteEvent e) -> {
                        stepItemFailureListeners.forEach((StepItemFailureListener listener) -> {
                            listener.processFailure(job.getJobId(), e.getTargetUri());
                        });
                    });
                }

                if (stopOnFailure ) {
                    JobTicket jobTicket = ticketWrapper.get("jobTicket");
                    if (jobTicket != null) {
                        dataMovementManager.stopJob(jobTicket);
                    }
                }


            });
        try {
            Files.find(Paths.get(filePath),
                Integer.MAX_VALUE,
                (filePath, fileAttr) -> fileAttr.isRegularFile())
                .forEach(path ->{
                    try {
                        File file = path.toFile();
                        String fileFormat = FilenameUtils.getExtension(file.getName());
                        FileInputStream docStream = new FileInputStream(file);
                        InputStreamHandle handle = new InputStreamHandle(docStream);
                        Format format = null;
                        switch (fileFormat) {
                            case "xml":
                                format = Format.XML;
                                break;
                            case "json":
                                format = Format.JSON;
                                break;
                            default:
                                format = Format.BINARY;
                        }
                        handle.setFormat(format);
                        writeBatcher.add(file.getAbsolutePath(), handle);
                    } catch (FileNotFoundException e) {
                        throw new RuntimeException(e);
                    }

                });
        } catch (IOException e) {
            e.printStackTrace();
        }

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
            job.setCounts(successfulEvents.get()+failedEvents.get(),successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get());
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

}
