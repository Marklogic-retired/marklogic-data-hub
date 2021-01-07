package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.AbstractMvcTest;

import java.util.Iterator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public abstract class AbstractStepControllerTest extends AbstractMvcTest {

    /**
     * Provides a general test plan for common step endpoints. Subclass just needs to identify the root path for its
     * endpoints - the "stepTypePath" - and then an initial set of JSON data for creating a step.
     *
     * @param stepTypePath
     * @param initialStepProperties
     * @throws Exception
     */
    protected void verifyCommonStepEndpoints(String stepTypePath, JsonNode initialStepProperties,
                                             String stepDefinitionName, String stepDefinitionType) throws Exception {
        // Create a step
        final String stepName = initialStepProperties.get("name").asText();
        final String stepPath = stepTypePath + "/" + stepName;
        // The UI expects ok instead of "created", so going with that for now
        postJson(stepTypePath, initialStepProperties.toString()).andExpect(status().isOk());

        // Get the step and verify it
        getJson(stepPath).andExpect(status().isOk())
            .andDo(result -> {
                JsonNode actualStep = parseJsonResponse(result);
                assertEquals(stepDefinitionName, actualStep.get("stepDefinitionName").asText());
                assertEquals(stepDefinitionType, actualStep.get("stepDefinitionType").asText());
                verifyJsonNodes(initialStepProperties, actualStep);
            });

        // Update the step and verify it
        ObjectNode props = objectMapper.createObjectNode();
        props.put("anyPropertyCanBeSet", "toAnyValue");
        putJson(stepPath, props.toString()).andExpect(status().isOk());
        getJson(stepPath).andExpect(status().isOk())
            .andDo(result -> {
                JsonNode actualStep = parseJsonResponse(result);
                verifyJsonNodes(initialStepProperties, actualStep);
                assertEquals("toAnyValue", actualStep.get("anyPropertyCanBeSet").asText());
            });

        // And delete the step and verify it's gone
        delete(stepPath).andExpect(status().isOk());
        getJson(stepPath).andExpect(status().isNotFound());
    }


    // TODO Move this to AbstractHubTest once testFixtures depends on JUnit
    protected void verifyJsonNodes(JsonNode expectedNode, JsonNode actualNode) {
        Iterator<String> names = expectedNode.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            if (expectedNode.get(name).isArray()) {
                ArrayNode expectedArray = (ArrayNode) expectedNode.get(name);
                ArrayNode actualArray = (ArrayNode) actualNode.get(name);
                for (int i = 0; i < expectedArray.size(); i++) {
                    assertEquals(expectedArray.get(i).asText(), actualArray.get(i).asText(),
                        format("Expected equal values for property %s at array index %d", name, i));
                }
            } else {
                assertEquals(expectedNode.get(name).asText(), actualNode.get(name).asText(), "Expected equal values for property: " + name);
            }
        }
    }
}
