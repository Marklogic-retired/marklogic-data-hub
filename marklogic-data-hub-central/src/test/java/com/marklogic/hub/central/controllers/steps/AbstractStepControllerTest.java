package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.central.schemas.CustomHookSchema;
import com.marklogic.hub.central.schemas.StepSettingsSchema;

import java.util.Iterator;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
        postJson(stepTypePath, initialStepProperties.toString()).andExpect(status().isCreated());

        // Get the step and verify it
        final String stepPath = stepTypePath + "/" + stepName;
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


        // Get the setting so they can be updated
        final String settingsPath = stepPath + "/settings";
        StepSettingsSchema[] settings = new StepSettingsSchema[1];
        getJson(settingsPath).andExpect(status().isOk())
            .andDo(result -> {
                settings[0] = StepUtil.settingsFromJson(readJsonObject(result.getResponse().getContentAsString()));
            });

        // Update the settings. The job database is used to ensure something changes, as we know that no step defaults
        // to using the job database as a target database. Including custom hook to ensure coverage of that class.
        settings[0].setTargetDatabase(getHubClient().getDbName(DatabaseKind.JOB));
        CustomHookSchema hook = new CustomHookSchema();
        hook.setModule("/some/module.sjs");
        hook.setUser("someuser");
        hook.setRunBefore(true);
        settings[0].setCustomHook(hook);
        putJson(settingsPath, settings[0]).andExpect(status().isOk());

        // Get the settings and verify they were updated
        getJson(settingsPath)
            .andExpect(status().isOk())
            .andDo(result -> {
                StepSettingsSchema updatedSettings = StepUtil.settingsFromJson(readJsonObject(result.getResponse().getContentAsString()));
                assertEquals(getHubClient().getDbName(DatabaseKind.JOB), updatedSettings.getTargetDatabase());
                assertEquals("/some/module.sjs", updatedSettings.getCustomHook().getModule());
                assertEquals("someuser", updatedSettings.getCustomHook().getUser());
                assertTrue(updatedSettings.getCustomHook().getRunBefore());
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
