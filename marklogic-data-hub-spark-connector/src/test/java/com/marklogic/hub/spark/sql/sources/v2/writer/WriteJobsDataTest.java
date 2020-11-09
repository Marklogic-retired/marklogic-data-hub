package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class WriteJobsDataTest extends AbstractSparkConnectorTest {

    @Test
    void ingestDocsWithJobDoc() {
        initializeDataWriter(newFruitOptions());
        writeRows(buildRow("pineapple", "green"));

        DocumentMetadataHandle metadata = getFirstFruitMetadata();
        String jobId = metadata.getMetadataValues().get("datahubCreatedByJob");
        String jobUri = "/jobs/" + jobId + ".json";
        assertEquals("test-data-hub-operator", metadata.getMetadataValues().get("datahubCreatedBy"));
        assertNotNull(metadata.getMetadataValues().get("datahubCreatedOn"));
        assertNotNull(jobId);

        JsonNode jobDoc = getJobDoc(jobUri);
        assertEquals(jobId, jobDoc.get("job").get("jobId").asText());
        assertEquals("started", jobDoc.get("job").get("jobStatus").asText());
        assertEquals("test-data-hub-operator", jobDoc.get("job").get("user").asText());
        assertNotNull(jobDoc.get("job").get("timeStarted"));
        assertNotNull(jobDoc.get("job").get("externalMetadata"));
        assertNotNull(jobDoc.get("job").get("externalMetadata").get("sparkSchema"));
        assertEquals("struct", jobDoc.get("job").get("externalMetadata").get("sparkSchema").get("type").asText());

        DocumentMetadataHandle jobDocMetaData = getJobMetaData(jobUri);
        assertEquals(2, jobDocMetaData.getCollections().size());
        assertTrue(jobDocMetaData.getCollections().contains("Jobs"));
        assertTrue(jobDocMetaData.getCollections().contains("Job"));

        DocumentMetadataHandle.DocumentPermissions perms = jobDocMetaData.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-job-reader").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-developer-role").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-operator-role").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-job-internal").iterator().next());

        dataSourceWriter.commit(null);

        jobDoc = getJobDoc(jobUri);
        String status = jobDoc.get("job").get("jobStatus").asText();
        if(canUpdateJobDoc()){
            assertEquals("finished", status);
            assertNotNull(jobDoc.get("job").get("timeEnded"));
        }
        else{
            verifyJobDocumentWasNotUpdated(status);
        }
    }

    @Test
    void testDocsWithAdditionalExternalMetadata() {
        ObjectNode additionalExternalMetadata = objectMapper.createObjectNode();
        additionalExternalMetadata.put("jobName", "testJob");
        initializeDataWriter(newFruitOptions().withAdditionalExternalMetadata(additionalExternalMetadata));
        writeRows(buildRow("pineapple", "green"));

        DocumentMetadataHandle metadata = getFirstFruitMetadata();
        String jobId = metadata.getMetadataValues().get("datahubCreatedByJob");
        String jobUri = "/jobs/" + jobId + ".json";
        assertNotNull(jobId);

        JsonNode jobDoc = getJobDoc(jobUri);
        assertEquals(jobId, jobDoc.get("job").get("jobId").asText());
        assertNotNull(jobDoc.get("job").get("externalMetadata"));
        assertNotNull(jobDoc.get("job").get("externalMetadata").get("jobName"));
        assertEquals("testJob", jobDoc.get("job").get("externalMetadata").get("jobName").asText());

    }

    @Test
    void testDocsWithInvalidAdditionalExternalMetadata() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> initializeDataWriter(newFruitOptions().withAdditionalExternalMetadataAsString("testString")),
            "Expected an error because additionalExternalMetadata is a String instead of Json"
        );
        assertTrue(ex.getMessage().contains("Unable to parse additionalExternalMetadata option as a JSON object; cause: Unrecognized token 'testString': " +
            "was expecting (JSON String, Number, Array, Object or token 'null', 'true' or 'false')"));

    }

    private JsonNode getJobDoc(String jobUrl) {
        return getHubClient().getJobsClient().newServerEval()
            .javascript("fn.doc('" + jobUrl + "')")
            .evalAs(JsonNode.class);
    }

    private DocumentMetadataHandle getJobMetaData(String jobUrl) {
        return getHubClient().getJobsClient().newDocumentManager().readMetadata(jobUrl, new DocumentMetadataHandle());
    }

}
