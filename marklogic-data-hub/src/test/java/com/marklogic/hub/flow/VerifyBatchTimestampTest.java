package com.marklogic.hub.flow;

import com.marklogic.client.io.Format;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;


public class VerifyBatchTimestampTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/custom-step-with-sleep");

        ReferenceModelProject project = new ReferenceModelProject(getHubClient());
        doWithWriteBatcher(getHubClient().getStagingClient(), writeBatcher -> {
            writeBatcher.add(project.buildCustomerInstanceToWrite(new Customer(0, "Jane"), Format.JSON, null));
        });

        RunFlowResponse response = runFlow(new FlowInputs("customFlowWithSleep"));
        RunStepResponse stepResponse = response.getStepResponses().get("1");

        assertEquals("completed step 1", stepResponse.getStatus());
        assertEquals(1, stepResponse.getSuccessfulBatches());

        LocalDateTime startTime = parseDateTime(stepResponse.getStepStartTime());
        LocalDateTime endTime = parseDateTime(stepResponse.getStepEndTime());

        assertNotNull(startTime);
        assertNotNull(endTime);
        assertTrue(endTime.isAfter(startTime));
    }
}
