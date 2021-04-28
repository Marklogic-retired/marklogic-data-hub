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

package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.DeleteQueryDefinition;
import com.marklogic.client.query.QueryManager;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * FlowRunnerImpl is not a thread-safe class due to all of the state that it stores. So these tests must be run in
 * the same thread.
 */
@Execution(ExecutionMode.SAME_THREAD)
public class FlowRunnerTest extends AbstractHubCoreTest {

    @Autowired
    FlowRunnerImpl flowRunner;

    @BeforeEach
    public void setupEach() {
        installProjectInFolder("flow-runner-test");
    }

    @Test
    public void testRunFlow() {
        runAsDataHubOperator();
        RunFlowResponse resp = runFlow("testFlow", null, null, null, null);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals("testFlow", resp.getFlowName());
        verifyCollectionCountsFromRunningTestFlow();

        XMLDocumentManager docMgr = getHubClient().getStagingClient().newXMLDocumentManager();
        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        docMgr.readMetadata("/ingest-xml.xml", metadataHandle);
        DocumentMetadataHandle.DocumentPermissions permissions = metadataHandle.getPermissions();

        assertEquals(2, permissions.get("data-hub-operator").size());
        assertTrue(permissions.get("data-hub-operator").contains(DocumentMetadataHandle.Capability.READ));
        assertTrue(permissions.get("data-hub-operator").contains(DocumentMetadataHandle.Capability.UPDATE));

        RunStepResponse stepResp = resp.getStepResponses().get("1");
        assertNotNull(stepResp.getStepStartTime());
        assertNotNull(stepResp.getStepEndTime());

        EvalResultIterator itr = runInDatabase("fn:collection(\"csv-coll\")[1]/envelope/headers/createdUsingFile", HubConfig.DEFAULT_STAGING_NAME);
        EvalResult res = itr.next();
        StringHandle sh = new StringHandle();
        res.get(sh);
        String file = sh.get();
        assertNotNull(file);
        assertTrue(file.contains("ingest.csv"), "Unexpected filename: " + file);
    }

    @Test
    void invalidSourceQuery() {
        Map<String, Object> options = new HashMap<>();
        options.put("sourceQuery", "cts.collectionQuery('oops");
        RunFlowResponse resp = runFlow("testValuesFlow", "1", null, options, null);
        flowRunner.awaitCompletion();
        assertEquals(JobStatus.FAILED.toString(), resp.getJobStatus(), "The job should have failed due to the invalid sourceQuery: " + resp.toJson());
        String errorMessage = resp.getStepResponses().get("1").getStepOutput().get(0);
        assertTrue(errorMessage.contains("Unable to collect items to process; sourceQuery script: cts.collectionQuery('oops"),
            "The error message should include the invalid source query script for easier debugging; message: " + errorMessage);
    }

    @Test
    void customStepReferencesModulePathThatDoesntExist() {
        // Delete the module that the value-step step-definition points to
        runAsDataHubDeveloper();
        getHubClient().getModulesClient().newDocumentManager().delete("/custom-modules/custom/value-step/main.sjs");
        runAsDataHubOperator();

        // Create a couple documents to process so we can verify the counts for events
        writeFinalJsonDoc("/customer1.json", "{}", "example");
        writeFinalJsonDoc("/customer2.json", "{}", "example");

        Map<String, Object> options = new HashMap<>();
        options.put("collections", Arrays.asList("collector-test-output"));
        options.put("sourceQuery", "cts.uris(null, null, cts.collectionQuery('example'))");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("testValuesFlow", "1").withOptions(options));

        RunStepResponse stepResponse = flowResponse.getStepResponses().get("1");
        List<String> errors = stepResponse.getStepOutput();
        assertEquals(1, errors.size(), "Expecting an error due to the missing module");
        assertTrue(errors.get(0).contains("Unable to access module: /custom-modules/custom/value-step/main.sjs. " +
            "Verify that this module is in your modules database and that your user account has a role that grants read and execute permission to this module"),
            "Did not find expected message in error; error: " + errors.get(0));

        assertEquals(2, stepResponse.getTotalEvents(), "Expecting 2, as there are 2 URIs matching the collection query");
        assertEquals(0, stepResponse.getSuccessfulEvents(), "Expecting 0, since the step module doesn't exist");
        assertEquals(2, stepResponse.getFailedEvents(), "Expecting 2, since both URIs should have failed");
        assertEquals(0, stepResponse.getSuccessfulBatches());
        assertEquals(1, stepResponse.getFailedBatches());
        assertFalse(stepResponse.isSuccess());
    }

    /**
     * This test demonstrates multiple ways of expressing the sourceQuery as a script that returns values.
     */
    @Test
    public void sourceQueryReturnsScript() {
        // These indexes are removed by some other test, so need to ensure they're here for this test
        applyDatabasePropertiesForTests(getHubConfig());

        final String flowName = "testValuesFlow";

        // Write a couple test documents that have range indexed values on them
        writeFinalJsonDoc("/collector-test1.json", "{\"PersonGivenName\":\"Jane\", \"PersonSurName\":\"Smith\"}", "collector-test-input");
        writeFinalJsonDoc("/collector-test2.json", "{\"PersonGivenName\":\"John\", \"PersonSurName\":\"Smith\"}", "collector-test-input");

        Map<String, Object> options = new HashMap<>();
        options.put("collections", Arrays.asList("collector-test-output"));

        runAsDataHubOperator();

        // cts.values with multiple index references and references to the options object too
        options.put("firstQName", "PersonGivenName");
        options.put("secondQName", "PersonSurName");
        options.put("sourceQuery", "cts.values([cts.elementReference(options.firstQName), cts.elementReference(options.secondQName)], null, null, cts.collectionQuery('collector-test-input'))");
        RunFlowResponse resp = runFlow(flowName, "1", UUID.randomUUID().toString(), options, null);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals(3, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "collector-test-output"),
            "There are 3 unique values in the PersonGivenName and PersonSurName indexes, so 3 documents should have been created");
        deleteCollectorTestOutput();

        // cts.elementValueCoOccurrences
        options.put("sourceQuery", "cts.elementValueCoOccurrences(xs.QName('PersonGivenName'), xs.QName('PersonSurName'), null, cts.collectionQuery('collector-test-input'))");
        resp = runFlow(flowName, "2", UUID.randomUUID().toString(), options, null);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "collector-test-output"),
            "Both test documents should return a co-occurrence. Note that this array will be passed as a string to the " +
                "endpoint for running a flow. It can be converted into an array via xdmp.eval .");
        ObjectNode processedDoc = readJsonObject(getHubClient().getFinalClient().newServerEval().javascript("fn.collection('collector-test-output').toArray()[0]").evalAs(String.class));
        JsonNode contentValue = processedDoc.get("envelope").get("instance").get("contentValue");
        assertEquals(2, contentValue.size(), "The string item should have been converted into an array");
        deleteCollectorTestOutput();

        // cts.valueTuples
        options.put("sourceQuery", "cts.valueTuples([cts.elementReference('PersonGivenName'), cts.elementReference('PersonSurName')], null, cts.collectionQuery('collector-test-input'))");
        //'sourceQueryLimit' should be ignored if 'sourceQueryIsScript' is set to true.
        options.put("sourceQueryLimit", 1);
        resp = runFlow(flowName, "1", UUID.randomUUID().toString(), options, null);
        flowRunner.awaitCompletion();
        verifyJobFinished(resp);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "collector-test-output"),
            "Each of the 2 test documents should return a tuple with 2 items in it");
    }

    private void deleteCollectorTestOutput() {
        final QueryManager queryManager = getHubClient().getFinalClient().newQueryManager();
        final DeleteQueryDefinition deleteQueryDefinition = queryManager.newDeleteDefinition();
        deleteQueryDefinition.setCollections("collector-test-output");
        queryManager.delete(deleteQueryDefinition);
    }

    @Test
    public void testIngestCSVasXML() {
        Map<String,Object> opts = new HashMap<>();
        opts.put("outputFormat","xml");

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,String> stepDetails = new HashMap<>();

        stepDetails.put("outputURIPrefix" ,"/prefix-output/");
        stepConfig.put("fileLocations", stepDetails);
        stepDetails.put("outputURIReplacement" ,null);

        runAsDataHubOperator();
        RunFlowResponse resp = runFlow("testFlow", "3", UUID.randomUUID().toString(),opts, stepConfig);
        flowRunner.awaitCompletion();

        runAsDataHubDeveloper();
        verifyJobFinished(resp);
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll"));

        String count = getHubClient().getStagingClient().newServerEval().xquery("fn:count(cts:uri-match('/prefix-output/*.xml'))").evalAs(String.class);
        assertEquals(25, Integer.parseInt(count));
        count = getHubClient().getJobsClient().newServerEval().xquery("xdmp:estimate(fn:collection('http://marklogic.com/provenance-services/record'))").evalAs(String.class);
        assertEquals(25, Integer.parseInt(count));
     }

    @SuppressWarnings("deprecation")
    protected RunFlowResponse runFlow(String flowName, String commaDelimitedSteps, String jobId, Map<String, Object> options, Map<String, Object> stepConfig) {
        List<String> steps = commaDelimitedSteps != null ? Arrays.asList(commaDelimitedSteps.split(",")) : null;
        // This is intentionally being used to ensure that the deprecated approach still works
        return flowRunner.runFlow(flowName, steps, jobId, options, stepConfig);
    }

    @Test
    public void testIngestCSVasXMLCustomDelimiter(){
        Map<String,Object> opts = new HashMap<>();
        opts.put("outputFormat","xml");

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,String> stepDetails = new HashMap<>();

        stepDetails.put("outputURIReplacement" ,".*/input,'/output'");
        stepDetails.put("separator" ,"\t");
        stepConfig.put("fileLocations", stepDetails);

        runAsDataHubOperator();
        RunFlowResponse resp = runFlow("testFlow", "4", UUID.randomUUID().toString(),opts, stepConfig);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-tab-coll"));

        EvalResultIterator resultItr = runInDatabase("fn:count(cts:uri-match(\"/output/*.xml\"))", HubConfig.DEFAULT_STAGING_NAME);
        EvalResult res = resultItr.next();
        long count = Math.toIntExact((long) res.getNumber());
        assertEquals(25, count);
    }

    @Test
    public void testSourceQueryLimit(){
        Map<String,Object> opts = new HashMap<>();

        runAsDataHubOperator();
        RunFlowResponse resp = runFlow("testFlow", "4", UUID.randomUUID().toString(),opts, new HashMap<>());
        flowRunner.awaitCompletion();
        verifyJobFinished(resp);
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-tab-coll"));

        opts.put("sourceQuery", "cts.collectionQuery('csv-tab-coll')");
        opts.put("sourceQueryLimit", 2);
        resp = runFlow("testFlow", "6", UUID.randomUUID().toString(), opts, new HashMap<>());
        flowRunner.awaitCompletion();
        verifyJobFinished(resp);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map"));

        opts.put("sourceQueryLimit", -2);
        resp = runFlow("testFlow", "6", UUID.randomUUID().toString(), opts, new HashMap<>());
        flowRunner.awaitCompletion();
        assertEquals("failed", resp.getJobStatus(), "Unexpected job status: " + resp.toJson());

        opts.put("sourceQueryLimit", "invalidValue");
        resp = runFlow("testFlow", "6", UUID.randomUUID().toString(), opts, new HashMap<>());
        flowRunner.awaitCompletion();
        assertEquals("failed", resp.getJobStatus(), "Unexpected job status: " + resp.toJson());
    }

    @Test
    public void testIngestTextAsJson(){
        Map<String,Object> opts = new HashMap<>();
        opts.put("outputFormat","json");
        List<String> coll = new ArrayList<>();
        coll.add("text-collection");
        opts.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);
        opts.put("collections", coll);

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","text");
        stepDetails.put("outputURIReplacement" ,".*/input,'/output'");
        stepConfig.put("fileLocations", stepDetails);

        runAsDataHubOperator();
        RunFlowResponse resp = runFlow("testFlow", "2", UUID.randomUUID().toString(),opts, stepConfig);
        flowRunner.awaitCompletion();
        verifyJobFinished(resp);
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "text-collection"));
    }

    @Test
    public void testEmptyCollector(){
        runAsDataHubOperator();

        Map<String,Object> opts = new HashMap<>();
        opts.put("sourceQuery", "cts.collectionQuery('non-existent-collection')");
        RunFlowResponse resp = runFlow("testFlow", "1,6", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll"));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map"));
    }

    @Test
    public void testInvalidQueryCollector(){
        runAsDataHubOperator();

        // Build options with an invalid source query
        Map<String,Object> opts = new HashMap<>();
        opts.put("sourceQuery", "cts.collectionQuer('xml-coll')");

        RunFlowResponse resp = runFlow("testFlow", "1,6", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        assertEquals(JobStatus.FINISHED_WITH_ERRORS.toString(), resp.getJobStatus(), "Since one step completed and " +
            "the other failed, the status should be finished with errors: " + resp.toJson());
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll"));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map"));

        RunStepResponse stepResponse = resp.getStepResponses().get("6");
        assertEquals("failed step 6", stepResponse.getStatus());
        assertEquals(1, stepResponse.getStepOutput().size(), "Expecting an error message due to the invalid sourceQuery");
        assertTrue(stepResponse.getStepOutput().get(0).contains("cts.collectionQuer is not a function"));

        resp = runFlow("testFlow", "6", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        assertEquals(JobStatus.FAILED.toString(), resp.getJobStatus(), "Since all steps failed (there was just one step), " +
            "the status should be failed: " + resp.toJson());
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map"));
        stepResponse = resp.getStepResponses().get("6");
        assertEquals("failed step 6", stepResponse.getStatus());
    }

    @Test
    public void testRunFlowOptions(){
        runAsDataHubOperator();

        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        String mappingJobId = UUID.randomUUID().toString();

        coll.add("test-collection");
        opts.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("collections", coll);
        opts.put("sourceQuery", "cts.collectionQuery('test-collection')");

        RunFlowResponse resp = runFlow("testFlow", "1,2", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        verifyJobFinished(resp);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection"));
        assertEquals("2", resp.getLastAttemptedStep());
        assertEquals("2", resp.getLastCompletedStep());
        JsonNode job = getJobDoc(resp.getJobId());
        assertEquals("2", job.get("job").get("lastAttemptedStep").asText());
        assertEquals("2", job.get("job").get("lastCompletedStep").asText());

        opts.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);
        opts.put("sourceDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("testRunFlowOption", "xyzzy");
        resp = runFlow("testFlow", "5", mappingJobId, opts, null);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        JsonNode batchDoc = findFirstBatchDocument(mappingJobId);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection"));
        assertEquals("cts.collectionQuery('test-collection')", batchDoc.get("batch").get("step").get("options").get("sourceQuery").asText());
        assertEquals("xyzzy", batchDoc.get("batch").get("step").get("options").get("testRunFlowOption").asText());
    }

    @Test
    public void testRunFlowStepConfig(){
        runAsDataHubOperator();

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        coll.add("test-collection");
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","json");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("collections", coll);

        RunFlowResponse resp = runFlow("testFlow", "1,2", UUID.randomUUID().toString(), opts, stepConfig);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_JOB_NAME, "Job"));
    }

    @Test
    public void testDisableJobOutput(){
        runAsDataHubOperator();

        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        coll.add("test-collection");
        opts.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("collections", coll);
        opts.put("sourceQuery", "cts.collectionQuery('test-collection')");
        opts.put("disableJobOutput", Boolean.TRUE);

        RunFlowResponse resp = runFlow("testFlow", "1,2", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection"));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_JOB_NAME, "Jobs"));
    }

    @Test
    public void testRunFlowStopOnError(){
        verifyFlowStopsOnError(new HashMap<>());
    }

    @Test
    void testStopOnErrorViaOptions() {
        // Verify that stopOnError in options works by first modifying the flow so it doesn't have stopOnError=true
        FlowManager mgr = new FlowManagerImpl(getHubConfig());
        Flow flow = mgr.getFlow("testFlow");
        flow.setStopOnError(false);
        mgr.saveFlow(flow);

        Map<String, Object> options = new HashMap<>();
        options.put("stopOnError", true);
        verifyFlowStopsOnError(options);
    }

    /**
     * Note that this tests an error where the step is unable to run, and the error is then thrown by ML to the
     * Java code. This does not account for an error that the ML code catches, such as when a step fails to process
     * an item but still completes.
     *
     * @param options
     */
    private void verifyFlowStopsOnError(Map<String, Object> options) {
        runAsDataHubOperator();

        options.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);
        options.put("sourceDatabase", HubConfig.DEFAULT_STAGING_NAME);
        Map<String,String> mapping = new HashMap<>();
        mapping.put("name", "non-existent-mapping");
        mapping.put("version", "1");
        options.put("mapping", mapping);

        RunFlowResponse resp = runFlow("testFlow", "1,6", UUID.randomUUID().toString(), options, null);
        flowRunner.awaitCompletion();
        assertEquals(JobStatus.STOP_ON_ERROR.toString(), resp.getJobStatus(), "Unexpected job status: " + resp.toJson());
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll"));
    }

    /**
     * In this test, the step throws an error for an item, but it still completes. FlowRunner should still detect
     * this as an error and thus stop the flow.
     */
    @Test
    void stopOnErrorWhenStepFailsItem() {
        installReferenceModelProject().createRawCustomer(1, "Jane");

        RunFlowResponse response = runFlow(new FlowInputs("customHookFlow", "1", "2")
            .withOption("stopOnError", true)
            .withOption("throwErrorOnPurpose", true)
        );

        assertEquals("stop-on-error", response.getJobStatus());
        assertEquals("1", response.getLastAttemptedStep());
        assertEquals("0", response.getLastCompletedStep());

        RunStepResponse stepResponse = response.getStepResponses().get("1");
        assertEquals(1, stepResponse.getTotalEvents());
        assertEquals(0, stepResponse.getSuccessfulEvents());
        assertEquals(1, stepResponse.getFailedEvents());
        assertEquals("canceled step 1", stepResponse.getStatus(),
            "'stop on error' is only possible as a step status if the undocumented stopOnFailure option " +
                "is used. If only stopOnError (which is documented) is used, then 'canceled' is the step status.");

        assertEquals(1, response.getStepResponses().keySet().size(),
            "The second step should not have been run since stopOnError=true");
    }

    @Test
    public void testIngestBinaryAndTxt(){
        runAsDataHubOperator();

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        coll.add("binary-text-collection");
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","binary");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("outputFormat", "binary");
        opts.put("collections", coll);
        RunFlowResponse resp = runFlow("testFlow","1", UUID.randomUUID().toString(), opts, stepConfig);
        flowRunner.awaitCompletion();

        coll = new ArrayList<>();
        coll.add("text-collection");
        stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","text");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("outputFormat", "text");
        RunFlowResponse resp1 = runFlow("testFlow","1", UUID.randomUUID().toString(), opts, stepConfig);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        verifyJobFinished(resp1);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "binary-text-collection"));
    }

    @Test
    public void testUnsupportedFileType(){
        runAsDataHubOperator();

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        coll.add("binary-text-collection");
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","unsupported");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("outputFormat", "Binary");
        opts.put("collections", coll);
        RunFlowResponse resp = runFlow("testFlow","1", UUID.randomUUID().toString(), opts, stepConfig);
        flowRunner.awaitCompletion();

        verifyJobFinished(resp);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "binary-text-collection"));
    }

    @Test
    public void testStopJob() {
        runAsDataHubOperator();

        final String jobId = "testStopJob";
        final long enoughTimeForTheJobToStartButNotYetFinish = 300;

        Runnable jobStoppingThread = ()->{
            sleep(enoughTimeForTheJobToStartButNotYetFinish);
            flowRunner.stopJob(jobId);
        };

        RunFlowResponse resp = runFlow("testFlow", null, jobId, null, null);
        jobStoppingThread.run();
        flowRunner.awaitCompletion();

        final String status = resp.getJobStatus() != null ? resp.getJobStatus().toLowerCase() : "";
        assertEquals(JobStatus.CANCELED.toString().toLowerCase(), status,
            "Expected the response status to be canceled, since the job was stopped before it finished, but was instead: " + status
         + ". If this failed in Jenkins, it likely can be ignored because we don't have a firm idea of how long the " +
                "thread that stops the job should wait until it stops the job; response: " + resp.toJson());
    }

    @Test
    public void testRunMultipleJobs() {
        runAsDataHubOperator();

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        coll.add("test-collection");
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","json");

        stepConfig.put("fileLocations", stepDetails);
        opts.put("collections", coll);

        Map<String,Object> stepConfig1 = new HashMap<>();
        Map<String,Object> opts1 = new HashMap<>();
        List<String> coll1 = new ArrayList<>();
        coll1.add("test-collection1");
        Map<String,String> stepDetails1 = new HashMap<>();
        stepDetails1.put("inputFileType","xml");

        stepConfig1.put("fileLocations", stepDetails1);
        opts1.put("collections", coll1);


        RunFlowResponse resp = runFlow("testFlow", "2", UUID.randomUUID().toString(), opts, stepConfig);
        RunFlowResponse resp1 = runFlow("testFlow", "2", UUID.randomUUID().toString(), opts1, stepConfig1);
        flowRunner.awaitCompletion();

        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection1"));
        verifyJobFinished(resp);
        verifyJobFinished(resp1);
    }

    private void verifyCollectionCountsFromRunningTestFlow() {
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll"));
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll"));
        assertEquals(25, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-tab-coll"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "json-coll"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "json-map"));
        assertEquals(1, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map"));
    }

    private void verifyJobFinished(RunFlowResponse response) {
        assertEquals("finished", response.getJobStatus(), "Expected status of finished: " + response.toJson());
    }
}
