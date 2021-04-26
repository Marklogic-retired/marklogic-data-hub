package com.marklogic.hub.flow;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;

import org.junit.jupiter.api.Test;

public class DeleteJobsTest extends AbstractHubCoreTest {

    @Test
    void singleJobAndBatch() {
        installProjectAndRunFlow();

        JobManager jobManager = new JobManager(getHubClient());
        jobManager.deleteJobs("P1D");
        assertEquals(1, getJobDocCount(),
                "Because the duration means nothing from the past day should be deleted, the Job "
                        + "should still exist");
        assertEquals(1, getBatchDocCount());

        jobManager.deleteJobs("PT0S");
        assertEquals(0, getJobDocCount());
        assertEquals(0, getBatchDocCount());
    }

    @Test
    public void jobAndBatchDontHaveTimeEnded() {
        installProjectAndRunFlow();
        setJobAndBatchTimeEndedToNull();

        new JobManager(getHubClient()).deleteJobs("PT0S");
        assertEquals(1, getJobDocCount(), "Because the Job doesn't have timeEnded, it shouldn't be deleted");
        assertEquals(1, getBatchDocCount());
    }

    @Test
    public void invalidDuration() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            new JobManager(getHubClient()).deleteJobs("Bogus duration");
        }, "Should throw IllegalArgumentException when an invalid duration is provided.");

        assertEquals("retainDuration must be a duration in the format of PnYnM or PnDTnHnMnS", ex.getMessage());
    }

    @Test
    void testAsUserWhoCannotDeleteJobs() {
        runAsDataHubOperator();

        JobManager jobManager = new JobManager(getHubClient());
        RuntimeException ex = assertThrows(RuntimeException.class, () -> jobManager.deleteJobs("PT0S"),
                "data-hub-operator does not have the privilege needed to delete jobs");

        String message = ex.getMessage();
        assertTrue(message.startsWith("Unable to delete jobs, cause:"), "Unexpected message: " + message);
        assertTrue(message.contains("You do not have permission to this method and URL"),
                "Unexpected message: " + message);
    }

    private void installProjectAndRunFlow() {
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");
        runSuccessfulFlow(new FlowInputs("simpleCustomStepFlow", "1"));
    }

    private void setJobAndBatchTimeEndedToNull() {
        String script = "declareUpdate(); " + "const job = fn.collection('Job').toArray()[0]; "
                + "const updatedJob = job.toObject(); updatedJob.job.timeEnded = null; "
                + "xdmp.nodeReplace(job, updatedJob); " + "const batch = fn.collection('Batch').toArray()[0]; "
                + "const updatedBatch = batch.toObject(); updatedBatch.batch.timeEnded = null; "
                + "xdmp.nodeReplace(batch, updatedBatch);";
        getHubClient().getJobsClient().newServerEval().javascript(script).evalAs(String.class);
    }
}
