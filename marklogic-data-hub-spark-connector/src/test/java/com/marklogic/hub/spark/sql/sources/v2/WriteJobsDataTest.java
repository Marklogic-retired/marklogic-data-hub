package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.DocumentMetadataHandle;
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
        assertEquals("finished", jobDoc.get("job").get("jobStatus").asText());
        assertNotNull(jobDoc.get("job").get("timeEnded"));

    }

    @Test
    void testDocsWithAdditionalExternalMetadata() {
        ObjectNode externalMetadata = objectMapper.createObjectNode();
        externalMetadata.put("jobName", "testJob");
        initializeDataWriter(newFruitOptions().withExternalMetadata(externalMetadata));
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

    private JsonNode getJobDoc(String jobUrl) {
        return getHubClient().getJobsClient().newServerEval()
            .javascript("fn.doc('" + jobUrl + "')")
            .evalAs(JsonNode.class);
    }

    private DocumentMetadataHandle getJobMetaData(String jobUrl) {
        return getHubClient().getJobsClient().newDocumentManager().readMetadata(jobUrl, new DocumentMetadataHandle());
    }

}
