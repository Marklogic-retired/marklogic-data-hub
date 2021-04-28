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

package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.document.XMLDocumentManager;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class FlowRunnerTest extends HubTestBase {

    @Autowired
    FlowRunnerImpl flowRunner;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().deleteProjectDir();
    }

    @AfterAll
    public static void cleanUp(){
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setupEach() {
        setupProjectForRunningTestFlow();
        runAsDataHubOperator();
    }

    @Test
    public void hookThrowsErrorAndStopOnErrorIsTrue() throws Exception {
        String customHook = "declareUpdate();\n" +
            "\n" +
            "var uris;\n" +
            "var content;\n" +
            "var options;\n" +
            "var flowName;\n" +
            "var stepNumber;\n" +
            "var step;\n" +
            "\n" +
            "if (stepNumber === '2') {\n" +
            "  throw Error('Throwing error on purpose');\n" +
            "}\n";

        DatabaseClient modulesClient = getDataHubAdminConfig().newModulesDbClient();
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.getPermissions().add("rest-extension-user", DocumentMetadataHandle.Capability.EXECUTE);
        metadata.getPermissions().add("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        modulesClient.newTextDocumentManager().write("/custom-modules/testCustomHook.sjs", metadata, new StringHandle(customHook).withFormat(Format.TEXT));

        RunFlowResponse response = runFlow("customHookFlow", "1,2,3", null, null, null);
        flowRunner.awaitCompletion();

        assertEquals("stop-on-error", response.getJobStatus());
        assertEquals("2", response.getLastAttemptedStep());
        assertEquals("1", response.getLastCompletedStep());
        assertEquals(2, response.getStepResponses().keySet().size(), "The third step should not have been run");

        RunStepResponse mapResponse = response.getStepResponses().get("2");
        assertEquals("canceled step 2", mapResponse.getStatus());
        assertTrue(mapResponse.getStepOutput().get(0).contains("Throwing error on purpose"));
        assertEquals(1, mapResponse.getTotalEvents());
        assertEquals(0, mapResponse.getSuccessfulEvents());
        assertEquals(1, mapResponse.getFailedEvents());
        assertEquals(0, mapResponse.getSuccessfulBatches());
        assertEquals(1, mapResponse.getFailedBatches());
        assertFalse(mapResponse.isSuccess());

        DatabaseClient jobClient = getDataHubAdminConfig().newJobDbClient();
        String batchDocCount = jobClient.newServerEval().javascript("cts.estimate(cts.collectionQuery('Batch'))").evalAs(String.class);
        assertEquals(1, Integer.parseInt(batchDocCount), "When a custom hook fails, a Batch document should still be created " +
            "so that the URIs in the batch can be found; this helps with re-processing the batch");
        JsonNode batchDoc = new ObjectMapper().readTree(jobClient.newServerEval().javascript("fn.head(fn.collection('Batch'))").evalAs(String.class));
        assertEquals("failed", batchDoc.get("batch").get("batchStatus").asText());
        assertEquals("/ingest-xml.xml", batchDoc.get("batch").get("uris").get(0).asText());
        assertTrue(batchDoc.get("batch").has("completeError"));
    }

    @Test
    public void testRunFlow(){
        RunFlowResponse resp = runFlow("testFlow", null, null, null, null);
        flowRunner.awaitCompletion();

        System.out.println("Logging response to help with debugging this failure on Jenkins: " + resp);
        verifyCollectionCountsFromRunningTestFlow();
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        XMLDocumentManager docMgr = stagingClient.newXMLDocumentManager();
        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        docMgr.readMetadata("/ingest-xml.xml", metadataHandle);
        DocumentMetadataHandle.DocumentPermissions perms = metadataHandle.getPermissions();
        Assertions.assertEquals(2, perms.get("data-hub-operator").size());
        RunStepResponse stepResp = resp.getStepResponses().get("1");
        Assertions.assertNotNull(stepResp.getStepStartTime());
        Assertions.assertNotNull(stepResp.getStepEndTime());
        EvalResultIterator itr = runInDatabase("fn:collection(\"csv-coll\")[1]/envelope/headers/createdUsingFile", HubConfig.DEFAULT_STAGING_NAME);
        EvalResult res = itr.next();
        StringHandle sh = new StringHandle();
        res.get(sh);
        String file = sh.get();
        Assertions.assertNotNull(file);
        Assertions.assertTrue(file.contains("ingest.csv"));
    }

    @Test
    public void testIngestCSVasXML() throws Exception {
        //prov docs cannot be read by "flow-developer-user", so creating a client using 'secUser' which is 'admin'
        DatabaseClient client = getClient(host,jobPort, HubConfig.DEFAULT_JOB_NAME, secUser, secPassword, jobAuthMethod);
        //don't have 'admin' certs, so excluding from cert-auth tests
        if(! isCertAuth() ) {
            client.newServerEval().xquery("cts:uris() ! xdmp:document-delete(.)").eval();
        }
        Map<String,Object> opts = new HashMap<>();
        opts.put("outputFormat","xml");

        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,String> stepDetails = new HashMap<>();

        stepDetails.put("outputURIReplacement" ,".*/input,'/output'");
        stepConfig.put("fileLocations", stepDetails);

        RunFlowResponse resp = runFlow("testFlow", "3", UUID.randomUUID().toString(),opts, stepConfig);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll") == 25);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        EvalResultIterator resultItr = runInDatabase("fn:count(cts:uri-match(\"/output/*.xml\"))", HubConfig.DEFAULT_STAGING_NAME);
        EvalResult res = resultItr.next();
        long count = Math.toIntExact((long) res.getNumber());
        Assertions.assertEquals(count, 25);
        if(! isCertAuth() ) {
           EvalResultIterator itr = client.newServerEval().xquery("xdmp:estimate(fn:collection('http://marklogic.com/provenance-services/record'))").eval();
           if(itr != null && itr.hasNext()) {
               Assertions.assertEquals(25, itr.next().getNumber().intValue());
           }
           else {
               Assertions.fail("Server response was null or empty");
           }
        }
     }

     protected RunFlowResponse runFlow(String flowName, String commaDelimitedSteps, String jobId, Map<String,Object> options, Map<String, Object> stepConfig) {
        List<String> steps = commaDelimitedSteps != null ? Arrays.asList(commaDelimitedSteps.split(",")) : null;
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
        RunFlowResponse resp = runFlow("testFlow", "4", UUID.randomUUID().toString(),opts, stepConfig);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-tab-coll") == 25);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        EvalResultIterator resultItr = runInDatabase("fn:count(cts:uri-match(\"/output/*.xml\"))", HubConfig.DEFAULT_STAGING_NAME);
        EvalResult res = resultItr.next();
        long count = Math.toIntExact((long) res.getNumber());
        Assertions.assertEquals(count, 25);
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
        RunFlowResponse resp = runFlow("testFlow", "2", UUID.randomUUID().toString(),opts, stepConfig);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "text-collection") == 1);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testEmptyCollector(){
        Map<String,Object> opts = new HashMap<>();
        opts.put("sourceQuery", "cts.collectionQuery('non-existent-collection')");
        RunFlowResponse resp = runFlow("testFlow", "1,6", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 0);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testInvalidQueryCollector(){
        Map<String,Object> opts = new HashMap<>();
        opts.put("sourceQuery", "cts.collectionQuer('xml-coll')");
        //Flow finishing with "finished_with_errors" status
        RunFlowResponse resp = runFlow("testFlow", "1,6", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 0);
        Assertions.assertTrue(JobStatus.FINISHED_WITH_ERRORS.toString().equalsIgnoreCase(resp.getJobStatus()));
        RunStepResponse stepResp = resp.getStepResponses().get("6");
        Assertions.assertTrue(stepResp.getStatus().equalsIgnoreCase("failed step 6"));

        //Flow finishing with "failed" status
        resp = runFlow("testFlow", "6", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 0);
        Assertions.assertTrue(JobStatus.FAILED.toString().equalsIgnoreCase(resp.getJobStatus()));
        stepResp = resp.getStepResponses().get("6");
        Assertions.assertTrue(stepResp.getStatus().equalsIgnoreCase("failed step 6"));
    }

    @Test
    public void testRunFlowOptions(){
        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        coll.add("test-collection");
        opts.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("collections", coll);
        opts.put("sourceQuery", "cts.collectionQuery('test-collection')");
        RunFlowResponse resp = runFlow("testFlow", "1,2", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        Assertions.assertEquals(2, getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection"));
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));

        opts.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);
        opts.put("sourceDatabase", HubConfig.DEFAULT_FINAL_NAME);
        resp = runFlow("testFlow", "5", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        Assertions.assertEquals(2, getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection"));
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testRunFlowStepConfig(){
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
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection") == 1);
        // Assert that a Job document is created
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_JOB_NAME, "Job") == 1);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testDisableJobOutput(){
        Map<String,Object> opts = new HashMap<>();
        List<String> coll = new ArrayList<>();
        coll.add("test-collection");
        opts.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("collections", coll);
        opts.put("sourceQuery", "cts.collectionQuery('test-collection')");
        opts.put("disableJobOutput", Boolean.TRUE);

        RunFlowResponse resp = runFlow("testFlow", "1,2", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection") == 2);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        // Assert that no Jobs documents were created
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_JOB_NAME, "Jobs") == 0);
    }

    @Test
    public void testRunFlowStopOnError(){
        Map<String,Object> opts = new HashMap<>();

        opts.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);
        opts.put("sourceDatabase", HubConfig.DEFAULT_STAGING_NAME);
        Map<String,String> mapping = new HashMap<>();
        mapping.put("name", "non-existent-mapping");
        mapping.put("version", "1");
        opts.put("mapping", mapping);

        RunFlowResponse resp = runFlow("testFlow", "1,6", UUID.randomUUID().toString(), opts, null);
        flowRunner.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(JobStatus.STOP_ON_ERROR.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testIngestBinaryAndTxt(){
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

        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "binary-text-collection") == 2);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp1.getJobStatus()));
    }

    @Test
    public void testUnsupportedFileType(){
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

        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "binary-text-collection") == 0);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testStopJob() {
        RunFlowResponse resp = runFlow("testFlow", null, null, null, null);
        Runnable r = ()->{
            try {
                Thread.sleep(2650L);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            flowRunner.stopJob(resp.getJobId());
        };
        r.run();
        flowRunner.awaitCompletion();

        assertEquals(JobStatus.CANCELED.toString(), resp.getJobStatus());
    }

    @Test
    public void testRunMultipleJobs() {
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
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()),
            "Expected job status of first response to be 'finished', but was: " + resp.getJobStatus());
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp1.getJobStatus()),
            "Expected job status of second response to be 'finished', but was: " + resp1.getJobStatus());
    }
}
