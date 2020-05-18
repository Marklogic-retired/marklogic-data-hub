package com.marklogic.hub.central.controllers.steps;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.central.controllers.NewFlowController;
import com.marklogic.hub.dataservices.StepService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class NewFlowControllerTest extends AbstractMvcTest {

    private final static String PATH = "/api/flows";
    private int initialFlowCount;

    @Test
    void test() throws Exception {
        installReferenceModelProject();

        // Get the initial count of flows
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                NewFlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                initialFlowCount = flows.size();
            });

        // Create a flow
        final String flowName = "myTestFlow";
        NewFlowController.FlowInfo info = new NewFlowController.FlowInfo();
        info.name = flowName;
        info.description = "the description";
        postJson(PATH, info).andExpect(status().isCreated())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertEquals(info.name, response.get("name").asText());
                assertEquals(info.description, response.get("description").asText());
            });

        // Get flows and verify
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                NewFlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                assertEquals(initialFlowCount + 1, flows.size());
                for (NewFlowController.FlowWithStepDetails flow : flows) {
                    if (info.name.equals(flow.name)) {
                        assertEquals(info.description, flow.description);
                        assertEquals(0, flow.steps.size());
                    }
                }
            });

        final String flowPath = PATH + "/" + flowName;

        // Update the flow
        info.description = "modified";
        putJson(flowPath, info).andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertEquals(info.name, response.get("name").asText());
                assertEquals(info.description, response.get("description").asText());
            });

        // Create a mapping step to add to the flow
        final String stepDefinitionType = "mapping";
        MappingStepControllerTest.MappingStep mappingInfo = MappingStepControllerTest.newDefaultMappingStep("myMapper");
        StepService.on(getHubClient().getStagingClient()).saveStep(stepDefinitionType, objectMapper.valueToTree(mappingInfo));

        // Add the mapping step to the flow
        postJson(flowPath + "/steps", new NewFlowController.AddStepInfo(mappingInfo.name, stepDefinitionType))
            .andExpect(status().isOk());

        // Get the flows, verify the step is there
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                NewFlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                for (NewFlowController.FlowWithStepDetails flow : flows) {
                    if (info.name.equals(flow.name)) {
                        assertEquals(1, flow.steps.size());
                        assertEquals("1", flow.steps.get(0).stepNumber);
                        assertEquals(mappingInfo.name, flow.steps.get(0).stepName);
                        assertEquals(stepDefinitionType, flow.steps.get(0).stepDefinitionType);
                    }
                }
            });

        // Run the step
        postJson(flowPath + "/steps/1", "{}")
            .andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertTrue(response.has("jobId"), "Running a step should result in a response with a jobId so that the " +
                    "client can then query for job status; response: " + response);
            });

        // Remove the step
        delete(flowPath + "/steps/1")
            .andExpect(status().isOk());

        // Verify the flow has no steps now
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                NewFlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                for (NewFlowController.FlowWithStepDetails flow : flows) {
                    if (info.name.equals(flow.name)) {
                        assertEquals(0, flow.steps.size(), "The step should have been removed");
                    }
                }
            });

        // Delete the flow
        delete(flowPath).andExpect(status().isOk());

        // Verify we're back to the initial count of flows
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                NewFlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                assertEquals(initialFlowCount, flows.size());
            });
    }

    private NewFlowController.FlowsWithStepDetails parseFlowsWithStepDetails(MvcResult result) throws Exception {
        return objectMapper.readerFor(NewFlowController.FlowsWithStepDetails.class)
            .readValue(result.getResponse().getContentAsString());
    }
}
