package com.marklogic.hub.flow.connected;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class IngestAndMapWithConnectedStepsTest extends AbstractHubCoreTest {

    /**
     * This test has a lot of duplication with the related ml-unit-test, but the goal is to verify that a) the HTTP
     * endpoint works, and b) the JSON returned by it is correctly deserialized into a RunFlowResponse.
     */
    @Test
    void test() {
        installProjectFromUnitTestFolder("data-hub/5/flow/ingestAndMapConnected");

        HubFlowRunnerResource.Input input = new HubFlowRunnerResource.Input("ingestAndMap");
        input.addContent("/customer1.json").put("customerId", "1");
        input.addContent("/customer2.json").put("customerId", "2");

        RunFlowResponse runFlowResponse = new HubFlowRunnerResource(getHubClient().getStagingClient()).runFlow(input);
        verifyFlowResponseFields(runFlowResponse);
        verifyIngestResponse(runFlowResponse);

        assertNotNull(getStagingDoc("/customer1.json"));
        assertNotNull(getStagingDoc("/customer2.json"));
        assertNotNull(getFinalDoc("/customer1.json"));
        assertNotNull(getFinalDoc("/customer2.json"));
    }

    private void verifyFlowResponseFields(RunFlowResponse response) {
        assertNotNull("job123", response.getJobId());
        assertEquals("finished", response.getJobStatus());
        assertEquals("2", response.getLastAttemptedStep());
        assertEquals("2", response.getLastCompletedStep());
        assertEquals(getHubClient().getUsername(), response.getUser());
        assertNotNull(response.getStartTime());
        assertNotNull(response.getEndTime());
    }

    private void verifyIngestResponse(RunFlowResponse runFlowResponse) {
        RunStepResponse ingestResponse = runFlowResponse.getStepResponses().get("1");
        assertEquals("ingestAndMap", ingestResponse.getFlowName());
        assertEquals("ingestCustomer", ingestResponse.getStepName());
        assertEquals("default-ingestion", ingestResponse.getStepDefinitionName());
        assertEquals("ingestion", ingestResponse.getStepDefinitionType());
        assertNull(ingestResponse.getTargetEntityType());
        assertEquals(getHubClient().getDbName(DatabaseKind.STAGING), ingestResponse.getTargetDatabase());
        assertNull(ingestResponse.getStepOutput());
        assertNull(ingestResponse.getFullOutput());
        assertEquals("completed step 1", ingestResponse.getStatus());
        assertEquals(2, ingestResponse.getTotalEvents());
        assertEquals(2, ingestResponse.getSuccessfulEvents());
        assertEquals(0, ingestResponse.getFailedEvents());
        assertEquals(1, ingestResponse.getSuccessfulBatches());
        assertEquals(0, ingestResponse.getFailedBatches());
        assertTrue(ingestResponse.isSuccess());
        assertNotNull(ingestResponse.getStepStartTime());
        assertNotNull(ingestResponse.getStepEndTime());
    }
}
