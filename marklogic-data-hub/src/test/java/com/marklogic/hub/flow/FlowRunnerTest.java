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

import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.step.StepDefinition;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.*;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class FlowRunnerTest extends HubTestBase {

    @Autowired
    private FlowManagerImpl fm;

    @Autowired
    private FlowRunnerImpl fr;

    @Autowired
    private HubConfigImpl hubConfig;

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
    public void setupEach() throws IOException {
        basicSetup();
        getDataHubAdminConfig();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
        FileUtils.copyFileToDirectory(getResourceFile("flow-runner-test/entities/e2eentity.entity.json"),
            hubConfig.getHubEntitiesDir().toFile());
        installUserModules(getDataHubAdminConfig(), true);
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/flows"), hubConfig.getFlowsDir().toFile());
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/input"),
            hubConfig.getHubProjectDir().resolve("input").toFile());
        FileUtils.copyFileToDirectory(getResourceFile("flow-runner-test/step-definitions/json-ingestion.step.json"),
            hubConfig.getStepsDirByType(StepDefinition.StepDefinitionType.INGESTION).resolve("json-ingestion").toFile());
        FileUtils.copyFileToDirectory(getResourceFile("flow-runner-test/step-definitions/json-mapping.step.json"),
            hubConfig.getStepsDirByType(StepDefinition.StepDefinitionType.MAPPING).resolve("json-mapping").toFile());
        FileUtils.copyDirectory(getResourceFile("flow-runner-test/mappings"),
            hubConfig.getHubMappingsDir().resolve("e2e-mapping").toFile());
        installUserModules(getDataHubAdminConfig(), true);
        installHubArtifacts(getDataHubAdminConfig(), true);
        getHubFlowRunnerConfig();
    }

    @Test
    public void testRunFlow(){
        RunFlowResponse resp = fr.runFlow("testFlow");
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll") == 25);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "json-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "json-map") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 1);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        Assertions.assertNotNull(resp.getUser());
        Assertions.assertNotNull(resp.getStartTime());
        Assertions.assertNotNull(resp.getEndTime());
        Assertions.assertNotNull(resp.getLastAttemptedStep());
        Assertions.assertNotNull(resp.getLastCompletedStep());
        RunStepResponse stepResp = resp.getStepResponses().get("1");
        Assertions.assertNotNull(stepResp.getStepStartTime());
        Assertions.assertNotNull(stepResp.getStepEndTime());
    }

    @Test
    public void testEmptyCollector(){
        Map<String,Object> opts = new HashMap<>();
        opts.put("sourceQuery", "cts.collectionQuery('non-existent-collection')");
        RunFlowResponse resp = fr.runFlow("testFlow", Arrays.asList("1", "5"), UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 0);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testInvalidQueryCollector(){
        Map<String,Object> opts = new HashMap<>();
        opts.put("sourceQuery", "cts.collectionQuer('xml-coll')");
        //Flow finishing with "finished_with_errors" status
        RunFlowResponse resp = fr.runFlow("testFlow", Arrays.asList("1", "5"), UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 0);
        Assertions.assertTrue(JobStatus.FINISHED_WITH_ERRORS.toString().equalsIgnoreCase(resp.getJobStatus()));
        RunStepResponse stepResp = resp.getStepResponses().get("5");
        Assertions.assertTrue(stepResp.getStatus().equalsIgnoreCase("failed step 5"));

        //Flow finishing with "failed" status
        resp = fr.runFlow("testFlow", Arrays.asList("5"), UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-map") == 0);
        Assertions.assertTrue(JobStatus.FAILED.toString().equalsIgnoreCase(resp.getJobStatus()));
        stepResp = resp.getStepResponses().get("5");
        Assertions.assertTrue(stepResp.getStatus().equalsIgnoreCase("failed step 5"));
    }

    @Test
    public void testRunFlowOptions(){
        Map<String,Object> opts = new HashMap<>();
        List<String> steps = new ArrayList<>();
        steps.add("1");
        steps.add("2");
        List<String> coll = new ArrayList<>();
        coll.add("test-collection");
        opts.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("collections", coll);
        opts.put("permissions", "rest-reader,read");
        opts.put("sourceQuery", "cts.collectionQuery('test-collection')");
        RunFlowResponse resp = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection") == 2);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));

        opts.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);
        opts.put("sourceDatabase", HubConfig.DEFAULT_FINAL_NAME);
        steps = new ArrayList<>();
        steps.add("4");
        resp = fr.runFlow("testFlow", steps, UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection") == 2);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testRunFlowStepConfig(){
        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> steps = new ArrayList<>();
        steps.add("1");
        steps.add("2");
        List<String> coll = new ArrayList<>();
        coll.add("test-collection");
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","json");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
        opts.put("collections", coll);
        opts.put("permissions", "rest-reader,read");

        RunFlowResponse resp = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts, stepConfig);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection") == 1);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
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

        RunFlowResponse resp = fr.runFlow("testFlow",Arrays.asList("1","5"), UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(JobStatus.STOP_ON_ERROR.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testIngestBinaryAndTxt(){
        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> steps = new ArrayList<>();
        steps.add("1");
        List<String> coll = new ArrayList<>();
        coll.add("binary-text-collection");
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","binary");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("outputFormat", "Binary");
        opts.put("collections", coll);
        opts.put("permissions", "rest-reader,read");
        RunFlowResponse resp = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts, stepConfig);
        fr.awaitCompletion();

        coll = new ArrayList<>();
        coll.add("text-collection");
        stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","text");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("outputFormat", "Text");
        RunFlowResponse resp1 = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts, stepConfig);
        fr.awaitCompletion();

        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "binary-text-collection") == 2);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp1.getJobStatus()));
    }

    @Test
    public void testUnsupportedFileType(){
        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> steps = new ArrayList<>();
        steps.add("1");
        List<String> coll = new ArrayList<>();
        coll.add("binary-text-collection");
        Map<String,String> stepDetails = new HashMap<>();
        stepDetails.put("inputFileType","unsupported");

        stepConfig.put("fileLocations", stepDetails);
        stepConfig.put("batchSize", "1");
        opts.put("outputFormat", "Binary");
        opts.put("collections", coll);
        opts.put("permissions", "rest-reader,read");
        RunFlowResponse resp = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts, stepConfig);
        fr.awaitCompletion();

        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "binary-text-collection") == 0);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testStopJob() {
        RunFlowResponse resp = fr.runFlow("testFlow");
        Runnable r = ()->{
            try {
                Thread.sleep(2650L);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            fr.stopJob(resp.getJobId());
        };
        r.run();
        fr.awaitCompletion();

        //Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") > 0);
        Assertions.assertTrue(JobStatus.CANCELED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }

    @Test
    public void testRunMultipleJobs() {
        Map<String,Object> stepConfig = new HashMap<>();
        Map<String,Object> opts = new HashMap<>();
        List<String> steps = new ArrayList<>();
        steps.add("2");
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


        RunFlowResponse resp = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts, stepConfig);
        RunFlowResponse resp1 = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts1, stepConfig1);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection1") == 1);
        System.out.println(resp.getJobStatus());
        System.out.println(resp1.getJobStatus());
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp1.getJobStatus()));
    }
}
