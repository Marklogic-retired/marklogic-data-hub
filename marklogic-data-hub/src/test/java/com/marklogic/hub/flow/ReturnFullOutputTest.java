package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ReturnFullOutputTest extends AbstractHubCoreTest {

    /**
     * Verifies that both writeStepOutput and fullOutput work for an independent step.
     *
     * @throws Exception
     */
    @Test
    void fullOutputForStep() throws Exception {
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");

        String s = "{\n" +
            "  \"stepOptions\": {\n" +
            "    \"1\": {\n" +
            "      \"writeStepOutput\": false,\n" +
            "      \"fullOutput\": true\n" +
            "    }\n" +
            "  }\n" +
            "}";

        RunFlowResponse response = runSuccessfulFlow(new FlowInputs("simpleCustomStepFlow")
            .withOptions(objectMapper.readValue(s, HashMap.class)));

        final String uri = "/Customer1.json";
        assertNotNull(getHubClient().getStagingClient().newDocumentManager().exists(uri),
            "The document should exist in staging, as it was written there before the flow was run");
        assertNull(getHubClient().getFinalClient().newDocumentManager().exists(uri),
            "No document should exist in final since writeStepOutput=false");

        Map<String, JsonNode> fullOutput = response.getStepResponses().get("1").getFullOutput();
        assertTrue(fullOutput.containsKey(uri), "The initial 5.0 design of fullOutput is that it's a map " +
            "of URI to content objects, as opposed to an array of content objects");

        JsonNode node = fullOutput.get(uri);
        assertEquals(uri, node.get("uri").asText());
        assertEquals("Jane", node.get("value").get("envelope").get("instance").get("Customer").get("name").asText(),
            "Prior to 5.5, I think the fix for DHFPROD-3176 was made under the assumption that the 'documents' returned " +
                "in ResponseHolder were actual documents, vs content objects, and thus it was safer to call node.toString(). " +
                "But we know that these are JSON content objects, and not documents, so for 5.5, a change was made so that " +
                "RunStepResponse.fullOutput is now a map of JsonNodes instead of Object, since we know for certain that the " +
                "value must be a JsonNode.");
    }
}
