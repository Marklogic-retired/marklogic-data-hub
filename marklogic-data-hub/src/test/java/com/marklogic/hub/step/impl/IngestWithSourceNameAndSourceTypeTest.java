package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.flow.impl.JobStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class IngestWithSourceNameAndSourceTypeTest extends AbstractHubCoreTest {

    @BeforeEach
    void beforeEach() {
        installReferenceModelProject();
    }

    @Test
    void runDefaultIngestionWithSourceNameAndSourceType(){
        String path = "entity-reference-model/data/employees";
        ObjectNode info = new ObjectMapper().createObjectNode();
        info.put("name", "sources-test");
        info.put("description", "step to test source name and source type");
        info.put("sourceFormat", "json");
        info.put("targetFormat", "json");
        info.put("sourceName", "sample-source");
        info.put("sourceType", "employee");
        info.put("outputURIPrefix", "");

        StepService.on(getHubClient().getStagingClient()).saveStep("ingestion", info, false, true);

        // Add it to the existing echoFlow, which is assumed to have one step
        FlowService.on(getHubClient().getStagingClient()).addStepToFlow("echoFlow", "sources-test", "ingestion");

        // And run the flow
        FlowInputs inputs = new FlowInputs("echoFlow", "2");
        inputs.setInputFilePath(readFileFromClasspath(path).getAbsolutePath());

        FlowRunner flowRunner = new FlowRunnerImpl(getHubClient());
        RunFlowResponse response = flowRunner.runFlow(inputs);
        flowRunner.awaitCompletion();
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        for(int i=1; i<=3; i++) {
            JsonNode sourceDoc = getStagingDoc("employee" + i + ".json");
            assertNotNull(sourceDoc);
            assertEquals(2, sourceDoc.get("envelope").get("headers").get("sources").size(), "sources should contain name and only 1 object of sourceName and sourceType");
            JsonNode sourcesNode = sourceDoc.get("envelope").get("headers").get("sources").get(0);
            assertEquals("sources-test", sourcesNode.get("name").asText());

            sourcesNode = sourceDoc.get("envelope").get("headers").get("sources").get(1);
            assertEquals("sample-source", sourcesNode.get("datahubSourceName").asText());
            assertEquals("employee", sourcesNode.get("datahubSourceType").asText());
        }
    }

    @Test
    void runDefaultIngestionWithNoSourceNameAndSourceType(){
        String path = "entity-reference-model/data/customers";
        ObjectNode info = new ObjectMapper().createObjectNode();
        info.put("name", "sources-test");
        info.put("description", "step to test source name and source type");
        info.put("sourceFormat", "json");
        info.put("targetFormat", "json");
        info.put("outputURIPrefix", "");

        StepService.on(getHubClient().getStagingClient()).saveStep("ingestion", info, false, true);

        // Add it to the existing echoFlow, which is assumed to have one step
        FlowService.on(getHubClient().getStagingClient()).addStepToFlow("echoFlow", "sources-test", "ingestion");

        // And run the flow
        FlowInputs inputs = new FlowInputs("echoFlow", "2");
        inputs.setInputFilePath(readFileFromClasspath(path).getAbsolutePath());

        FlowRunner flowRunner = new FlowRunnerImpl(getHubClient());
        RunFlowResponse response = flowRunner.runFlow(inputs);
        flowRunner.awaitCompletion();
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());
        JsonNode sourceDoc = getStagingDoc("customer1.json");
        assertNotNull(sourceDoc);
        JsonNode sourcesNode = sourceDoc.get("envelope").get("headers").get("sources");
        assertEquals(1, sourcesNode.size(), "Only sources array with name as stepName exists");
        assertEquals("sources-test", sourcesNode.get(0).get("name").asText());
    }
}
