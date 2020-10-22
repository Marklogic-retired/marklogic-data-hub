package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class StepControllerTest extends AbstractStepControllerTest {
    private final static String PATH = "/api/steps";

    @Test
    void permittedReadUser() throws Exception {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/reference-project");
        loginAsTestUserWithRoles("hub-central-step-runner");

        getJson(PATH)
            .andExpect(status().isOk())
            .andDo(result -> {
                MockHttpServletResponse response = result.getResponse();
                assertEquals(HttpStatus.OK.value(), response.getStatus());
                JsonNode stepsByType = parseJsonResponse(result);
                assertEquals(stepsByType.get("ingestionSteps").get(0).get("name").asText(), "firstLoadData");
                assertEquals(stepsByType.get("ingestionSteps").get(1).get("name").asText(), "testLoadData");
                verifyStepsByStepType(stepsByType, "ingestionSteps");
                verifyStepsByStepType(stepsByType, "mappingSteps");
            });
    }

    private void verifyStepsByStepType(JsonNode stepsByType, String stepTypeProperty) {
        JsonNode stepsOfType = stepsByType.path(stepTypeProperty);
        assertTrue(stepsOfType.isArray(),stepTypeProperty + " should be an array");
        assertTrue(stepsOfType.size() >= 1,stepTypeProperty + " should have one or more steps: " + stepsOfType);
        AtomicInteger fieldSize = new AtomicInteger();
        stepsOfType.path(0).fields().forEachRemaining((fieldEntry) -> {
            fieldSize.getAndIncrement();
            String key = fieldEntry.getKey();
            assertTrue(key.equals("stepId") || key.equals("name"), "step references should only have stepId and name. key: " + key);
        });
        assertEquals(2, fieldSize.get(), "step references should have 2 properties: " + stepsOfType.path(0).toPrettyString());
    }

    @Test
    void forbiddenReadUser() throws Exception {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/reference-project");
        loginAsTestUserWithRoles("hub-central-user");
        getJson(PATH)
            .andExpect(status().isForbidden());
    }
}
