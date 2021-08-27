package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.flow.impl.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class RunStepWithCustomHookTest extends AbstractHubCoreTest {

    private final static String URI_CREATED_BY_HOOK = "/insertedByHook/customer1.json";

    HubClient client;
    ReferenceModelProject project;

    @BeforeEach
    void beforeEach() {
        project = installReferenceModelProject();
        runAsDataHubOperator();
        client = getHubClient();
        project.createRawCustomer(1, "Jane");
    }

    @Test
    void beforeHook() {
        RunFlowResponse response = runFlow(new FlowInputs("customHookFlow", "1"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        assertNotNull(client.getStagingClient().newDocumentManager().exists("/insertedByHook/customer1.json"));
        assertNull(client.getFinalClient().newDocumentManager().exists("/insertedByHook/customer1.json"));
    }

    /**
     * Note that because the hook operation gets the content objects as they were before the step module was executed,
     * the URI of the document inserted by the hook is still based on the URI of the input, not on the content object
     * returned by the step module. That's likely not expected behavior, but that's why custom hooks are being replaced
     * by step interceptors. BUT - in 5.5, this is being fixed so that a custom hook receives the output content array.
     * This is being done since the expected primary use case for a hook is to attach it to a mapping step to modify
     * the mapped content objects. Pre 5.5, that worked because a mapping step returns the same content object it
     * receives. That's no longer the case in 5.5. So we're changing custom hooks to behave the way a user would
     * likely expect - i.e. that a "before" hook gets the content array before a step processes it, and an "after"
     * hook gets the content array that a step outputs.
     */
    @Test
    void afterHook() {
        RunFlowResponse response = runFlow(new FlowInputs("customHookFlow", "2"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        assertNull(client.getStagingClient().newDocumentManager().exists("/insertedByHook/echo/customer1.json"));
        assertNotNull(client.getFinalClient().newDocumentManager().exists("/insertedByHook/echo/customer1.json"));
    }

    @Test
    void beforeHookThrowsErrorAndStopOnErrorIsTrue() {
        project.createRawCustomer(2, "Janet");

        RunFlowResponse response = runFlow(
            new FlowInputs("customHookFlow", "1", "2")
                .withOption("stopOnError", "true")
                .withOption("throwErrorForStepNumber", "1")
        );

        assertEquals(JobStatus.STOP_ON_ERROR.toString(), response.getJobStatus());
        assertEquals("1", response.getLastAttemptedStep());
        assertEquals("0", response.getLastCompletedStep());
        assertEquals(1, response.getStepResponses().keySet().size(),
            "The second step should not have been run since stopOnError=true");

        RunStepResponse stepResponse = response.getStepResponses().get("1");
        assertEquals("canceled step 1", stepResponse.getStatus());
        assertEquals(2, stepResponse.getTotalEvents());
        assertEquals(0, stepResponse.getSuccessfulEvents());
        assertEquals(2, stepResponse.getFailedEvents(), "Both items are considered to have failed since the " +
            "entire batch failed due to a custom hook error");
        assertEquals(0, stepResponse.getSuccessfulBatches());
        assertEquals(1, stepResponse.getFailedBatches());
        assertEquals(1, stepResponse.getStepOutput().size());
        assertTrue(stepResponse.getStepOutput().get(0).contains("Throwing error on purpose for step number"),
            "Unexpected step error: " + stepResponse.getStepOutput().get(0));
        assertFalse(stepResponse.isSuccess());

        JsonNode job = getJobDoc(response.getJobId()).get("job");
        assertEquals("stop-on-error", job.get("jobStatus").asText());
        assertEquals("1", job.get("lastAttemptedStep").asText());
        assertEquals("0", job.get("lastCompletedStep").asText());

        JsonNode batch = getFirstBatchDoc().get("batch");
        assertEquals("failed", batch.get("batchStatus").asText());
        assertEquals(2, batch.get("uris").size());
        assertEquals("/customer1.json", batch.get("uris").get(0).asText());
        assertEquals("/customer2.json", batch.get("uris").get(1).asText());
        assertEquals("Error: Throwing error on purpose for step number: 1",
            batch.get("completeError").get("data").get(0).asText(),
            "The actual error message is expected to be in the 'data' array");
    }

    @Test
    void afterHookThrowsErrorAndStopOnErrorIsTrue() {
        project.createRawCustomer(2, "Janet");

        RunFlowResponse response = runFlow(
            new FlowInputs("customHookFlow", "2", "1")
                .withOption("stopOnError", "true")
                .withOption("throwErrorForStepNumber", "2")
        );

        assertEquals(JobStatus.STOP_ON_ERROR.toString(), response.getJobStatus());
        assertEquals("2", response.getLastAttemptedStep());
        assertEquals("0", response.getLastCompletedStep());
        assertEquals(1, response.getStepResponses().keySet().size(),
            "The second step (step 1 in this scenario) should not have been run since stopOnError=true");

        RunStepResponse stepResponse = response.getStepResponses().get("2");
        assertEquals("canceled step 2", stepResponse.getStatus());
        assertEquals(2, stepResponse.getTotalEvents());
        assertEquals(0, stepResponse.getSuccessfulEvents());
        assertEquals(2, stepResponse.getFailedEvents());
        assertEquals(0, stepResponse.getSuccessfulBatches());
        assertEquals(1, stepResponse.getFailedBatches());
        assertEquals(1, stepResponse.getStepOutput().size());
        assertTrue(stepResponse.getStepOutput().get(0).contains("Throwing error on purpose for step number"),
            "Unexpected step error: " + stepResponse.getStepOutput().get(0));
        assertFalse(stepResponse.isSuccess());
    }
}
