package com.marklogic.hub;

import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CustomStepE2E extends AbstractHubCoreTest {

    @Test
    public void testCustomStep() {
        installProjectInFolder("mapping-test");

        RunFlowResponse flowResponse = runFlow(new FlowInputs("Admissions", "1", "2", "3", "4"));
        RunStepResponse ingestionJob = flowResponse.getStepResponses().get("3");
        assertTrue(ingestionJob.isSuccess(), "Custom ingestion job failed: " + ingestionJob.stepOutput);
        assertEquals(806, getStagingDocCount("LabsCore"), "There should be 806 doc in LabsCore collection");
        assertEquals(372, getFinalDocCount("CompletedAdmissions"), "There should be 372 doc in CompletedAdmissions collection");

        runFlow(new FlowInputs("Admissions", "5"));
        assertEquals(372, getFinalDocCount("mdm-content"), "There should be 372 doc in mdm-content collection");
    }
}
