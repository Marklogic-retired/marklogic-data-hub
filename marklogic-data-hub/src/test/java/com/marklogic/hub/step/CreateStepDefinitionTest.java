package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.util.json.JSONObject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CreateStepDefinitionTest {

    @Test
    public void customStep() {
        JsonNode node = createStep(StepDefinition.StepDefinitionType.CUSTOM);
        verifyCommonFieldsOnStep(node);
    }

    @Test
    public void ingestionStep() {
        JsonNode node = createStep(StepDefinition.StepDefinitionType.INGESTION);
        verifyCommonFieldsOnStep(node);

        assertEquals("cts.collectionQuery([])", node.get("options").get("sourceQuery").asText(),
            "Per DHFPROD-3056, sourceQuery now gets a default value to match QuickStart");
    }

    @Test
    public void mappingStep() {
        JsonNode node = createStep(StepDefinition.StepDefinitionType.MAPPING);
        verifyCommonFieldsOnStep(node);
    }

    @Test
    public void masteringStep() {
        JsonNode node = createStep(StepDefinition.StepDefinitionType.MASTERING);

        verifyCommonFieldsOnStep(node);

        JsonNode mergeOptions = node.get("options").get("mergeOptions");
        assertNotNull(mergeOptions);
        assertFalse(mergeOptions.has("mapper"),
            "Verifying that the ObjectMapper is written out as a JSON field");
    }

    private void verifyCommonFieldsOnStep(JsonNode node) {
        assertEquals("", node.get("description").asText(),
            "Description should default to an empty string instead of null so that 'null' doesn't appear in a client interface");
    }

    private JsonNode createStep(StepDefinition.StepDefinitionType type) {
        StepDefinition step = StepDefinition.create("my-step", type);
        try {
            String json = JSONObject.writeValueAsString(step);
            return new JSONObject(json).jsonNode();
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
