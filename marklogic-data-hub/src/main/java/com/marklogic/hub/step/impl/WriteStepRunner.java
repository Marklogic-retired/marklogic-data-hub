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
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.JacksonCSVSplitter;
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.client.dataservices.InputCaller;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.marker.BufferableHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.dataservices.BulkUtil;
import com.marklogic.hub.dataservices.JobService;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.StepItemCompleteListener;
import com.marklogic.hub.step.StepItemFailureListener;
import com.marklogic.hub.step.StepRunner;
import com.marklogic.hub.step.StepStatusListener;
import com.marklogic.hub.util.DiskQueue;
import com.marklogic.hub.util.json.JSONObject;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.SystemUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StreamUtils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.FileNameMap;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLConnection;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class WriteStepRunner implements StepRunner {

    private static final int MAX_ERROR_MESSAGES = 10;
    private static final Pattern percentPattern = Pattern.compile("%", Pattern.LITERAL);
    private Flow flow;
    private int batchSize;
    private int threadCount;
    private String destinationDatabase;
    private int previousPercentComplete;
    protected long csvFilesProcessed;
    private String currentCsvFile;
    private Map<String, Object> combinedOptions;
    private boolean stopOnFailure = false;
    private String jobId;
    protected final Logger logger = LoggerFactory.getLogger(getClass());

    private String step = "1";
    private static final String DATE_TIME_FORMAT_PATTERN = "yyyy-MM-dd'T'HH:mm:ss.SSS";
    private static final String END_LINE = "\r\n";
    private final List<StepItemCompleteListener> stepItemCompleteListeners = new ArrayList<>();
    private final List<StepItemFailureListener> stepItemFailureListeners = new ArrayList<>();
    private final List<StepStatusListener> stepStatusListeners = new ArrayList<>();

    private final HubClient hubClient;
    private final HubProject hubProject;

    private Thread runningThread = null;
    // setting these values to protected so their values can be tested
    protected String inputFilePath = null;
    protected String outputCollections;
    protected String outputPermissions;
    protected String outputFormat;
    protected String inputFileType;
    protected String inputMimeType;
    protected String outputURIReplacement;
    protected String outputURIPrefix;
    protected String separator = ",";
    protected String boundary = "===dataHubIngestion===";
    protected AtomicBoolean isStopped = new AtomicBoolean(false);
    private IngestionStepDefinitionImpl stepDef;
    private Map<String, Object> stepConfig = new HashMap<>();

    private final FileNameMap fileNameMap = URLConnection.getFileNameMap();

    public WriteStepRunner(HubClient hubClient, HubProject hubProject) {
        this.hubClient = hubClient;
        this.hubProject = hubProject;
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
                this.isStopped.set(true);
                runningThread.interrupt();
                throw new TimeoutException("Timeout occurred after "+timeout+" "+ unit);
            }
        }
    }

    @Override
    public int getBatchSize(){
        return this.batchSize;
    }

    private boolean jobOutputIsEnabled() {
        if (combinedOptions != null && combinedOptions.containsKey("disableJobOutput")) {
            return !Boolean.parseBoolean(combinedOptions.get("disableJobOutput").toString());
        }
        return true;
    }

    @Override
    public RunStepResponse run() {
        if (combinedOptions == null) {
            combinedOptions = new HashMap<>();
        }

        runningThread = null;
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        loadStepRunnerParameters();
        if("csv".equalsIgnoreCase(inputFileType)){
            combinedOptions.put("inputFileType", "csv");
        }
        combinedOptions.put("flow", this.flow.getName());

        if (jobOutputIsEnabled()) {
            JobService.on(hubClient.getJobsClient()).startStep(jobId, step, flow.getName(), new ObjectMapper().valueToTree(this.combinedOptions));
        }

        Collection<String> uris;
        try {
            uris = runFileCollector();
        } catch (Exception e) {
            runStepResponse.setCounts(0,0, 0, 0, 0)
                .withStatus(JobStatus.FAILED_PREFIX + step);
            StringWriter errors = new StringWriter();
            e.printStackTrace(new PrintWriter(errors));
            runStepResponse.withStepOutput(errors.toString());
            if (jobOutputIsEnabled()) {
                JsonNode jobDoc = JobService.on(hubClient.getJobsClient()).finishStep(jobId, step, JobStatus.FAILED_PREFIX + step, runStepResponse.toObjectNode());

                //If not able to read the step resp from the job doc, send the in-memory resp without start/end time
                try {
                    return StepRunnerUtil.getResponse(jobDoc, step);
                }
                catch (Exception ignored) {}
            }
            return runStepResponse;
        }
        return this.runIngester(runStepResponse,uris);
    }

    @Override
    public RunStepResponse run(Collection<String> uris) {
        runningThread = null;
        RunStepResponse runStepResponse = StepRunnerUtil.createStepResponse(flow, step, jobId);
        if (jobOutputIsEnabled()) {
            JobService.on(hubClient.getJobsClient()).startStep(jobId, step, flow.getName(), new ObjectMapper().valueToTree(this.combinedOptions));
        }
        return this.runIngester(runStepResponse,uris);
    }

    @Override
    public void stop() {
        isStopped.set(true);
    }

    @SuppressWarnings("unchecked")
    protected void loadStepRunnerParameters(){
        JsonNode comboOptions;
        try {
            comboOptions = JSONObject.readInput(JSONObject.writeValueAsString(combinedOptions));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        JSONObject obj = new JSONObject(comboOptions);


        if (obj.getArrayString("collections", false) != null) {
            outputCollections = StringUtils.join(obj.getArrayString("collections", false), ",");
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
        Map<String, Object> stepDefFileLocation;
        Map<String, Object> stepFileLocation;
        Map<String, Object> fileLocations = new HashMap<>();
        if(stepDef.getFileLocations() != null) {
            stepDefFileLocation = mapper.convertValue(stepDef.getFileLocations(), Map.class);
            fileLocations.putAll(stepDefFileLocation);
        }
        if(flow.getStep(step).getFileLocations() != null) {
            stepFileLocation =  mapper.convertValue(flow.getStep(step).getFileLocations(), Map.class);
            fileLocations.putAll(stepFileLocation);
        }
        if(stepConfig.get("batchSize") != null){
            this.batchSize = Integer.parseInt(stepConfig.get("batchSize").toString());
        }
        if(stepConfig.get("threadCount") != null) {
            this.threadCount = Integer.parseInt(stepConfig.get("threadCount").toString());
        }
        if(stepConfig.get("fileLocations") != null) {
            fileLocations.putAll((Map<String, String>) stepConfig.get("fileLocations"));
        }
        if (!fileLocations.isEmpty()) {
            inputFilePath = (String)fileLocations.get("inputFilePath");
            inputFileType = (String)fileLocations.get("inputFileType");
            outputURIReplacement = (String)fileLocations.get("outputURIReplacement");
            outputURIPrefix = (String)fileLocations.get("outputURIPrefix");
            if (inputFileType.equalsIgnoreCase("csv") && fileLocations.get("separator") != null) {
                this.separator =((String) fileLocations.get("separator"));
                if (!"\t".equals(this.separator)) {
                    this.separator = this.separator.trim();
                }
            }
        }

        if (separator != null && separator.equalsIgnoreCase("\\t")) {
            this.separator = "\t";
        }

        if(stepConfig.get("stopOnFailure") != null){
            this.withStopOnFailure(Boolean.parseBoolean(stepConfig.get("stopOnFailure").toString()));
        }

        if(StringUtils.isNotEmpty(outputURIReplacement)){
            if(outputURIPrefix != null){
                throw new RuntimeException("'outputURIPrefix' and 'outputURIReplacement' cannot be set simultaneously");
            }
        }
        else{
            //set 'outputURIPrefix' to "" if it's not set and 'outputURIReplacement' is also not set
            if(outputURIPrefix == null){
                outputURIPrefix = "";
            }
        }

        if (inputFilePath == null || inputFileType == null) {
            throw new RuntimeException("File path and type cannot be empty");
        }
    }

    protected Path determineInputFilePath(String inputFilePath) {
        Path dirPath = Paths.get(inputFilePath);
        if (dirPath.isAbsolute()) {
            return dirPath;
        }

        if (this.hubProject != null) {
            String projectDirString = hubProject.getProjectDirString();
            return new File(projectDirString, dirPath.toString()).toPath().toAbsolutePath();
        }

        Path inputPath = new File(dirPath.toString()).toPath().toAbsolutePath();
        logger.info("No HubProject available to resolve relative inputFilePath; will ingest from: " + inputPath);
        return inputPath;
    }

    private Collection<String> runFileCollector() {
        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(this.jobId, 0, JobStatus.RUNNING_PREFIX + step, 0, 0,  "fetching files");
        });
        final DiskQueue<String> uris;
        if(!isStopped.get()) {
            uris = new FileCollector(inputFileType).run(determineInputFilePath(this.inputFilePath));
        }
        else {
            uris = null;
        }
        return uris;
    }

    private RunStepResponse runIngester(RunStepResponse runStepResponse, Collection<String> uris) {
        stepStatusListeners.forEach((StepStatusListener listener) -> {
            listener.onStatusChange(runStepResponse.getJobId(), 0, JobStatus.RUNNING_PREFIX + step, 0, 0, "starting step execution");
        });

        if (uris == null || uris.isEmpty()) {
            JsonNode jobDoc;
            final String stepStatus;
            if(isStopped.get()) {
                stepStatus = JobStatus.CANCELED_PREFIX + step;
            }
            else {
                stepStatus = JobStatus.COMPLETED_PREFIX + step;
            }

            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, stepStatus, 0, 0,
                    (stepStatus.contains(JobStatus.COMPLETED_PREFIX) ? "provided file path returned 0 items" : "job was stopped"));
            });
            runStepResponse.setCounts(0,0,0,0,0);
            runStepResponse.withStatus(stepStatus);

            if (jobOutputIsEnabled()) {
                jobDoc = JobService.on(hubClient.getJobsClient()).finishStep(jobId, step, stepStatus, runStepResponse.toObjectNode());
                try {
                    return StepRunnerUtil.getResponse(jobDoc, step);
                }
                catch (Exception ex) {
                    return runStepResponse;
                }
            } else {
                return runStepResponse;
            }
        }
        int inputCount = uris.size();
        StepMetrics stepMetrics = new StepMetrics(inputCount, (int) Math.ceil(inputCount/(double)batchSize));
        // Optimize for Hub databases associated with Hub app servers, but allow other values
        DatabaseClient client = destinationDatabase.equals(hubClient.getDbName(DatabaseKind.FINAL)) ?
            hubClient.getFinalClient() :
            hubClient.getStagingClient();

        String apiPath = "ml-modules/root/data-hub/data-services/stepRunner/processIngestBatch.api";
        ObjectNode endpointConstants = new ObjectMapper().createObjectNode();
        endpointConstants.put("jobId", jobId);
        endpointConstants.put("stepNumber", step);
        endpointConstants.put("flowName", flow.getName());
        JsonNode optionsNode = jsonToNode(combinedOptions);
        endpointConstants.set("options", optionsNode);
        ErrorListener errorListener = new ErrorListener(this, stepMetrics, stopOnFailure, optionsNode.path("retryLimit").asInt(0));
        switch (inputFileType.toLowerCase()) {
            case "xml":
                inputMimeType = "application/xml";
                break;
            case "json":
            case "csv":
                inputMimeType = "application/json";
                break;
            case "text":
                inputMimeType = "text/plain";
                break;
            default:
                inputMimeType = "application/octet-stream";
        }
        runningThread = new Thread(() -> {
            InputCaller.BulkInputCaller<InputStreamHandle> bulkCaller = BulkUtil.runInputCaller(client, apiPath, endpointConstants, runStepResponse.toObjectNode(), threadCount, batchSize, errorListener);
            AtomicLong count = new AtomicLong(0);
            Stream<InputStreamHandle> inputHandles = uris.stream().map(uri -> toInputStreamHandleList(new File(uri))).flatMap(List::stream);
            Collection<List<InputStreamHandle>> resultingBatches = inputHandles
                    .collect(Collectors.groupingByConcurrent(inputStreamHandle -> count.getAndIncrement() / batchSize))
                    .values();
            InputStreamHandle[] handleArray = new InputStreamHandle[0];
            for (List<InputStreamHandle> batch: resultingBatches) {
                bulkCaller.acceptAll(batch.toArray(handleArray));
                stepMetrics.getSuccessfulBatches().incrementAndGet();
                stepMetrics.getSuccessfulEvents().addAndGet(batch.size());
                runStatusListener(stepMetrics);
            }
            bulkCaller.awaitCompletion();
            String stepStatus;
            stepMetrics.getSuccessfulBatches().set((long)Math.ceil(inputCount/(double) batchSize) - stepMetrics.getFailedBatchesCount());
            stepMetrics.getSuccessfulEvents().set(inputCount - Math.min(stepMetrics.getFailedEventsCount(), inputCount));
            if (stepMetrics.getFailedEventsCount() > 0 && stopOnFailure) {
                stepStatus = JobStatus.STOP_ON_ERROR_PREFIX + step;
            } else if (isStopped.get()){
                stepStatus = JobStatus.CANCELED_PREFIX + step;
            } else if (stepMetrics.getFailedEventsCount() > 0 && stepMetrics.getSuccessfulEventsCount() > 0) {
                stepStatus = JobStatus.COMPLETED_WITH_ERRORS_PREFIX + step;
            } else if (stepMetrics.getFailedEventsCount() == 0 && stepMetrics.getSuccessfulEventsCount() > 0)  {
                stepStatus = JobStatus.COMPLETED_PREFIX + step ;
            } else {
                stepStatus = JobStatus.FAILED_PREFIX + step;
            }
            stepStatusListeners.forEach((StepStatusListener listener) -> {
                listener.onStatusChange(runStepResponse.getJobId(), 100, stepStatus, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), "Ingestion completed");
            });

            runStepResponse.setCounts(stepMetrics.getSuccessfulEventsCount() + stepMetrics.getFailedEventsCount(),stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), stepMetrics.getSuccessfulBatchesCount(), stepMetrics.getFailedBatchesCount());
            runStepResponse.withStatus(stepStatus);
            if (!errorListener.getThrowables().isEmpty()) {
                runStepResponse.withStepOutput(
                        errorListener
                                .getThrowables().stream()
                                .filter(Objects::nonNull)
                                .map(Throwable::toString)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList())
                );
                errorListener.getThrowables().clear();
            }

            if (jobOutputIsEnabled()) {
                JsonNode jobDoc = null;
                try {
                    jobDoc = JobService.on(hubClient.getJobsClient()).finishStep(jobId, step, stepStatus, runStepResponse.toObjectNode());
                } catch (Exception e) {
                    logger.error("Unable to update job document, cause: " + e.getMessage());
                }
                if (jobDoc != null) {
                    try {
                        RunStepResponse tempResp = StepRunnerUtil.getResponse(jobDoc, step);
                        runStepResponse.setStepStartTime(tempResp.getStepStartTime());
                        runStepResponse.setStepEndTime(tempResp.getStepEndTime());
                    } catch (Exception ex) {
                        logger.error("Unable to update step response, cause: " + ex.getMessage());
                    }
                }
            }
        });
        runningThread.start();
        return runStepResponse;
    }

    private InputStreamHandle processCsv(JacksonHandle jacksonHandle, File file) {
        ObjectMapper mapper = jacksonHandle.getMapper();
        JsonNode originalContent = jacksonHandle.get();
        ObjectNode node = mapper.createObjectNode();

        // Per DHFPROD-6665, this custom file ingester now does the same thing MLCP does when constructing XML from
        // a delimited file, which is to include a no-namespaced "root" element around the elements that were built
        // from a particular row
        if (this.outputFormat != null && this.outputFormat.equalsIgnoreCase("xml")) {
            node.putObject("content").set("root", originalContent);
        } else {
            node.set("content",originalContent);
        }

        node.put("file", file.getAbsolutePath());
        InputStreamHandle inputStreamHandle = null;
        try {
          inputStreamHandle = toInputStreamHandleWithInputStream(generateUriForCsv(file.getParent(), SystemUtils.OS_NAME.toLowerCase()), new ByteArrayInputStream(node.toPrettyString().getBytes(StandardCharsets.UTF_8)));
        }
        catch (IllegalStateException e) {
            logger.error("WriteBatcher has been stopped");
        }
        if (!file.getAbsolutePath().equalsIgnoreCase(currentCsvFile)) {
            currentCsvFile = file.getAbsolutePath();
            ++csvFilesProcessed;
        }
        return inputStreamHandle;
    }

    protected String generateUriForCsv(String parentPath, String os){
        String uri;
        if(outputURIPrefix != null){
            try {
                uri = percentPattern.matcher(generateAndEncodeURI(outputURIPrefix)).replaceAll("%%");
            } catch (URISyntaxException e) {
                throw new RuntimeException(e);
            }
        }
        else {
            uri = parentPath;
            if(os.contains("windows")){
                uri = "/" + FilenameUtils.separatorsToUnix(StringUtils.replaceOnce(uri, ":", ""));
            }
            try {
                uri = percentPattern.matcher(generateAndEncodeURI(outputURIReplace(uri))).replaceAll("%%");
            } catch (URISyntaxException e) {
                throw new RuntimeException(e);
            }
            uri = uri + "/";
        }
        return String.format(uri +"%s." + ("xml".equalsIgnoreCase(outputFormat) ? "xml":"json"), UUID.randomUUID());
    }

    private String fileUri(File file) throws URISyntaxException {
        String uri;
        if (outputURIPrefix != null){
            uri = getPrefixedEncodedURI(file.getName());
        }
        else {
            uri = file.getAbsolutePath();
            //In case of Windows, C:\\Documents\\abc.json will be converted to /c/Documents/abc.json
            if (SystemUtils.OS_NAME.toLowerCase().contains("windows")) {
                uri = "/" + FilenameUtils.separatorsToUnix(StringUtils.replaceOnce(uri, ":", ""));
            }
            uri = generateAndEncodeURI(outputURIReplace(uri));
        }
        return uri;
    }

    private List<InputStreamHandle> toInputStreamHandleList(File file) {
        List<InputStreamHandle> inputStreamHandleList = new ArrayList<>();
        try (FileInputStream docStream = new FileInputStream(file)) {
            //note these ORs are for forward compatibility if we swap out the filecollector for another lib
            if (inputFileType.equalsIgnoreCase("csv") || inputFileType.equalsIgnoreCase("tsv") || inputFileType.equalsIgnoreCase("psv")) {
                CsvSchema schema = CsvSchema.emptySchema()
                        .withHeader()
                        .withColumnSeparator(separator.charAt(0));
                JacksonCSVSplitter splitter = new JacksonCSVSplitter().withCsvSchema(schema);
                try {
                    if (!this.isStopped.get()) {
                        Stream<JacksonHandle> contentStream = splitter.split(docStream);
                        contentStream.forEach(jacksonHandle -> inputStreamHandleList.add(this.processCsv(jacksonHandle, file)));
                    }
                } catch (Exception e) {
                    throw new RuntimeException(e);
                }
            } else {
                String mimeType = fileNameMap.getContentTypeFor(file.getName());
                inputStreamHandleList.add(toInputStreamHandleWithInputStream(fileUri(file), docStream));
            }
        } catch (URISyntaxException | IOException e) {
            throw new RuntimeException(e);
        }
        return inputStreamHandleList;
    }

    protected InputStreamHandle toInputStreamHandleWithInputStream(String uri, InputStream inputStream) {
        Charset charset = StandardCharsets.UTF_8;
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(new OutputStreamWriter(outputStream, charset), true);
        writer.append("--").append(boundary).append(END_LINE);
        writer.append("Content-Disposition: form-data; name=\"uri\"")
                .append(END_LINE);
        writer.append("Content-Type: text/plain; charset=").append(String.valueOf(charset)).append(
                END_LINE);
        writer.append(END_LINE);
        writer.append(uri).append(END_LINE);
        writer.append("--").append(boundary).append(END_LINE);
        writer.append("Content-Disposition: form-data; name=\"fileName\"; filename=\"").append(uri).append("\"")
                .append(END_LINE);
        writer.append("Content-Type: ").append(inputMimeType)
                .append(END_LINE);
        writer.append("Content-Transfer-Encoding: binary").append(END_LINE);
        writer.append(END_LINE);
        writer.flush();

        try {
            StreamUtils.copy(inputStream, outputStream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        writer.append(END_LINE);
        writer.flush();
        writer.append(END_LINE).flush();
        writer.append("--").append(boundary).append("--").append(END_LINE);
        writer.close();
        return new InputStreamHandle(new ByteArrayInputStream(outputStream.toByteArray())).withFormat(Format.BINARY);
    }

    protected String getPrefixedEncodedURI(String filename) throws  URISyntaxException{
        return generateAndEncodeURI(outputURIPrefix + filename);
    }

    private static String generateAndEncodeURI(String path) throws  URISyntaxException {
        URI uri = new URI(null, null, null, 0, path, null, null);
        return uri.toString();
    }

    private String outputURIReplace(String uri) {
        if (StringUtils.isNotEmpty(outputURIReplacement)) {
            String[] replace = outputURIReplacement.split(",");
            // URI replace comes in pattern and replacement pairs.
            if (replace.length % 2 != 0) {
                throw new IllegalArgumentException(
                    "Invalid argument for URI replacement: " + outputURIReplacement);
            }
            int replaceLength = replace.length;
            // Replacement string is expected to be in ''
            for (int i = 0; i < replaceLength - 1; i++) {
                String replacement = replace[++i].trim();
                if (!replacement.startsWith("'") ||
                    !replacement.endsWith("'")) {
                    throw new IllegalArgumentException(
                        "Invalid argument for URI replacement: " + outputURIReplacement);
                }
            }
            for (int i = 0; i < replaceLength - 1; i += 2) {
                String replacement = replace[i + 1].trim();
                replacement = replacement.substring(1, replacement.length() - 1);
                uri = uri.replaceAll(replace[i], replacement);
            }
        }
        return uri;
    }

    //percentComplete for csv files is (csvFilesProcessed/ urisCount) * 100.0
    //The number of csv files would probably be less than that of regular files, so the step status listeners are updated more frequently
    //'uris' is backed by DiskQueue whose size changes as the Collection is iterated, so size is calculated before iteration
    protected void runStatusListener(StepMetrics stepMetrics) {
        double uriSize = (double) stepMetrics.getTotalEventsCount();
        double batchCount = (double) stepMetrics.getTotalBatchesCount();
        long totalRunBatches = stepMetrics.getSuccessfulBatchesCount() + stepMetrics.getFailedBatchesCount();
        int percentComplete;
        if("csv".equalsIgnoreCase(inputFileType)) {
            percentComplete = (int) (((double) csvFilesProcessed/ uriSize) * 100.0);
            if (percentComplete != previousPercentComplete && (percentComplete % 2 == 0)) {
                previousPercentComplete = percentComplete;
                stepStatusListeners.forEach((StepStatusListener listener) -> {
                    listener.onStatusChange(jobId, percentComplete, JobStatus.RUNNING_PREFIX + step, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), "Ingesting");
                });
            }
        }
        else {
            percentComplete = (int) (((double) totalRunBatches/ batchCount) * 100.0);
            if (percentComplete != previousPercentComplete && (percentComplete % 5 == 0)) {
                previousPercentComplete = percentComplete;
                stepStatusListeners.forEach((StepStatusListener listener) -> {
                    listener.onStatusChange(jobId, percentComplete, JobStatus.RUNNING_PREFIX + step, stepMetrics.getSuccessfulEventsCount(), stepMetrics.getFailedEventsCount(), "Ingesting");
                });
            }
        }
    }

    private static JsonNode jsonToNode(Map<String, Object> map) {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.convertValue(map, JsonNode.class);
    }

    static class ErrorListener implements InputCaller.BulkInputCaller.ErrorListener {
        WriteStepRunner writeStepRunner;
        StepMetrics stepMetrics;
        final static List<Throwable> throwables = new ArrayList<>();
        StepStatusListener[] stepStatusListeners = null;
        int retryLimit;
        boolean stopOnFailure;

        public ErrorListener(WriteStepRunner writeStepRunner, StepMetrics stepMetrics, boolean stopOnFailure, int retryLimit) {
            this.writeStepRunner = writeStepRunner;
            this.stepMetrics = stepMetrics;
            this.stopOnFailure = stopOnFailure;
            this.retryLimit = retryLimit;
        }

        public List<Throwable> getThrowables() {
            return throwables;
        }

        public ErrorListener withStepListeners(StepStatusListener ...stepStatusListeners) {
            this.stepStatusListeners = stepStatusListeners;
            return this;
        }

        @Override
        public IOEndpoint.BulkIOEndpointCaller.ErrorDisposition processError(int retryCount, Throwable throwable, IOEndpoint.CallContext callContext, BufferableHandle[] input) {
            if (retryCount < retryLimit) {
                return IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.RETRY;
            }
            stepMetrics.getFailedBatches().incrementAndGet();
            stepMetrics.getSuccessfulBatches().decrementAndGet();
            long failedEvents = input.length;
            stepMetrics.getSuccessfulEvents().set(stepMetrics.getSuccessfulEventsCount() - failedEvents);
            stepMetrics.getFailedEvents().addAndGet(failedEvents);
            writeStepRunner.runStatusListener(stepMetrics);
            if (throwable != null){
                throwables.add(throwable);
            }
            return stopOnFailure ? IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.STOP_ALL_CALLS: IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.SKIP_CALL;
        }
    }
}
