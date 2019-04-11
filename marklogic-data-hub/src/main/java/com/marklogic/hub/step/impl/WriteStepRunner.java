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
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.datamovement.*;
import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.collector.DiskQueue;
import com.marklogic.hub.collector.impl.FileCollector;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.job.Job;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.job.JobUpdate;
import com.marklogic.hub.step.*;
import com.marklogic.hub.util.json.JSONObject;
import org.apache.commons.lang3.StringUtils;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Stream;

public class WriteStepRunner implements StepRunner {

    private static final int MAX_ERROR_MESSAGES = 10;
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
    private AtomicBoolean isStopped = new AtomicBoolean(false);

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
        Map<String,Object> flowMap = mapper.convertValue(flow.getOptions(), Map.class);
        Map combinedOptions = new HashMap<>();
        //TODO: Get options from processors to override
        if(stepMap != null){
            combinedOptions.putAll(stepMap);
        }
        if(flowMap != null) {
            combinedOptions.putAll(flowMap);
        }
        if(options != null) {
            combinedOptions.putAll(options);
        }
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
        if (options == null || options.get("inputFilePath") == null) {
            throw new RuntimeException("File type and location cannot be empty");
        }
        JsonNode comboOptions = null;
        try {
            comboOptions = JSONObject.readInput(JSONObject.writeValueAsString(options));
        } catch (IOException e) {
           throw new RuntimeException(e);
        }
        JSONObject obj = new JSONObject(comboOptions);

        filePath = obj.getString("inputFilePath");
        inputFormat = obj.getString("inputFileType");
        outputFormat = obj.getString("outputFormat");
        outputCollections = StringUtils.join(obj.getArrayString("collections"), ",");
        outputPermissions = (String) options.get("outputPermissions");
        outputUriReplace = obj.getString("outputURIReplacement");
        options.put("flow", this.flow.getName());

        Collection<String> uris = null;
        //If current step is the first run step, a job doc is created
        try{
            jobUpdate.getJobs(jobId);
        }
        catch(ResourceNotFoundException e) {
            jobUpdate.postJobs(jobId,flow.getName());
        }
        try {
            jobUpdate.postJobs(jobId, JobStatus.RUNNING_PREFIX + step, step);
        }
        catch (Exception ex) {
            throw ex;
        }
        try {
            uris = runFileCollector();
        } catch (Exception e) {
            e.printStackTrace();
            job.setCounts(0,0, 0, 0, 0)
                .withStatus(JobStatus.FAILED.toString());
            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            job.withStepOutput(errors.toString());
            //TODO: create job doc if not present
            try {
                jobUpdate.postJobs(jobId, JobStatus.FAILED_PREFIX + step, step);
            }
            catch (Exception ex) {
                throw ex;
            }
            return job;
        }
        this.runIngester(job,uris);
        return job;
    }

    @Override
    public Job run(Collection<String> uris) {
        runningThread = null;
        Job job = createJob();
        return this.runIngester(job,uris);
    }

    @Override
    public void stop() {
        isStopped.set(true);
        if(writeBatcher != null) {
            dataMovementManager.stopJob(writeBatcher);
        }
    }

    private Collection<String> runFileCollector() throws Exception {
        FileCollector c = new FileCollector(filePath, inputFormat);
        c.setHubConfig(hubConfig);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(this.jobId, 0, 0, 0,  "fetching files");
        });
        final DiskQueue<String> uris ;
        try {
            if(!isStopped.get()) {
                uris = c.run();
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

    private Job runIngester(Job job, Collection<String> uris) {
        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(job.getJobId(), 0, 0, 0, "starting step execution");
        });
        if ( !isStopped.get() && (uris == null || uris.size() == 0 )) {
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(job.getJobId(), 100, 0, 0, "provided file path returned 0 items");
            });
            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));
            job.setCounts(0,0,0,0,0);
            job.withStatus(JobStatus.COMPLETED_PREFIX + step);
            try {
                jobUpdate.postJobs(jobId, JobStatus.COMPLETED_PREFIX + step, step);
            }
            catch (Exception e) {
                throw e;
            }

            return job;
        }

        Vector<String> errorMessages = new Vector<>();
        dataMovementManager = stagingClient.newDataMovementManager();

        HashMap<String, JobTicket> ticketWrapper = new HashMap<>();


        Map<String,Object> fullResponse = new HashMap<>();

        ServerTransform serverTransform = new ServerTransform("ml:runIngest");
        serverTransform.addParameter("job-id", jobId);
        serverTransform.addParameter("step", step);
        serverTransform.addParameter("flow-name", flow.getName());
        String optionString = jsonToString(options);
        serverTransform.addParameter("options", optionString);
        double batchCount = Math.ceil((double) uris.size() / (double) batchSize);

        writeBatcher = dataMovementManager.newWriteBatcher()
            .withBatchSize(batchSize)
            .withThreadCount(threadCount)
            .withJobId(job.getJobId())
            .withTransform(serverTransform)
            .onBatchSuccess(batch ->{
                successfulEvents.addAndGet(batch.getItems().length );
                successfulBatches.addAndGet(1);
                runStatusListener(successfulBatches.get()+failedBatches.get(), batchCount, successfulEvents, failedEvents);
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
                runStatusListener(successfulBatches.get()+failedBatches.get(), batchCount, successfulEvents, failedEvents);
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
        //Apply permissions
        if(StringUtils.isNotEmpty(outputPermissions)) {
            try{
                applyPermissions(outputPermissions, metadataHandle);
            }
            catch (Exception e){
                throw e;
            }
        }
        //Set the collections
        if(StringUtils.isNotEmpty(outputCollections)) {
            metadataHandle.withCollections(outputCollections.split(","));
        }

        if(flow.getName().equals("default-ingest")) {
            metadataHandle.withCollections("default-ingest");
        }
        writeBatcher.withDefaultMetadata(metadataHandle);
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
        Iterator itr = uris.iterator();
        if(!isStopped.get()){
            while(itr.hasNext()) {
                try {
                    File file = new File((String) itr.next());
                    addToBatcher(file, fileFormat);
                }
                catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
            JobTicket jobTicket = dataMovementManager.startJob(writeBatcher);
            ticketWrapper.put("jobTicket", jobTicket);

        }

        runningThread = new Thread(() -> {
            writeBatcher.flushAndWait();

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(job.getJobId(), 100, successfulEvents.get(), failedEvents.get(), "Ingestion completed");
            });

            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));

            dataMovementManager.stopJob(writeBatcher);

            String status;

            if (failedEvents.get() > 0 && stopOnFailure) {
                status = JobStatus.STOP_ON_ERROR_PREFIX + step;
            } else if(isStopped.get()){
                status = JobStatus.CANCELED_PREFIX + step;
            } else if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                status = JobStatus.COMPLETED_WITH_ERRORS_PREFIX + step;
            } else if (failedEvents.get() == 0 && successfulEvents.get() > 0)  {
                status = JobStatus.COMPLETED_PREFIX + step ;
            } else {
                status = JobStatus.FAILED_PREFIX + step;
            }
            job.setCounts(successfulEvents.get() + failedEvents.get(),successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get());
            job.withStatus(status);
            jobUpdate.postJobs(jobId, status, step, status.equalsIgnoreCase(JobStatus.COMPLETED_PREFIX + step)?step:null);
            if (errorMessages.size() > 0) {
                job.withStepOutput(errorMessages);
            }
            if(isFullOutput) {
                job.withFullOutput(fullResponse);
            }
        });

        runningThread.start();
        return job;
    }

    private void addToBatcher(File file, Format fileFormat) throws  IOException{
        FileInputStream docStream = new FileInputStream(file);
        if(inputFormat.equalsIgnoreCase("csv")) {
            JacksonCSVSplitter splitter = new JacksonCSVSplitter();
            try {
                Stream<JacksonHandle> contentStream = splitter.split(docStream);
                Path dirPath = Paths.get(filePath);
                String uri = null;
                if(! dirPath.isAbsolute()) {
                    File csvFile = new File(hubConfig.getProjectDir(), dirPath.toString());
                    uri = generateAndEncodeURI(csvFile.getParentFile().getAbsolutePath());

                }
                Stream<DocumentWriteOperation> documentStream =  DocumentWriteOperation.from(
                    contentStream, DocumentWriteOperation.uriMaker(outputURIReplace(uri)+"/%s.json"));
                writeBatcher.addAll(documentStream);
            } catch (Exception e) {
               throw new RuntimeException(e);
            }
        }
        else {
            InputStreamHandle handle = new InputStreamHandle(docStream);
            handle.setFormat(fileFormat);
            try {
                writeBatcher.add(outputURIReplace(generateAndEncodeURI(file.getAbsolutePath())), handle);
            } catch (URISyntaxException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private String generateAndEncodeURI(String path) throws  URISyntaxException {
        URI uri = new URI(null, null, null, 0, path, null, null);
        return uri.toString();
    }

    private void applyPermissions(String permissions, DocumentMetadataHandle metadataHandle) {
        String[] perms = permissions.split(",");
        if (perms != null && perms.length > 0) {
            if (perms.length % 2 != 0) {
                throw new IllegalArgumentException(
                    "Permissions are expected to be in <role, capability> pairs.");
            }
            int i = 0;
            while (i + 1 < perms.length) {
                String roleName = perms[i++];
                if (roleName == null || roleName.isEmpty()) {
                    throw new IllegalArgumentException(
                        "Illegal role name: " + roleName);
                }
                String perm = perms[i].trim();
                if (!perm.equalsIgnoreCase(DocumentMetadataHandle.Capability.READ.toString()) &&
                    !perm.equalsIgnoreCase(DocumentMetadataHandle.Capability.EXECUTE.toString()) &&
                    !perm.equalsIgnoreCase(DocumentMetadataHandle.Capability.INSERT.toString()) &&
                    !perm.equalsIgnoreCase(DocumentMetadataHandle.Capability.UPDATE.toString()) &&
                    !perm.equalsIgnoreCase(DocumentMetadataHandle.Capability.NODE_UPDATE.toString())) {
                    throw new IllegalArgumentException("Illegal capability: " + perm);
                }
                metadataHandle.withPermission(roleName, DocumentMetadataHandle.Capability.getValueOf(perm));
                i++;
            }
        }
    }

    private String outputURIReplace(String uri) {
        if (StringUtils.isNotEmpty(outputUriReplace)) {
            String[] replace = outputUriReplace.split(",");
            // URI replace comes in pattern and replacement pairs.
            if (replace.length % 2 != 0) {
                throw new IllegalArgumentException(
                    "Invalid argument for URI replacement: " + outputUriReplace);
            }
            // Replacement string is expected to be in ''
            for (int i = 0; i < replace.length - 1; i++) {
                String replacement = replace[++i].trim();
                if (!replacement.startsWith("'") ||
                    !replacement.endsWith("'")) {
                    throw new IllegalArgumentException(
                        "Invalid argument for URI replacement: " + outputUriReplace);
                }
            }
            for (int i = 0; i < replace.length - 1; i += 2) {
                String replacement = replace[i + 1].trim();
                replacement = replacement.substring(1, replacement.length() - 1);
                uri = uri.replaceAll(replace[i], replacement);
            }
        }
        return uri;
    }

    private void runStatusListener(long totalRunBatches, double batchCount, AtomicLong successfulEvents, AtomicLong failedEvents) {
        int percentComplete = (int) (((double) totalRunBatches/ batchCount) * 100.0);
        if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
            previousPercentComplete = percentComplete;
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(jobId, percentComplete, successfulEvents.get(), failedEvents.get(), "Ingesting");
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
