package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.job.JobStatus;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ExcludeAlreadyProcessedItemsTest extends AbstractHubCoreTest {

    @Test
    void referencedStep() {
        installProjectInFolder("test-projects/simple-customer-flow");
        verifyExclusionsForFlow("simpleCustomerFlow", "simpleCustomerMapping-mapping");
    }

    @Test
    void inlineStep() {
        installReferenceModelProject();
        verifyExclusionsForFlow("simpleMapping", "simpleMapper-MAPPING");
    }

    @Test
    void differentFlowName() {
        runSimpleCustomerFlowOnOneRecord();

        RunFlowResponse response = runFlow(new FlowInputs("anotherSimpleCustomerFlow", "1").withOptions(buildExcludeOptions()));
        assertEquals(1, response.getStepResponses().get("1").getSuccessfulEvents(),
            "Because a different flow was run, the customer doc should still be processed");
    }

    @Test
    void differentStepId() {
        runSimpleCustomerFlowOnOneRecord();

        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomerFlow", "2").withOptions(buildExcludeOptions()));
        assertEquals(1, response.getStepResponses().get("2").getSuccessfulEvents(),
            "Because a step with a different stepId was run, the customer doc should still be processed");
    }

    @Test
    void existingBatchHasStatusOtherThanFinished() {
        runSimpleCustomerFlowOnOneRecord();

        setBatchStatusToFailed();

        // Run the same flow and step again
        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomerFlow", "1"));
        assertEquals(1, response.getStepResponses().get("1").getSuccessfulEvents(),
            "The customer document should have been processed again because the Batch associated with it does not " +
                "have a status of 'finished'");
    }

    @Test
    void optionHasStringValueOfTrue() {
        runSimpleCustomerFlowOnOneRecord();

        final String stepNumber = "1";
        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomerFlow", stepNumber)
            .withOptions(Collections.singletonMap("excludeAlreadyProcessed", "true")));
        assertEquals(0, response.getStepResponses().get(stepNumber).getSuccessfulEvents(),
            "In case the user puts in 'true' instead of true, the option should still work and items should be " +
                "excluded if already processed");
    }

    private void setBatchStatusToFailed() {
        String script = "declareUpdate(); " +
            "const batchDoc = fn.head(fn.collection('Batch')); " +
            "const batch = batchDoc.toObject(); " +
            "batch.batch.batchStatus = 'failed'; " +
            "xdmp.nodeReplace(batchDoc, batch);";
        getHubClient().getJobsClient().newServerEval().javascript(script).evalAs(String.class);
    }

    private void verifyExclusionsForFlow(String flowName, String stepId) {
        final String stepNumber = "1";

        ReferenceModelProject project = new ReferenceModelProject(getHubClient());

        // Create and process one record
        project.createRawCustomer(1, "Jane");
        RunFlowResponse response = runFlow(new FlowInputs(flowName, stepNumber).withJobId("job111"));
        assertEquals(1, response.getStepResponses().get(stepNumber).getSuccessfulEvents());
        verifyFirstBatchDocument(flowName, stepId);

        // Create two more records and verify that only those 2 are processed
        project.createRawCustomer(2, "Jasmine");
        project.createRawCustomer(3, "Jerry");
        response = runFlow(new FlowInputs(flowName, stepNumber).withJobId("job222")
            .withOptions(buildExcludeOptions()));
        assertEquals(2, response.getStepResponses().get(stepNumber).getSuccessfulEvents(),
            "Only the two new items should have been processed since items already processed were excluded");
        assertEquals(3, response.getStepResponses().get(stepNumber).getTotalEvents(),
            "The QueryStepRunner still thinks 3 items were processed since it sent a batch of 3 items " +
                "to the endpoint");
        verifySecondBatchDocument(flowName, stepId);

        // Run the step again, verify nothing is processed
        response = runFlow(new FlowInputs(flowName, stepNumber).withOptions(buildExcludeOptions()));
        assertEquals(JobStatus.FINISHED.toString(), response.getJobStatus(), "Even though no items were processed, " +
            "no errors occurred, so the status should still be finished");

        RunStepResponse stepResponse = response.getStepResponses().get(stepNumber);
        assertEquals(JobStatus.COMPLETED_PREFIX + stepNumber, stepResponse.getStatus(), "Even though no items were " +
            "processed, the step did complete, so the status should reflect that");
        assertEquals(0, stepResponse.getSuccessfulEvents(),
            "All 3 items have already been processed, so no items should have been processed this time");
        assertEquals(3, stepResponse.getTotalEvents());
        assertEquals(1, stepResponse.getSuccessfulBatches(),
            "Even though no items were processed, the batch should be regarded as having completed successfully, " +
                "since no errors were thrown. This represents a change from prior to this ticket - DHFPROD-5977 - " +
                "where the number of items that failed and that were processed were both zero, the batch was " +
                "considered to have failed, even though an error was not thrown.");
    }

    private void verifyFirstBatchDocument(String flowName, String stepId) {
        String data = getHubClient().getJobsClient().newServerEval().xquery("collection('Batch')[/batch/jobId = 'job111']").evalAs(String.class);
        JsonNode batch = readJsonObject(data).get("batch");

        assertEquals(flowName, batch.get("flowName").asText());
        assertEquals(stepId, batch.get("stepId").asText());
        assertEquals("finished", batch.get("batchStatus").asText());
        assertEquals(1, batch.get("uris").size());
        assertEquals(1, batch.get("processedItemHashes").size(),
            "The processedItemHashes array exists to support the excludeAlreadyProcessed option; a range index exists on it " +
                "to allow for efficient queries to see if an item has already been processed");
    }

    private void verifySecondBatchDocument(String flowName, String stepId) {
        String data = getHubClient().getJobsClient().newServerEval().xquery("collection('Batch')[/batch/jobId = 'job222']").evalAs(String.class);
        JsonNode batch = readJsonObject(data).get("batch");

        assertEquals(flowName, batch.get("flowName").asText());
        assertEquals(stepId, batch.get("stepId").asText());
        assertEquals("finished", batch.get("batchStatus").asText());
        assertEquals(2, batch.get("uris").size(), "Only 2 items should have been processed; the item that was processed " +
            "when the step was first run should not have been processed");
        assertEquals(2, batch.get("processedItemHashes").size());
    }

    private void runSimpleCustomerFlowOnOneRecord() {
        installProjectInFolder("test-projects/simple-customer-flow");
        new ReferenceModelProject(getHubClient()).createRawCustomer(1, "Jane");

        RunFlowResponse response = runFlow(new FlowInputs("simpleCustomerFlow", "1"));
        assertEquals(1, response.getStepResponses().get("1").getSuccessfulEvents());
    }

    private Map<String, Object> buildExcludeOptions() {
        return Collections.singletonMap("excludeAlreadyProcessed", true);
    }
}
