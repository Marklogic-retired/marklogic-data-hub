package com.marklogic.hub.dataservices.customStep;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.StepService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CreateAndUpdateCustomStepTest extends AbstractHubCoreTest {
    @Test
    void customStep() {
        DatabaseClient client = getHubClient().getStagingClient();
        StepService stepService = StepService.on(client);
        // Create a custom step
        ObjectNode info = objectMapper.createObjectNode();
        info.put("name", "myCustomStep");
        info.put("stepDefinitionName", "customStepDef");
        info.put("customProp", "value");
        stepService.saveStep("custom", info, false, true);

        JsonNode myCustomStep = stepService.getStep("custom", "myCustomStep");
        assertNotNull(myCustomStep);
        assertEquals("myCustomStep", myCustomStep.get("name").asText());
        assertEquals("value", myCustomStep.get("customProp").asText());

        info.remove("customProp");

        //We aren't overwriting, so "customProp" is still present
        stepService.saveStep("custom", info, false, false);
        myCustomStep = stepService.getStep("custom", "myCustomStep");
        assertNotNull(myCustomStep);
        assertEquals("myCustomStep", myCustomStep.get("name").asText());
        assertEquals("value", myCustomStep.get("customProp").asText());

        //We are overwriting, so "customProp" is not present
        stepService.saveStep("custom", info, true, false);
        myCustomStep = stepService.getStep("custom", "myCustomStep");
        assertNotNull(myCustomStep);
        assertEquals("myCustomStep", myCustomStep.get("name").asText());
        assertNull(myCustomStep.get("customProp"));
    }
}
