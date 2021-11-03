package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RunFlowWithWriteErrorTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");

        // Alter the step definition to use a module that will return a content object that fails on write
        ObjectNode stepDef = objectMapper.createObjectNode();
        final String stepDefName = "simpleCustomStep-step";
        stepDef.put("name", stepDefName);
        stepDef.put("modulePath", "/custom-modules/custom/simpleCustomStep/writeErrorStepModule.sjs");
        ArtifactService.on(getHubClient().getStagingClient()).setArtifact("stepDefinition", stepDefName, stepDef, "");

        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomStepFlow"));

        System.out.println(response.toJson());

        assertEquals("failed", response.getJobStatus(), "The job is considered to have failed since an error occurred " +
            "during the 'write' phase, and thus nothing was written");
        assertEquals("1", response.getLastAttemptedStep());
        assertEquals("0", response.getLastCompletedStep());

        RunStepResponse stepResponse = response.getStepResponses().get("1");
        assertEquals("failed step 1", stepResponse.getStatus());
        assertEquals(1, stepResponse.getTotalEvents());
        assertEquals(0, stepResponse.getSuccessfulEvents());
        assertEquals(1, stepResponse.getFailedEvents());
        assertEquals(0, stepResponse.getSuccessfulBatches());
        assertEquals(1, stepResponse.getFailedBatches());
        assertEquals(1, stepResponse.getStepOutput().size(), "Expecting the 'write' error message to exist");
        assertTrue(stepResponse.getStepOutput().get(0).contains("XDMP-RANGEINDEX"));
    }
}
