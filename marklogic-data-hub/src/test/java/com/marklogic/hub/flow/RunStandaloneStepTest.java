package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.dataservices.mappingStep.MappingStepInfo;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * "Standalone" = a 5.3 step that lives outside a flow. Intent of this test is to verify that the step is correctly
 * transformed into an inline step and can be successfully executed. ML unit tests exist to do precise validation that
 * the transformation is correct; this is more of a smoke test to ensure that if a step is transformed, it can be run
 * successfully.
 */
public class RunStandaloneStepTest extends AbstractHubCoreTest {

    ReferenceModelProject project;

    @BeforeEach
    void beforeEach() {
        project = installReferenceModelProject();
    }

    @Test
    void mappingStep() {
        // Insert a couple customers to process
        project.createRawCustomer(1, "Jane");
        project.createRawCustomer(2, "John");

        // Create a mapping step
        ObjectNode info = MappingStepInfo.newMappingStepInfo("myMapper").toJsonNode();
        info.putObject("properties").putObject("customerId").put("sourcedFrom", "customerId");
        info.put("version", 1);
        info.put("sourceQuery", format("cts.collectionQuery('%s')", ReferenceModelProject.INPUT_COLLECTION));
        StepService.on(getHubClient().getStagingClient()).saveStep("mapping", info, false);

        // Add it to the existing echoFlow, which is assumed to have one step
        FlowService.on(getHubClient().getStagingClient()).addStepToFlow("echoFlow", "myMapper", "mapping");

        // And run the flow
        FlowRunner flowRunner = new FlowRunnerImpl(getHubClient());
        RunFlowResponse response = flowRunner.runFlow(new FlowInputs("echoFlow", "2"));
        flowRunner.awaitCompletion();

        // And verify the results
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());
        RunStepResponse stepResponse = response.getStepResponses().get("2");
        assertEquals(2, stepResponse.getTotalEvents());
        assertEquals(2, stepResponse.getSuccessfulEvents());

        JsonNode customer1 = getFinalDoc("/customer1.json");
        assertEquals(1, customer1.get("envelope").get("instance").get("Customer").get("customerId").intValue());
        JsonNode customer2 = getFinalDoc("/customer2.json");
        assertEquals(2, customer2.get("envelope").get("instance").get("Customer").get("customerId").intValue());
    }

}
