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
        //new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setupEach() throws IOException {
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
    }

    @Test
    public void testRunFlow(){
        RunFlowResponse resp = fr.runFlow("testFlow");
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "csv-coll") == 25);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "json-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "xml-coll") == 1);
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "json-coll") == 1);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));
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
        opts.put("sourceQuery", "cts.uris(null, null, cts.collectionQuery('test-collection'))");
        RunFlowResponse resp = fr.runFlow("testFlow",steps, UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_FINAL_NAME, "test-collection") == 2);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));

        //TODO: Uncomment after DHFPROD-2212 is fixed
       /* opts.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);
        opts.put("sourceDatabase", HubConfig.DEFAULT_FINAL_NAME);
        steps = new ArrayList<>();
        steps.add("4");
       // steps.add("5");
        resp = fr.runFlow("testFlow", steps, UUID.randomUUID().toString(), opts);
        fr.awaitCompletion();
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "test-collection") == 2);
        Assertions.assertTrue(JobStatus.FINISHED.toString().equalsIgnoreCase(resp.getJobStatus()));*/
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
    public void testStopJob() {
        RunFlowResponse resp = fr.runFlow("testFlow");
        Runnable r = ()->{
            try {
                Thread.sleep(3500L);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            fr.stopJob(resp.getJobId());
        };
        r.run();
        fr.awaitCompletion();
        //hoping 1st step is done and flow isn't
        Assertions.assertTrue(getDocCount(HubConfig.DEFAULT_STAGING_NAME, "xml-coll") > 0);
        Assertions.assertTrue(JobStatus.CANCELED.toString().equalsIgnoreCase(resp.getJobStatus()));
    }


}
