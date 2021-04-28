package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

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

        assertNotNull(client.getStagingClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
        assertNull(client.getFinalClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
    }

    /**
     * Note that because the hook operation gets the content objects as they were before the step module was executed,
     * the URI of the document inserted by the hook is still based on the URI of the input, not on the content object
     * returned by the step module. That's likely not expected behavior, but that's why custom hooks are being replaced
     * by step interceptors.
     */
    @Test
    void afterHook() {
        RunFlowResponse response = runFlow(new FlowInputs("customHookFlow", "2"));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());

        assertNull(client.getStagingClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
        assertNotNull(client.getFinalClient().newDocumentManager().exists(URI_CREATED_BY_HOOK));
    }

    @Test
    void beforeHookThrowsErrorAndStopOnErrorIsTrue() {
        project.createRawCustomer(2, "Janet");

        Map<String, Object> options = new HashMap<>();
        options.put("stopOnError", "true");
        options.put("throwErrorForStepNumber", "1");
        RunFlowResponse response = runFlow(new FlowInputs("customHookFlow", "1", "2").withOptions(options));

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
    }

    @Test
    void afterHookThrowsErrorAndStopOnErrorIsTrue() {
        project.createRawCustomer(2, "Janet");

        Map<String, Object> options = new HashMap<>();
        options.put("stopOnError", "true");
        options.put("throwErrorForStepNumber", "2");
        RunFlowResponse response = runFlow(new FlowInputs("customHookFlow", "2", "1").withOptions(options));

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
