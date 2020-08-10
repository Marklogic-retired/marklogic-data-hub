package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.job.JobStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RunFlowWithInvalidStepDefTest extends AbstractHubCoreTest {

    @Autowired
    FlowRunner flowRunner;

    /**
     * In order to reproduce this error, we have to use the Spring-managed FlowRunner, as that does not use
     * MarkLogicStepDefinitionProvider, which will immediately provide a nice error message when a step definition
     * cannot be found.
     */
    @Test
    void test() {
        installProjectInFolder("test-projects/flow-with-invalid-step-def");

        RunFlowResponse response = flowRunner.runFlow("invalidStepDef");
        flowRunner.awaitCompletion();

        assertEquals(JobStatus.FAILED.toString(), response.getJobStatus(),
            "The job should have failed because the only step in the flow references a step definition that " +
                "does not exist");
        String message = response.getStepResponses().get("1").getStepOutput().get(0);
        assertTrue(message.contains("Could not find a step definition with name 'doesntExist' and type 'CUSTOM' for step '1' in flow 'invalidStepDef'"),
            "Did not find expected message in: " + message);
    }
}
