package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ExcludeItemsProcessedByStepTest extends AbstractHubCoreTest {

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

    private void verifyExclusionsForFlow(String flowName, String stepId) {
        ReferenceModelProject project = new ReferenceModelProject(getHubClient());

        project.createRawCustomer(1, "Jane");

        RunFlowResponse response = runFlow(new FlowInputs(flowName).withJobId("job111"));
        assertEquals(1, response.getStepResponses().get("1").getSuccessfulEvents());

        verifyFirstBatchDocument(flowName, stepId);

        project.createRawCustomer(2, "Jasmine");
        project.createRawCustomer(3, "Jerry");

        response = runFlow(new FlowInputs(flowName)
            .withJobId("job222")
            .withOptions(Collections.singletonMap("excludeProcessedByStep", "true")));
        assertEquals(2, response.getStepResponses().get("1").getSuccessfulEvents(),
            "Only the two new items should have been processed since items already processed were excluded");
        assertEquals(3, response.getStepResponses().get("1").getTotalEvents(),
            "The QueryStepRunner still thinks 3 items were processed since it sent a batch of 3 items " +
                "to the endpoint");

        verifySecondBatchDocument(flowName, stepId);
    }

    private void verifyFirstBatchDocument(String flowName, String stepId) {
        String data = getHubClient().getJobsClient().newServerEval().xquery("collection('Batch')[/batch/jobId = 'job111']").evalAs(String.class);
        JsonNode batch = readJsonObject(data).get("batch");

        assertEquals(flowName, batch.get("flowName").asText());
        assertEquals(stepId, batch.get("stepId").asText());
        assertEquals("finished", batch.get("batchStatus").asText());
        assertEquals(1, batch.get("uris").size());
        assertEquals(1, batch.get("processedItemHashes").size(),
            "The processedItemHashes array exists to support the excludeProcessedByStep option; a range index exists on it " +
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
}
