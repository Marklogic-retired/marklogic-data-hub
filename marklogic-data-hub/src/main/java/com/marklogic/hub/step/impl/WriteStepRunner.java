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
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.job.JobUpdate;
import com.marklogic.hub.step.*;
import com.marklogic.hub.util.json.JSONObject;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;

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

    private static final int MAX_ERROR_MESSAGES = 10;
    private static final int MAX_FILE_PATHS = 100000;
    private Flow flow;
    private int batchSize;
    private int threadCount;
    private DatabaseClient stagingClient;
    private String destinationDatabase;
    private int previousPercentComplete;
    private Map<String, Object> options;
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
    private String outputCollections;
    private String outputPermissions;
    private String inputFormat;
    private String outputFormat;
    private String outputUriReplace;

    public WriteStepRunner(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        this.stagingClient = hubConfig.newStagingClient();
        this.destinationDatabase = hubConfig.getDbName(DatabaseKind.STAGING);
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
        //will work only for final db in addition to staging db as it has flow/step artifacts
        this.stagingClient = hubConfig.newStagingClient(destinationDatabase);
        return this;
    }

    @Override
    public StepRunner withStopOnFailure(boolean stopOnFailure) {
        this.stopOnFailure = stopOnFailure;
        return this;
    }

    @Override
    public StepRunner withOptions(Map<String, Object> options) {
        if(flow == null){
            throw new DataHubConfigurationException("Flow and Step has to be set before setting options");
        }
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> stepMap = mapper.convertValue(this.flow.getStep(step).getOptions(), Map.class);
        Map combinedOptions = new HashMap<>();

        combinedOptions.putAll(options);
        combinedOptions.putAll(stepMap);
        this.options = combinedOptions;
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
        if (options == null || options.get("input_file_path") == null) {
            throw new RuntimeException("File type and location cannot be empty");
        }
        JsonNode comboOptions = null;
        try {
            comboOptions = JSONObject.readInput(JSONObject.writeValueAsString(options));
        } catch (IOException e) {
            e.printStackTrace();
        }
        JSONObject obj = new JSONObject(comboOptions);

        filePath = obj.getString("input_file_path");
        inputFormat = obj.getString("input_file_type");
        outputFormat = obj.getString("outputFormat");
        outputCollections = StringUtils.join(obj.getArrayString("collections"), ",");
        outputPermissions = (String) options.get("output_permissions");
        outputUriReplace = obj.getString("output_uri_replace");
        options.put("flow", this.flow.getName());

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

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();

        List<String> fileAbsPaths = new ArrayList<>();
        AtomicLong fileCount = new AtomicLong(0L);
        try {
            Files.find(Paths.get(filePath),
                Integer.MAX_VALUE,
                (filePath, fileAttr) -> fileAttr.isRegularFile())
                .forEach(path -> {
                    File file = path.toFile();
                    if(FilenameUtils.getExtension(file.getName()).equalsIgnoreCase(inputFormat)) {
                        fileCount.incrementAndGet();
                        if(fileAbsPaths.size() < MAX_FILE_PATHS) {
                            fileAbsPaths.add(path.toFile().getAbsolutePath());
                        }
                    }
                });
        } catch (IOException e) {
            e.printStackTrace();
        }

        Map<String,Object> fullResponse = new HashMap<>();

        String transform =  "ml:runIngest";
        ServerTransform serverTransform = new ServerTransform(transform);
        serverTransform.addParameter("job-id", jobId);
        serverTransform.addParameter("step", step);
        serverTransform.addParameter("flow-name", flow.getName());
        String optionString = jsonToString(options);
        serverTransform.addParameter("options", optionString);
        double batchCount = Math.ceil((double) fileCount.get() / (double) batchSize);

        writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(job.getJobId())
            .withTransform(serverTransform)
            .onBatchSuccess(batch ->{
                successfulEvents.addAndGet(batch.getItems().length );
                successfulBatches.addAndGet(1);
                runStatusListener(successfulBatches.get()+failedBatches.get(), batchCount);
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
                runStatusListener(successfulBatches.get()+failedBatches.get(), batchCount);
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

            DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
            if(StringUtils.isNotEmpty(outputPermissions)){
                String[] perms = outputPermissions.split("\\s*,\\s*");
                int index = 0;
                while(index < perms.length) {
                    metadataHandle.withPermission(perms[index], DocumentMetadataHandle.Capability.getValueOf(perms[++index]));
                    index++;
                }
            }
            if(StringUtils.isNotEmpty(outputCollections)) {
                metadataHandle.withCollections(outputCollections.split("\\s*,\\s*"));
            }

            if(flow.getName().equals("default-ingest")) {
                metadataHandle.withCollections("default-ingest");
            }
            Format format = null;
            switch (inputFormat.toLowerCase()) {
                case "xml":
                    format = Format.XML;
                    break;
                case "json":
                    format = Format.JSON;
                    break;
                case "csv":
                    format = Format.JSON;
                    break;
                case "txt":
                    format = Format.TEXT;
                    break;
                default:
                    format = Format.BINARY;
            }
            final Format fileFormat = format;
            if(fileAbsPaths.size() < MAX_FILE_PATHS) {
                fileAbsPaths.stream().forEach((path) ->{
                    File file = new File(path);
                    try {
                        addToBatcher(file, fileFormat, metadataHandle);
                    } catch (IOException e) {
                        throw new RuntimeException(e);
                    }
                });
            }
            else {
                try {
                    Files.find(Paths.get(filePath),
                        Integer.MAX_VALUE,
                        (filePath, fileAttr) -> fileAttr.isRegularFile())
                        .forEach(path -> {
                            try {
                                File file = path.toFile();
                                if(FilenameUtils.getExtension(file.getName()).equalsIgnoreCase(inputFormat)) {
                                    addToBatcher(file, fileFormat, metadataHandle);
                                }
                            } catch (FileNotFoundException e) {
                                throw new RuntimeException(e);
                            } catch (IOException e) {
                                throw new RuntimeException(e);
                            }

                        });
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
        JobTicket jobTicket = dataMovementManager.startJob(writeBatcher);
        ticketWrapper.put("jobTicket", jobTicket);

        runningThread = new Thread(() -> {
            writeBatcher.flushAndWait();

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

    private void addToBatcher(File file, Format fileFormat, DocumentMetadataHandle metadataHandle) throws  IOException{
        FileInputStream docStream = new FileInputStream(file);
        InputStreamHandle handle = new InputStreamHandle(docStream);
        handle.setFormat(fileFormat);
/*        String absPath = file.getAbsolutePath();
        String[] inputs = outputUriReplace.split(",", 2);
        String stringToBeReplaced = inputs[0];
        String */
        writeBatcher.add(file.getAbsolutePath(), metadataHandle, handle);
    }

    private void runStatusListener(long totalRunBatches, double batchCount) {
        int percentComplete = (int) (((double) totalRunBatches/ batchCount) * 100.0);
        if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
            previousPercentComplete = percentComplete;
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(jobId, percentComplete, "");
            });
        }
    }

    private Job createJob() {
        Job job = Job.withFlow(flow);
        if (this.jobId == null) {
            jobId = UUID.randomUUID().toString();
        }
        job.withJobId(jobId);
        return job;
    }

    private String jsonToString(Map map) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(objectMapper.convertValue(map, JsonNode.class));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}
