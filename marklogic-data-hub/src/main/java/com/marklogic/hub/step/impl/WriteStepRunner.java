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
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.*;
import com.marklogic.hub.util.json.JSONObject;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.SystemUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.text.SimpleDateFormat;
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
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private String step = "1";
    private static final SimpleDateFormat DATE_TIME_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
    private List<StepItemCompleteListener> stepItemCompleteListeners = new ArrayList<>();
    private List<StepItemFailureListener> stepItemFailureListeners = new ArrayList<>();
    private List<StepStatusListener> stepStatusListeners = new ArrayList<>();
    private List<StepFinishedListener> stepFinishedListeners = new ArrayList<>();

    private HubConfig hubConfig;
    private Thread runningThread = null;
    private DataMovementManager dataMovementManager = null;
    private WriteBatcher writeBatcher = null;
    private String inputFilePath = null;
    private JobDocManager jobDocManager;
    private String outputCollections;
    private String outputPermissions;
    private String outputFormat;
    private String inputFileType;
    private String outputURIReplacement;
    private AtomicBoolean isStopped = new AtomicBoolean(false);
    private IngestionStepDefinitionImpl stepDef;
    private Map<String, Object> stepConfig = new HashMap<>();

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

    public StepRunner withStepDefinition(StepDefinition stepDefinition){
        this.stepDef = (IngestionStepDefinitionImpl) stepDefinition;
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
        //no op for WriteStepRunner
        return this;
    }

    @Override
    public StepRunner withDestinationDatabase(String destinationDatabase) {
        this.destinationDatabase = destinationDatabase;
        //will work only for final db in addition to staging db as it has flow/step artifacts
        this.stagingClient = hubConfig.newStagingClient(this.destinationDatabase);
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
                if ( dataMovementManager != null && writeBatcher != null ) {
                    dataMovementManager.stopJob(writeBatcher);
                }
                runningThread.interrupt();
                throw new TimeoutException("Timeout occurred after "+timeout+" "+unit.toString());
            }
        }
    }

    @Override
    public int getBatchSize(){
        return this.batchSize;
    }

    @Override
    public RunStepResponse run() {
        runningThread = null;
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        jobDocManager = new JobDocManager(hubConfig.newJobDbClient());

        JsonNode comboOptions = null;
        try {
            comboOptions = JSONObject.readInput(JSONObject.writeValueAsString(options));
        } catch (IOException e) {
           throw new RuntimeException(e);
        }
        JSONObject obj = new JSONObject(comboOptions);


        if (obj.getArrayString("collections") != null) {
            outputCollections = StringUtils.join(obj.getArrayString("collections"), ",");
        }
        if (obj.getString("permissions") != null) {
            outputPermissions = obj.getString("permissions");
        }
        if (obj.getString("targetDatabase") != null) {
            this.withDestinationDatabase(obj.getString("targetDatabase"));
        }
        if (obj.getString("outputFormat") != null) {
            outputFormat = obj.getString("outputFormat");
        }

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> stepDefFileLocation = new HashMap<>();
        Map<String, Object> stepFileLocation = new HashMap<>();
        Map<String, Object> fileLocation = new HashMap<>();
        if(stepDef.getFileLocations() != null) {
            stepDefFileLocation = mapper.convertValue(stepDef.getFileLocations(), Map.class);
            fileLocation.putAll(stepDefFileLocation);
        }
        if(flow.getStep(step).getFileLocations() != null) {
            stepFileLocation =  mapper.convertValue(flow.getStep(step).getFileLocations(), Map.class);
            fileLocation.putAll(stepFileLocation);
        }

        inputFilePath = (String)fileLocation.get("inputFilePath");
        inputFileType = (String)fileLocation.get("inputFileType");
        outputURIReplacement = (String)fileLocation.get("outputURIReplacement");

        if(stepConfig.get("batchSize") != null){
            this.batchSize = Integer.parseInt(stepConfig.get("batchSize").toString());
        }
        if(stepConfig.get("threadCount") != null) {
            this.threadCount = Integer.parseInt(stepConfig.get("threadCount").toString());
        }
        if(stepConfig.get("fileLocations") != null) {
            HashMap<String, String> fileLocations = (HashMap) stepConfig.get("fileLocations");
            if(fileLocations.get("inputFilePath") != null) {
                this.inputFilePath = fileLocations.get("inputFilePath");
            }
            if(fileLocations.get("inputFileType") != null){
                this.inputFileType = fileLocations.get("inputFileType");
            }
            if(fileLocations.get("outputURIReplacement") != null) {
                this.outputURIReplacement = fileLocations.get("outputURIReplacement");
            }
        }
        if(stepConfig.get("stopOnFailure") != null){
            this.withStopOnFailure(Boolean.parseBoolean(stepConfig.get("stopOnFailure").toString()));
        }

        if (inputFilePath == null || inputFileType == null) {
            throw new RuntimeException("File path and type cannot be empty");
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
            uris = runFileCollector();
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
            //If not able to read the step resp from the job doc, send the in-memory resp without start/end time
            try {
                return StepRunnerUtil.getResponse(jobDoc, step);
            }
            catch (Exception ex)
            {
                return runStepResponse;
            }
        }
        return this.runIngester(runStepResponse,uris);
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
        return this.runIngester(runStepResponse,uris);
    }

    @Override
    public void stop() {
        isStopped.set(true);
        if(writeBatcher != null) {
            dataMovementManager.stopJob(writeBatcher);
        }
    }

    private Collection<String> runFileCollector() throws Exception {
        FileCollector c = new FileCollector(inputFilePath, inputFileType);
        c.setHubConfig(hubConfig);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(this.jobId, 0, JobStatus.RUNNING_PREFIX + step, 0, 0,  "fetching files");
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

    private RunStepResponse runIngester(RunStepResponse runStepResponse, Collection<String> uris) {
        AtomicLong successfulEvents = new AtomicLong(0);
        AtomicLong failedEvents = new AtomicLong(0);
        AtomicLong successfulBatches = new AtomicLong(0);
        AtomicLong failedBatches = new AtomicLong(0);

        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(runStepResponse.getJobId(), 0, JobStatus.RUNNING_PREFIX + step, 0, 0, "starting step execution");
        });
        if ( !isStopped.get() && (uris == null || uris.size() == 0 )) {
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, JobStatus.COMPLETED_PREFIX + step, 0, 0, "provided file path returned 0 items");
            });
            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));
            runStepResponse.setCounts(0,0,0,0,0);
            runStepResponse.withStatus(JobStatus.COMPLETED_PREFIX + step);
            JsonNode jobDoc;
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
            .withJobId(runStepResponse.getJobId())
            .withTransform(serverTransform)
            .onBatchSuccess(batch ->{
                //TODO: There is one additional item returned, it has to be investigated
                successfulEvents.addAndGet(batch.getItems().length-1);
                successfulBatches.addAndGet(1);
                runStatusListener(successfulBatches.get()+failedBatches.get(), batchCount, successfulEvents, failedEvents);
                if (stepItemCompleteListeners.size() > 0) {
                    Arrays.stream(batch.getItems()).forEach((WriteEvent e) -> {
                        stepItemCompleteListeners.forEach((StepItemCompleteListener listener) -> {
                            listener.processCompletion(runStepResponse.getJobId(), e.getTargetUri());
                        });
                    });
                }
            })
            .onBatchFailure((batch, ex) -> {
                failedEvents.addAndGet(batch.getItems().length-1);
                failedBatches.addAndGet(1);
                runStatusListener(successfulBatches.get()+failedBatches.get(), batchCount, successfulEvents, failedEvents);
                if (errorMessages.size() < MAX_ERROR_MESSAGES) {
                    errorMessages.add(ex.getLocalizedMessage());
                }
                if(stepItemFailureListeners.size() > 0) {
                    Arrays.stream(batch.getItems()).forEach((WriteEvent e) -> {
                        stepItemFailureListeners.forEach((StepItemFailureListener listener) -> {
                            listener.processFailure(runStepResponse.getJobId(), e.getTargetUri());
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

        if(flow.getName().equals("default-ingestion")) {
            metadataHandle.withCollections("default-ingestion");
        }
        // Set metadata values
        DocumentMetadataHandle.DocumentMetadataValues metadataValues = metadataHandle.getMetadataValues();
        metadataValues.add("datahubCreatedByJob", jobId);
        metadataValues.add("datahubCreatedInFlow", flow.getName());
        metadataValues.add("datahubCreatedByStep", flow.getStep(step).getStepDefinitionName());
        // TODO createdOn/createdBy data may not be accurate enough. Unfortunately REST transforms don't allow for writing metadata
        metadataValues.add("datahubCreatedOn", DATE_TIME_FORMAT.format(new Date()));
        metadataValues.add("datahubCreatedBy", ((HubConfigImpl) hubConfig).getMlUsername());
        writeBatcher.withDefaultMetadata(metadataHandle);
        Format format = null;
        switch (inputFileType.toLowerCase()) {
            case "xml":
                format = Format.XML;
                break;
            case "json":
                format = Format.JSON;
                break;
            case "csv":
                format = Format.JSON;
                break;
            case "text":
                format = Format.TEXT;
                break;
            default:
                format = Format.BINARY;
        }
        final Format fileFormat = format;
        Iterator itr = uris.iterator();
        if(!isStopped.get()){
            JobTicket jobTicket = dataMovementManager.startJob(writeBatcher);
            ticketWrapper.put("jobTicket", jobTicket);
            while(itr.hasNext()) {
                try {
                    File file = new File((String) itr.next());
                    addToBatcher(file, fileFormat);
                }
                catch (Exception e) {
                    throw new RuntimeException(e);
                }
            }
        }

        runningThread = new Thread(() -> {
            try {
                writeBatcher.flushAndWait();
            }
            catch (IllegalStateException e) {
                logger.error("WriteBatcher has been stopped");
            }

            String stepStatus;
            if (failedEvents.get() > 0 && stopOnFailure) {
                stepStatus = JobStatus.STOP_ON_ERROR_PREFIX + step;
            } else if (isStopped.get()){
                stepStatus = JobStatus.CANCELED_PREFIX + step;
            } else if (failedEvents.get() > 0 && successfulEvents.get() > 0) {
                stepStatus = JobStatus.COMPLETED_WITH_ERRORS_PREFIX + step;
            } else if (failedEvents.get() == 0 && successfulEvents.get() > 0)  {
                stepStatus = JobStatus.COMPLETED_PREFIX + step ;
            } else {
                stepStatus = JobStatus.FAILED_PREFIX + step;
            }

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, stepStatus, successfulEvents.get(), failedEvents.get(), "Ingestion completed");
            });

            stepFinishedListeners.forEach((StepFinishedListener::onStepFinished));

            dataMovementManager.stopJob(writeBatcher);

            runStepResponse.setCounts(successfulEvents.get() + failedEvents.get(),successfulEvents.get(), failedEvents.get(), successfulBatches.get(), failedBatches.get());
            runStepResponse.withStatus(stepStatus);
            if (errorMessages.size() > 0) {
                runStepResponse.withStepOutput(errorMessages);
            }
            if(isFullOutput) {
                runStepResponse.withFullOutput(fullResponse);
            }
            JsonNode jobDoc = null;
            try {
                jobDoc = jobDocManager.postJobs(jobId, stepStatus, step, stepStatus.equalsIgnoreCase(JobStatus.COMPLETED_PREFIX + step) ? step : null, runStepResponse);
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

    private void addToBatcher(File file, Format fileFormat) throws  IOException{
        FileInputStream docStream = new FileInputStream(file);
        if(inputFileType.equalsIgnoreCase("csv")) {
            JacksonCSVSplitter splitter = new JacksonCSVSplitter();
            try {
                if(! writeBatcher.isStopped()) {
                    Stream<JacksonHandle> contentStream = splitter.split(docStream);
                    String uri = file.getParent();
                    if(SystemUtils.OS_NAME.toLowerCase().contains("windows")){
                        uri = "/" + FilenameUtils.separatorsToUnix(StringUtils.replaceOnce(uri, ":", ""));
                    }
                    uri =  generateAndEncodeURI(outputURIReplace(uri)).replace("%", "%%");
                    Stream<DocumentWriteOperation> documentStream =  DocumentWriteOperation.from(
                        contentStream, DocumentWriteOperation.uriMaker(uri +"/%s." + ("xml".equalsIgnoreCase(outputFormat) ? "xml":"json")));
                    try {
                        writeBatcher.addAll(documentStream);
                    }
                    catch (IllegalStateException e) {
                        logger.error("WriteBatcher has been stopped");
                    }
                }
            } catch (Exception e) {
               throw new RuntimeException(e);
            }
        }
        else {
            InputStreamHandle handle = new InputStreamHandle(docStream);
            handle.setFormat(fileFormat);
            try {
                if(! writeBatcher.isStopped()) {
                    try {
                        String uri = file.getAbsolutePath();
                        //In case of Windows, C:\\Documents\\abc.json will be converted to /c/Documents/abc.json
                        if(SystemUtils.OS_NAME.toLowerCase().contains("windows")){
                            uri = "/" + FilenameUtils.separatorsToUnix(StringUtils.replaceOnce(uri, ":", ""));
                        }
                        writeBatcher.add(generateAndEncodeURI(outputURIReplace(uri)), handle);
                    }
                    catch (IllegalStateException e) {
                        logger.error("WriteBatcher has been stopped");
                    }
                }
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
                if (!DocumentMetadataHandle.Capability.READ.toString().equalsIgnoreCase(perm) &&
                    !DocumentMetadataHandle.Capability.EXECUTE.toString().equalsIgnoreCase(perm) &&
                    !DocumentMetadataHandle.Capability.INSERT.toString().equalsIgnoreCase(perm) &&
                    !DocumentMetadataHandle.Capability.UPDATE.toString().equalsIgnoreCase(perm) &&
                    !DocumentMetadataHandle.Capability.NODE_UPDATE.toString().equalsIgnoreCase(perm)) {
                    throw new IllegalArgumentException("Illegal capability: " + perm);
                }
                metadataHandle.withPermission(roleName, DocumentMetadataHandle.Capability.getValueOf(perm));
                i++;
            }
        }
    }

    private String outputURIReplace(String uri) {
        if (StringUtils.isNotEmpty(outputURIReplacement)) {
            String[] replace = outputURIReplacement.split(",");
            // URI replace comes in pattern and replacement pairs.
            if (replace.length % 2 != 0) {
                throw new IllegalArgumentException(
                    "Invalid argument for URI replacement: " + outputURIReplacement);
            }
            // Replacement string is expected to be in ''
            for (int i = 0; i < replace.length - 1; i++) {
                String replacement = replace[++i].trim();
                if (!replacement.startsWith("'") ||
                    !replacement.endsWith("'")) {
                    throw new IllegalArgumentException(
                        "Invalid argument for URI replacement: " + outputURIReplacement);
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
                listener.onStatusChange(jobId, percentComplete, JobStatus.RUNNING_PREFIX + step, successfulEvents.get(), failedEvents.get(), "Ingesting");
            });
        }
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
