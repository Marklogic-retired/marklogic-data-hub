package com.marklogic.hub.flow.impl;

import com.marklogic.client.io.Format;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RunFlowOnOverFiveThousandItemsTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/simple-custom-step");

        final int customerCount = 5001;
        writeManyCustomers(customerCount);
        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomStepFlow"));
        RunStepResponse stepResponse = response.getStepResponses().get("1");

        assertEquals(customerCount, stepResponse.getTotalEvents(),
            "CollectorImpl is expected to have a size of 5000; this ensures that the correct total size is returned");
        assertEquals(customerCount, stepResponse.getSuccessfulEvents());
        assertEquals(0, stepResponse.getFailedEvents());
        assertEquals(51, stepResponse.getSuccessfulBatches(), "Assumes a default batch size of 100, so we have " +
            "51 batches with the last batch having 1 doc in it");
        assertEquals(0, stepResponse.getFailedBatches());
    }

    private void writeManyCustomers(int count) {
        ReferenceModelProject project = new ReferenceModelProject(getHubClient());
        doWithWriteBatcher(getHubClient().getStagingClient(), writeBatcher -> {
            for (int i = 1; i <= count; i++) {
                writeBatcher.add(project.buildCustomerInstanceToWrite(new Customer(i, "Jane" + i), Format.JSON, null));
            }
        });
    }
}
