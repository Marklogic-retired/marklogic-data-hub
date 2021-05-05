package org.example;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.ext.junit5.AbstractDataHubTest;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Provides an example how running and verifying the results of a flow by extending the AbstractDataHubTest class
 * provided by marklogic-data-hub-junit5.
 */
public class RunCustomerFlowTest extends AbstractDataHubTest {

    @Test
    void test() {
        RunFlowResponse response = runFlow(new FlowInputs("CurateCustomerJSON", "1", "2"));
        assertEquals("finished", response.getJobStatus());

        RunStepResponse ingestResponse = response.getStepResponses().get("1");
        assertEquals("completed step 1", ingestResponse.getStatus());
        assertEquals(6, ingestResponse.getSuccessfulEvents(), "6 JSON documents should have been ingested " +
            "from the input/json directory");

        RunStepResponse mapResponse = response.getStepResponses().get("2");
        assertEquals("completed step 2", mapResponse.getStatus());
        assertEquals(6, mapResponse.getSuccessfulEvents());

        // Example of verifying an ingest document in staging
        JsonNode stagingDoc = getHubClient().getStagingClient().newJSONDocumentManager().read("/Customer/Cust1.json",
            new JacksonHandle()).get();
        assertEquals(101, stagingDoc.get("envelope").get("instance").get("CustomerID").asInt());

        // Example of verifying a mapped document in final
        JsonNode finalDoc = getHubClient().getFinalClient().newJSONDocumentManager().read("/Customer/Cust1.json",
            new JacksonHandle()).get();
        assertEquals(101, finalDoc.get("envelope").get("instance").get("Customer").get("customerId").asInt());

        // Example of verifying the Job document
        final String expectedJobUri = "/jobs/" + response.getJobId() + ".json";
        JsonNode jobDoc = getHubClient().getJobsClient().newJSONDocumentManager().read(expectedJobUri, new JacksonHandle()).get();
        assertEquals("finished", jobDoc.get("job").get("jobStatus").asText());
    }
}
