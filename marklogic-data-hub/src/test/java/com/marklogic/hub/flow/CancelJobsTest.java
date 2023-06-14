package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.JobService;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.flow.impl.JobStatus;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CancelJobsTest extends AbstractHubCoreTest {


    @Test
    void testFinishJob() {
        runAsAdmin();
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");
        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomStepFlow", "1"));
        assertEquals("finished", response.getJobStatus(), "Unexpected job status: " + response.toJson());

    }
    @Test
    void testCancelJobID() {
        runAsAdmin();
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");
        RunFlowResponse response = runAndCancelFlow2(new FlowInputs("simpleCustomStepFlow", "1"));
        JsonNode jobsJson = JobService.on(getHubClient().getJobsClient()).getJobWithDetails(response.getJobId());
        String jobStatus = jobsJson.path("job").path("jobStatus").asText();

        assertEquals("canceled", jobStatus, "Unexpected job status'");
    }

    protected RunFlowResponse runAndCancelFlow2(FlowInputs flowInputs) {
        FlowRunnerImpl flowRunner = new FlowRunnerImpl(getHubClient());
        flowRunner.onStatusChanged((jobId, step, jobStatus, percentComplete, successfulEvents, failedEvents, message) ->{
            if(!jobStatus.equals(JobStatus.STARTED)){
                flowRunner.stopJob(jobId);
            }
        });
        RunFlowResponse response = flowRunner.runFlow(flowInputs);
        waitTime();
        flowRunner.stopJob(response.jobId);
        flowRunner.awaitCompletion();
        return response;
    }

    private void waitTime() {
        try {
            Thread.sleep(100);
        }
        catch (Exception e) {
            /** interrupted,  fail */
        }
    }
}
