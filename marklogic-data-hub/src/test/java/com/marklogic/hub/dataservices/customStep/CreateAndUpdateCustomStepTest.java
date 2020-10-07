package com.marklogic.hub.dataservices.customStep;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.StepService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CreateAndUpdateCustomStepTest extends AbstractHubCoreTest {
    @Test
    void customStep() {

        // Create a custom step
        ObjectNode info = objectMapper.createObjectNode();
        info.put("name", "myCustomStep");
        info.put("stepDefinitionName", "customStepDef");
        info.put("customProp", "value");
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", info, false);

        JsonNode myCustomStep = StepService.on(getHubClient().getStagingClient()).getStep("custom", "myCustomStep");
        assertNotNull(myCustomStep);
        assertEquals("myCustomStep", myCustomStep.get("name").asText());
        assertEquals("value", myCustomStep.get("customProp").asText());

        info.remove("customProp");

        //We aren't overwriting, so "customProp" is still present
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", info, false);
        myCustomStep = StepService.on(getHubClient().getStagingClient()).getStep("custom", "myCustomStep");
        assertNotNull(myCustomStep);
        assertEquals("myCustomStep", myCustomStep.get("name").asText());
        assertEquals("value", myCustomStep.get("customProp").asText());

        //We are overwriting, so "customProp" is not present
        StepService.on(getHubClient().getStagingClient()).saveStep("custom", info, true);
        myCustomStep = StepService.on(getHubClient().getStagingClient()).getStep("custom", "myCustomStep");
        assertNotNull(myCustomStep);
        assertEquals("myCustomStep", myCustomStep.get("name").asText());
        assertNull(myCustomStep.get("customProp"));
    }
}
