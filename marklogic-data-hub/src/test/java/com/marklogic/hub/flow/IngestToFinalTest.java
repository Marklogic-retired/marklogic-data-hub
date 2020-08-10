package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class IngestToFinalTest extends AbstractHubCoreTest {

    /**
     * This is an intentionally simple ingest-then-map flow that verifies that WriteStepRunner can write to the final
     * database using the final DatabaseClient, and then data can be collected from final and written to the staging
     * database via a mapping step. It was created to verify that WriteStepRunner works fine when writing to the final
     * database via hubClient.getFinalClient() as opposed to creating a DatabaseClient for staging that points to the
     * final database.
     */
    @Test
    void ingestToFinalAndMapToStaging() {
        final String flowName = "ingestToFinal";

        installReferenceModelProject();
        makeInputFilePathsAbsoluteInFlow(flowName);
        runFlow(new FlowInputs(flowName));

        JsonNode rawDoc = getFinalDoc("/customers/customer1.json");
        assertEquals("1", rawDoc.get("envelope").get("instance").get("CustomerID").asText(),
            "Verifying that the single doc was ingested into the final database");

        JsonNode mappedDoc = getStagingDoc("/customers/customer1.json");
        assertEquals(1, mappedDoc.get("envelope").get("instance").get("Customer").get("customerId").asInt(),
            "Verifying that the doc was mapped from final to single");
    }
}
