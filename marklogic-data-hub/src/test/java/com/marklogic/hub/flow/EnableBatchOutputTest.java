package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class EnableBatchOutputTest extends AbstractHubCoreTest {

    @BeforeEach
    void beforeEach() {
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");

        assertEquals(0, getJobDocCount());
        assertEquals(0, getBatchDocCount());
    }

    @Test
    void neverWithFailure() {
        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomStepFlow")
            .withOption("throwErrorOnPurpose", true)
            .withOption("enableBatchOutput", "never"));

        assertEquals("failed", response.getJobStatus(), "The flow should have failed as the custom step should have " +
            "thrown an error: " + response.toJson());

        assertEquals(1, getJobDocCount());
        assertEquals(0, getBatchDocCount(), "A job doc should be created, but not a batch doc, since batch output is disabled");
    }

    @Test
    void onFailure() {
        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomStepFlow")
            .withOption("throwErrorOnPurpose", true)
            .withOption("enableBatchOutput", "onFailure"));

        assertEquals("failed", response.getJobStatus());

        assertEquals(1, getJobDocCount());
        assertEquals(1, getBatchDocCount(), "Since a failure occurred and enableBatchOutput=onFailure, a batch " +
            "document should have been created");
    }
}
