package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.central.controllers.steps.MappingStepControllerTest;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.flow.FlowRunner;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;

import javax.ws.rs.core.MediaType;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class FlowControllerTest extends AbstractMvcTest {

    @Autowired
    FlowController flowController;

    private final static String PATH = "/api/flows";
    private int initialFlowCount;

    @BeforeEach
    void beforeEach() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles(),
            "A bug in ML 9 prevents amps from working on exported SJS functions correctly, " +
                "such that job/batch documents cannot be updated unless the user has flow-operator-role or greater");
    }

    @Test
    void test() throws Exception {
        installReferenceModelProject();

        loginAsTestUserWithRoles("hub-central-flow-writer");

        // Get the initial count of flows
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                initialFlowCount = flows.size();
            });

        // Create a flow
        final String flowName = "myTestFlow";
        FlowController.FlowInfo info = new FlowController.FlowInfo();
        info.name = flowName;
        info.description = "the description";
        postJson(PATH, info).andExpect(status().isCreated())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertEquals(info.name, response.get("name").asText());
                assertEquals(info.description, response.get("description").asText());
            });
        // Try a second POST and verify it isn't allowed.
        postJson(PATH, info).andExpect(status().isBadRequest());
        // Get flows and verify
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                assertEquals(initialFlowCount + 1, flows.size());
                for (FlowController.FlowWithStepDetails flow : flows) {
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
        StepService.on(getHubClient().getStagingClient()).saveStep(stepDefinitionType, objectMapper.valueToTree(mappingInfo), false);

        // Add the mapping step to the flow
        postJson(flowPath + "/steps", new FlowController.AddStepInfo(mappingInfo.name, stepDefinitionType))
            .andExpect(status().isOk());

        // Get the flows, verify the step is there
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                for (FlowController.FlowWithStepDetails flow : flows) {
                    if (info.name.equals(flow.name)) {
                        assertEquals(1, flow.steps.size());
                        assertEquals("1", flow.steps.get(0).stepNumber);
                        assertEquals(mappingInfo.name, flow.steps.get(0).stepName);
                        assertEquals(stepDefinitionType, flow.steps.get(0).stepDefinitionType);
                    }
                }
            });

        // Run the step
        flowController.setFlowRunnerConsumer((FlowRunner::awaitCompletion));
        final String[] jobIds = new String[1];
        postJson(flowPath + "/steps/1", "{}")
            .andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertTrue(response.has("jobId"), "Running a step should result in a response with a jobId so that the " +
                    "client can then query for job status; response: " + response);
                jobIds[0] = response.get("jobId").asText();
            });

        // Check on the Job
        getJson("/api/jobs/" + URLEncoder.encode(jobIds[0],"UTF-8"))
                .andExpect(status().isOk())
                .andDo(result -> {
                    JsonNode response = parseJsonResponse(result);
                assertEquals(mappingInfo.targetEntityType, response.path("stepResponses").path("1").path("targetEntityType").asText(), "Info for the step should specify the Target Entity Type; response: " + response);
                assertEquals("final", response.path("stepResponses").path("1").path("targetDatabase").asText(), "Step response should specify the target database since the step options contain the targetDatabase; response: " + response);
            });

        // Remove the step
        delete(flowPath + "/steps/1")
            .andExpect(status().isOk());

        // Verify the flow has no steps now
        getJson(PATH).andExpect(status().isOk())
            .andDo(result -> {
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                for (FlowController.FlowWithStepDetails flow : flows) {
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
                FlowController.FlowsWithStepDetails flows = parseFlowsWithStepDetails(result);
                assertEquals(initialFlowCount, flows.size());
            });
    }

    @Test
    void testCustomStepRun() throws Exception {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/run-flow-test");

        loginAsTestUserWithRoles("hub-central-step-runner");

        final String flowName = "testFlow";
        final String flowPath = PATH + "/" + flowName;

        // Run the step
        flowController.setFlowRunnerConsumer((FlowRunner::awaitCompletion));
        MockMultipartFile file1 = new MockMultipartFile("files","file1.json", MediaType.APPLICATION_JSON, "{\"name\": \"Joe\"}".getBytes(StandardCharsets.UTF_8));
        MockMultipartFile file2 = new MockMultipartFile("files","file2.json", MediaType.APPLICATION_JSON, "{\"name\": \"John\"}".getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart(PATH + "/{flowName}/steps/{stepNumber}", flowName, "1")
                .file(file1)
                .file(file2)
            .session(mockHttpSession))
            .andExpect(status().isOk());

        final String[] jobIds = new String[1];
        postJson(flowPath + "/steps/2", "{}")
            .andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertTrue(response.has("jobId"), "Running a step should result in a response with a jobId so that the " +
                    "client can then query for job status; response: " + response);
                    jobIds[0] = response.get("jobId").asText();
                });
        // Check on the Job
        getJson("/api/jobs/" + URLEncoder.encode(jobIds[0],"UTF-8"))
                .andExpect(status().isOk())
                .andDo(result -> {
                    JsonNode response = parseJsonResponse(result);
                assertEquals("finished", response.path("jobStatus").asText(), "The job response should indicate the steps ran successfully: " + response);
            });
        assertTrue(getFinalDoc("/data/file1.json").path("processed").asBoolean(false), "Document should have processed attribute set to true");
    }

    @Test
    void testLoadCsvAsXmlRun() throws Exception {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/run-flow-test");

        loginAsTestUserWithRoles("hub-central-step-runner");

        final String flowName = "testCsvFlow";

        // Run the step
        flowController.setFlowRunnerConsumer((FlowRunner::awaitCompletion));
        final String[] jobIds = new String[1];
        MockMultipartFile file1 = new MockMultipartFile("files","file1.csv", MediaType.TEXT_PLAIN, "name\nJoe".getBytes(StandardCharsets.UTF_8));
        mockMvc.perform(multipart(PATH + "/{flowName}/steps/{stepNumber}", flowName, "1")
                .file(file1)
                .session(mockHttpSession))
            .andExpect(status().isOk())
            .andDo(result -> {
                JsonNode response = parseJsonResponse(result);
                assertTrue(response.has("jobId"), "Running a step should result in a response with a jobId so that the " +
                    "client can then query for job status; response: " + response);
                    jobIds[0] = response.get("jobId").asText();
                });
        // Check on the Job
        getJson("/api/jobs/" + URLEncoder.encode(jobIds[0],"UTF-8"))
                .andExpect(status().isOk())
                .andDo(result -> {
                    JsonNode response = parseJsonResponse(result);
                assertEquals("finished", response.path("jobStatus").asText(), "The job response should indicate the steps ran successfully: " + response);
            });
    }

    @Test
    void permittedReadRunUser() throws Exception {
        installReferenceModelProject();

        loginAsTestUserWithRoles("hub-central-step-runner");

        // read flows
        getJson(PATH).andExpect(status().isOk());

        final String flowPath = PATH + "/ingestToFinal";
        // run ingestion step
        postJson(flowPath + "/steps/1", "{}")
            .andExpect(status().isOk());

        // run mapping step
        postJson(flowPath + "/steps/2", "{}")
            .andExpect(status().isOk());
    }

    @Test
    void forbiddenReadRunUser() throws Exception {
        loginAsTestUserWithRoles("hub-central-user");
        // read flows
        getJson(PATH).andExpect(status().isForbidden());

        final String flowPath = PATH + "/ingestToFinal";
        // run step
        postJson(flowPath + "/steps/1", "{}")
            .andExpect(status().isForbidden());

    }

    @Test
    void runIngestionStepWithUploadedFiles() throws Exception {
        installReferenceModelProject();
        loginAsTestUserWithRoles("hub-central-step-runner");

        MockMultipartFile file1 = new MockMultipartFile("files","file1.json", MediaType.APPLICATION_JSON, "{\"name\": \"Joe\"}".getBytes(StandardCharsets.UTF_8));
        MockMultipartFile file2 = new MockMultipartFile("files","file2.json", MediaType.APPLICATION_JSON, "{\"name\": \"John\"}".getBytes(StandardCharsets.UTF_8));
        flowController.setFlowRunnerConsumer((FlowRunner::awaitCompletion));
        mockMvc.perform(multipart(PATH + "/{flowName}/steps/{stepNumber}", "ingestToFinal", "1")
            .file(file1)
            .file(file2)
            .session(mockHttpSession))
            .andExpect(status().isOk());

        JsonNode rawDoc = getFinalDoc("/customers/file1.json");
        assertEquals("Joe", rawDoc.get("envelope").get("instance").get("name").asText(),
            "Verifying that 2 docs were ingested into the final database");

        rawDoc = getFinalDoc("/customers/file2.json");
        assertEquals("John", rawDoc.get("envelope").get("instance").get("name").asText(),
            "Verifying that 2 docs were ingested into the final database");

        mockMvc.perform(multipart(PATH + "/{flowName}/steps/{stepNumber}", "ingestToFinal", "2")
            .session(mockHttpSession))
            .andExpect(status().isOk());

        JsonNode mappedDoc = getStagingDoc("/customers/file1.json");
        assertNotNull(mappedDoc);
        mappedDoc = getStagingDoc("/customers/file2.json");
        assertNotNull(mappedDoc);
    }

    private FlowController.FlowsWithStepDetails parseFlowsWithStepDetails(MvcResult result) throws Exception {
        return objectMapper.readerFor(FlowController.FlowsWithStepDetails.class)
            .readValue(result.getResponse().getContentAsString());
    }
}
