package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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
        String jobId = runFlow(new FlowInputs(flowName)).getJobId();

        JsonNode rawDoc = getFinalDoc("/customers/customer1.json");
        assertEquals("1", rawDoc.get("envelope").get("instance").get("CustomerID").asText(),
            "Verifying that the single doc was ingested into the final database");
        verifyMetadataOnIngestedDoc(jobId);

        JsonNode mappedDoc = getStagingDoc("/customers/customer1.json");
        assertEquals(1, mappedDoc.get("envelope").get("instance").get("Customer").get("customerId").asInt(),
            "Verifying that the doc was mapped from final to single");
    }

    /**
     * Adding assertions for document metadata, as there are none anywhere else in the JUnit tests for running a flow.
     *
     * @param jobId
     */
    private void verifyMetadataOnIngestedDoc(String jobId) {
        DocumentMetadataHandle h = getHubClient().getFinalClient().newDocumentManager().readMetadata("/customers/customer1.json",
            new DocumentMetadataHandle());

        DocumentMetadataHandle.DocumentMetadataValues metadata = h.getMetadataValues();
        assertEquals(getHubConfig().getMlUsername(), metadata.get("datahubCreatedBy"));
        assertEquals("ingest", metadata.get("datahubCreatedByStep"),
            "Per DHFPROD-5380, this is now correctly set to the step name instead of the step definition name");
        assertEquals("ingestToFinal", metadata.get("datahubCreatedInFlow"));
        assertEquals(jobId, metadata.get("datahubCreatedByJob"));
        assertTrue(StringUtils.isNotEmpty(metadata.get("datahubCreatedOn")),
            "This actually represents the last updated time, and not when the document was created");
    }
}
