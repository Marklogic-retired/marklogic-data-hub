/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.WebApplication;
import com.marklogic.hub.web.model.MappingModel;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {WebApplication.class, ApplicationConfig.class, FlowManagerServiceTest.class})
class FlowManagerServiceTest extends AbstractServiceTest {

    private static String FLOW = "testFlow";
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    private String customIngestStep = "{\"name\":\"firstIngest\",\"description\":\"\",\"isValid\":false,\"fileLocations\":{\"inputFilePath\":" +
        "\"/Users/ssambasu/Downloads/2508\",\"inputFileType\":\"json\",\"outputURIReplacement\":\"\",\"separator\":\",\"},\"options\":{\"collections\"" +
        ":[\"firstIngest\"],\"additionalCollections\":[],\"permissions\":\"rest-reader,read,rest-writer,update\",\"outputFormat\":\"json\",\"sourceQuery\"" +
        ":\"cts.collectionQuery([])\",\"sourceCollection\":\"\",\"targetEntity\":\"\",\"sourceDatabase\":\"\",\"targetDatabase\":\"data-hub-STAGING\"}," +
        "\"stepDefinitionType\":\"INGESTION\",\"stepDefinitionName\":\"firstIngest\",\"selectedSource\":\"\"}";

    private String customMappingStep = "{\"id\":\"firstMapping-mapping\",\"name\":\"firstMapping\",\"stepDefinitionName\":\"firstMapping\",\"" +
        "stepDefinitionType\":\"MAPPING\",\"description\":\"\",\"options\":{\"additionalCollections\":[],\"sourceQuery\":\"cts.collectionQuery" +
        "([\\\"test-ingest\\\"])\",\"targetEntity\":\"User\",\"sourceDatabase\":\"data-hub-STAGING\",\"collections\":[\"firstMapping\",\"User\"]," +
        "\"sourceCollection\":\"test-ingest\",\"outputFormat\":\"json\",\"targetDatabase\":\"data-hub-FINAL\",\"mapping\":{\"name\":\"FirstFlow-firstMapping" +
        "\",\"version\":0}},\"language\":null,\"isValid\":true,\"customHook\":{}}";

    @Autowired
    FlowManagerService flowManagerService;

    @Autowired
    MappingManagerService mappingManagerService;

    @Autowired
    StepDefinitionManager stepDefinitionManager;

    @Autowired
    FlowManager flowManager;

    @Autowired
    HubConfigImpl hubConfig;

    @BeforeEach
    void setUp() {
        createProjectDir();
        hubConfig.initHubProject();
        hubConfig.refreshProject();

        Path flowDir = projectDir.resolve("flows");

        FileUtil.copy(getResourceStream("flow-manager/flows/testFlow.flow.json"), flowDir.resolve("testFlow.flow.json").toFile());

        installUserModules(getDataHubAdminConfig(), true);
    }

    @AfterEach
    void teardownProject() {
        clearUserModules();
        deleteProjectDir();
        clearStagingFinalAndJobDatabases();
    }

    @Test
    void deleteFlow() throws InterruptedException {
        List<String> flowList = flowManagerService.getFlowNames();
        assertEquals(1, flowList.size());

        flowManagerService.deleteFlow(FLOW);

        flowList = flowManagerService.getFlowNames();
        assertEquals(0, flowList.size());

        // Adding sleep to delete artifacts from the db via async call
        Thread.sleep(1000);

        DocumentPage doc = stagingDocMgr.read("/flows/" + FLOW + ".flow.json");
        assertFalse(doc.hasNext());
        doc = finalDocMgr.read("/flows/" + FLOW + ".flow.json");
        assertFalse(doc.hasNext());
    }

    @Test
    void deleteFirstStep() {
        Map<String, Step> stepMap = flowManager.getFlow(FLOW).getSteps();
        assertEquals(5, stepMap.size());

        String firstStepId = stepMap.get("1").getName() + "-" + stepMap.get("1").getStepDefinitionType();
        flowManagerService.deleteStep(FLOW, firstStepId);
        assertEquals(stepMap.get("2").getName(), flowManager.getFlow(FLOW).getStep("1").getName());
        assertEquals(4, flowManager.getFlow(FLOW).getSteps().size());

    }

    @Test
    void deleteLastStep() {
        Map<String, Step> stepMap = flowManager.getFlow(FLOW).getSteps();
        assertEquals(5, stepMap.size());

        String lastStepId = stepMap.get("5").getName() + "-" + stepMap.get("5").getStepDefinitionType();
        flowManagerService.deleteStep(FLOW, lastStepId);
        assertEquals(stepMap.get("4").getName(), flowManager.getFlow(FLOW).getStep("4").getName());
        assertEquals(4, flowManager.getFlow(FLOW).getSteps().size());
    }

    @Test
    void deleteMiddleStep() {
        Map<String, Step> stepMap = flowManager.getFlow(FLOW).getSteps();
        assertEquals(5, stepMap.size());

        String midStepId = stepMap.get("3").getName() + "-" + stepMap.get("3").getStepDefinitionType();
        flowManagerService.deleteStep(FLOW, midStepId);
        assertEquals(stepMap.get("4").getName(), flowManager.getFlow(FLOW).getStep("3").getName());
        assertEquals(4, flowManager.getFlow(FLOW).getSteps().size());
    }

    /**
     * A confusing part of this test is that "mapping name" means different things in different contexts. In the
     * context of a flow, "mapping name" is just the name of the mapping. But in the context of mappings,
     * "mapping name" is the name of a flow plus hyphen plus the name of the mapping. In this test, that is referred
     * to as the "full mapping name".
     *
     * @throws IOException
     */
    @Test
    void deleteMappingStepThatIsNotReferencedByAnyOtherFlows() throws IOException {
        final String mappingName = "testMapping";

        // Create a mapping with 2 versions
        MappingModel mappingModel = mappingManagerService.getMapping(mappingName, true);
        mappingManagerService.saveMapping(mappingName, mappingModel.toJson());
        mappingModel.setDescription("This is the second version");
        mappingManagerService.saveMapping(mappingName, mappingModel.toJson());
        assertEquals(1, mappingManagerService.getMappings().size(), "A mapping should have been created");

        // Update the flow to reference the mapping
        Flow flow = flowManager.getFlow(FLOW);
        Map<String, Step> stepMap = flow.getSteps();
        assertEquals(5, stepMap.size());
        Step step = stepMap.get("5");
        assertTrue(step.isMappingStep());
        step.setName(mappingName);
        ((ObjectNode)step.getOptions().get("mapping")).put("name", mappingName);
        flowManager.saveFlow(flow);

        // Install artifacts so we can verify that the mappings are deleted
        installHubArtifacts(hubConfig, true);

        // Verify the mappings exist
        GenericDocumentManager stagingDocumentManager = stagingClient.newDocumentManager();
        GenericDocumentManager finalDocumentManager = finalClient.newDocumentManager();
        final String[] expectedMappingUris = new String[]{
            "/mappings/testMapping/testMapping-1.mapping.json",
            "/mappings/testMapping/testMapping-2.mapping.json"
        };
        for (String uri : expectedMappingUris) {
            assertNotNull(stagingDocumentManager.exists(uri));
            assertNotNull(finalDocumentManager.exists(uri));
        }


        final String stepId = mappingName + "-" + step.getStepDefinitionType();
        flowManagerService.deleteStep(FLOW, stepId);

        assertEquals(0, mappingManagerService.getMappings().size(),
            "The mapping should have been deleted because no flows refer to it now");
        for (String uri : expectedMappingUris) {
            assertNull(stagingDocumentManager.exists(uri));
            assertNull(finalDocumentManager.exists(uri));
        }
    }

    @Test
    void deleteCustomStepThatIsNotReferencedByAnyOtherFlows() {
        String customStepName = "myTestCustomStep";
        FileUtil.copy(getResourceStream(
            "scaffolding-test/" + customStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION), getDataHubAdminConfig().getStepsDirByType(StepDefinition.StepDefinitionType.CUSTOM)
            .resolve(customStepName + "/" + customStepName + StepDefinitionManager.STEP_DEFINITION_FILE_EXTENSION).toFile());

        assertEquals(1, stepDefinitionManager.getStepDefinitions().size(),
            "Should have the one custom step that was just copied over");

        // Change the 4th step in our test flow to reference the custom step
        Flow flow = flowManager.getFlow(FLOW);
        Map<String, Step> stepMap = flow.getSteps();
        assertEquals(5, stepMap.size());
        Step step = stepMap.get("4");
        step.setStepDefinitionType(StepDefinition.StepDefinitionType.CUSTOM);
        step.setStepDefinitionName(customStepName);
        step.setName(customStepName);
        flowManager.saveFlow(flow);

        // Install artifacts so we can verify that the step definition can be deleted
        installHubArtifacts(hubConfig, true);
        installUserModules(hubConfig, true);

        // Verify the step exists
        GenericDocumentManager stagingDocumentManager = stagingClient.newDocumentManager();
        GenericDocumentManager finalDocumentManager = finalClient.newDocumentManager();
        final String expectedStepUri = "/step-definitions/custom/myTestCustomStep/myTestCustomStep.step.json";
        assertNotNull(stagingDocumentManager.exists(expectedStepUri));
        assertNotNull(finalDocumentManager.exists(expectedStepUri));

        final String stepId = customStepName + "-" + step.getStepDefinitionType();
        flowManagerService.deleteStep(FLOW, stepId);
        flow = flowManager.getFlow(FLOW);
        assertEquals(4, flow.getSteps().size());

        assertEquals(0, stepDefinitionManager.getStepDefinitions().size(),
            "The custom step should have been deleted since no flows refer to it now");

        assertNull(stagingDocumentManager.exists(expectedStepUri));
        assertNull(finalDocumentManager.exists(expectedStepUri));
    }

    @Test
    void createCustomSteps() {
        flowManagerService.createStep(FLOW, 6, null, customIngestStep);
        Flow flow = flowManager.getFlow("testFlow");
        Assertions.assertTrue(stepDefinitionManager.getStepDefinition("firstIngest", StepDefinition.StepDefinitionType.INGESTION) != null);
        Assertions.assertTrue(stepDefinitionManager.getStepDefinition("firstIngest", StepDefinition.StepDefinitionType.INGESTION).getModulePath().equals("/custom-modules/ingestion/firstIngest/main.sjs"));
        Assertions.assertTrue(project.getCustomModuleDir("firstIngest", "ingestion").resolve("main.sjs").toFile().exists());
        //Assertions.assertTrue(flow.getStep("6").getModulePath() == null);

        flowManagerService.createStep(FLOW, 6, null, customMappingStep);
        Assertions.assertTrue(stepDefinitionManager.getStepDefinition("firstMapping", StepDefinition.StepDefinitionType.MAPPING) != null);
        Assertions.assertTrue(stepDefinitionManager.getStepDefinition("firstMapping", StepDefinition.StepDefinitionType.MAPPING).getModulePath().equals("/custom-modules/mapping/firstMapping/main.sjs"));
        Assertions.assertTrue(project.getCustomModuleDir("firstMapping", "mapping").resolve("main.sjs").toFile().exists());
        flow = flowManager.getFlow("testFlow");
        Assertions.assertTrue(flow.getSteps().size() == 7);
    }
}
