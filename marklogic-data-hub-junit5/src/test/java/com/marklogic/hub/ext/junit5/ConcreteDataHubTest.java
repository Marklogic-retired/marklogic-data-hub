package com.marklogic.hub.ext.junit5;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ConcreteDataHubTest extends AbstractDataHubTest {

    @Test
    void test() throws Exception {
        loadTestFlow();

        FlowInputs flowInputs = new FlowInputs("SimpleInlineFlow");

        // Example of modifying the inputFilePath of an ingestion path so that it points to a test-specific directory
        // containing files to ingest
        flowInputs.setInputFilePath(new ClassPathResource("test-data/simple-json").getFile().getAbsolutePath());

        // Use the runFlow helper to run a flow and wait for it to finish
        RunFlowResponse flowResponse = runFlow(flowInputs);
        assertEquals("finished", flowResponse.getJobStatus());

        RunStepResponse stepResponse = flowResponse.getStepResponses().get("1");
        assertEquals("completed step 1", stepResponse.getStatus());
        assertEquals(1, stepResponse.getTotalEvents());
        assertEquals(1, stepResponse.getSuccessfulEvents());
        assertEquals(0, stepResponse.getFailedEvents());
    }

    /**
     * Typically, a user will have already deployed their DHF project into ML, such that the flow that a user wants to
     * test already exists.
     *
     * @throws Exception
     */
    private void loadTestFlow() throws Exception {
        String testFlow = "{\n" +
            "  \"name\": \"SimpleInlineFlow\",\n" +
            "  \"steps\": {\n" +
            "    \"1\": {\n" +
            "      \"name\": \"simpleIngestionStep\",\n" +
            "      \"stepDefinitionName\": \"default-ingestion\",\n" +
            "      \"stepDefinitionType\": \"INGESTION\",\n" +
            "      \"options\": {\n" +
            "        \"permissions\": \"data-hub-common,read,data-hub-common,update\",\n" +
            "        \"outputFormat\": \"json\",\n" +
            "        \"targetDatabase\": \"data-hub-FINAL\"\n" +
            "      },\n" +
            "      \"fileLocations\": {\n" +
            "        \"inputFilePath\": \"/user/specific/absolute/path\",\n" +
            "        \"inputFileType\": \"json\"\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}\n";

        ArtifactService.on(getHubClient().getStagingClient()).setArtifact("flow", "SimpleInlineFlow",
            new ObjectMapper().readTree(testFlow));
    }
}
