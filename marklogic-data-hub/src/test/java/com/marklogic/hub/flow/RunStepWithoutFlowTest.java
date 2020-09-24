package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RunStepWithoutFlowTest extends AbstractHubCoreTest {

    @Test
    void test() {
        ReferenceModelProject project = installReferenceModelProject();
        runAsDataHubOperator();
        project.createRawCustomer(1, "Jane");
        project.createRawCustomer(2, "John");

        FlowRunnerImpl flowRunner = new FlowRunnerImpl(getHubClient());
        RunFlowResponse response = flowRunner.runStep("simpleMapper-mapping");
        flowRunner.awaitCompletion();
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus());
        assertEquals(2, getFinalDocCount("Customer"), "If the mapping step ran correctly, should have two instances in " +
            "the Customer collection in final");
    }

}
