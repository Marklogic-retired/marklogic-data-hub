package com.marklogic.hub.scaffolding;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.ScaffoldingImpl;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

public class AddStepToFlowTest extends AbstractHubCoreTest {

    ScaffoldingImpl scaffolding;
    FlowManagerImpl flowManager;

    @BeforeEach
    void beforeEach() {
        scaffolding = new ScaffoldingImpl(getHubConfig());
        flowManager = new FlowManagerImpl(getHubConfig());
        Flow testFlow = new FlowImpl();
        testFlow.setName("testFlow");
        testFlow.setSteps(new HashMap<>());
        flowManager.saveLocalFlow(testFlow);
        installOnlyReferenceModelEntities(false);
        scaffolding.createStepFile("ingestionStep", "ingestion", null, null);
        scaffolding.createStepFile("mappingStep", "mapping", null, "Customer");
        scaffolding.createStepFile("customStep", "custom", null, null);
        scaffolding.createStepFile("matchStep", "matching", null, null);
        scaffolding.createStepFile("mergeStep", "merging", null, null);
        installUserArtifacts();
    }

    //TODO Add tests for matching and merging steps once DHFPROD-5663 is completed
    @Test
    void testAddStepToFlow() throws IOException {
        Pair<JsonNode, String> results = addStepToFlow("testFlow", "ingestionStep", "ingestion");
        verifyFlow(results.getLeft(), "testFlow", "ingestionStep", "ingestion","1");
        verifyMessages(results.getRight(), "testFlow", "ingestionStep");

        results = addStepToFlow("testFlow", "mappingStep", "mapping");
        verifyFlow(results.getLeft(), "testFlow","mappingStep", "mapping",  "2");
        verifyMessages(results.getRight(), "testFlow", "mappingStep");

        results = addStepToFlow("testFlow", "customStep", "custom");
        verifyFlow(results.getLeft(),"testFlow","customStep", "custom", "3");
        verifyMessages(results.getRight(), "testFlow", "customStep");

        results = addStepToFlow("testFlow", "matchStep", "matching");
        verifyFlow(results.getLeft(),"testFlow","matchStep", "matching", "4");
        verifyMessages(results.getRight(), "testFlow", "matchStep");

        results = addStepToFlow("testFlow", "mergeStep", "merging");
        verifyFlow(results.getLeft(),"testFlow","mergeStep", "merging", "5");
        verifyMessages(results.getRight(), "testFlow", "mergeStep");
    }

    private Pair<JsonNode,String> addStepToFlow(String flowName, String stepName, String stepType) throws IOException{
        Pair<File, String> results = flowManager.addStepToFlow(flowName, stepName, stepType);
        File flowFile = results.getLeft();
        JsonNode step = objectMapper.readTree(flowFile);
        return Pair.of(step, results.getRight());
    }

    private void verifyFlow(JsonNode flow, String flowName, String stepName, String stepType, String stepNum){
        assertEquals(flowName, flow.get("name").asText());
        assertEquals(stepName + "-" + stepType, flow.get("steps").get(stepNum).get("stepId").asText());
    }

    private void verifyMessages(String message, String flowName, String stepName){
        StringBuilder messageBuilder = new StringBuilder();
        messageBuilder.append("Added step '" + stepName + "' to flow '" + flowName + "' in staging and final databases.");
        assertEquals(messageBuilder.toString(), message);
    }

}
