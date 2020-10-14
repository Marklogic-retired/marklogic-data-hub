package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import org.apache.avro.data.Json;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class WriteJobsDataTest extends AbstractSparkConnectorTest {

    @Test
    void ingestDocsWithJobDoc() throws IOException {
        DataWriter<InternalRow> dataWriter = buildDataWriter(newFruitOptions());
        dataWriter.write(buildRow("pineapple", "green"));

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
        assertNotNull(jobDoc.get("job").get("sparkMetadata"));
        assertNotNull(jobDoc.get("job").get("sparkMetadata").get("schema"));
        assertEquals("struct", jobDoc.get("job").get("sparkMetadata").get("schema").get("type").asText());

        DocumentMetadataHandle jobDocMetaData = getJobMetaData(jobUri);
        assertEquals(2, jobDocMetaData.getCollections().size());
        assertTrue(jobDocMetaData.getCollections().contains("Jobs"));
        assertTrue(jobDocMetaData.getCollections().contains("Job"));

        DocumentMetadataHandle.DocumentPermissions perms = jobDocMetaData.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-job-reader").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-developer-role").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("flow-operator-role").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-job-internal").iterator().next());

        dataSourceWriter.get().commit(null);

        jobDoc = getJobDoc(jobUri);
        assertEquals("finished", jobDoc.get("job").get("jobStatus").asText());
        assertNotNull(jobDoc.get("job").get("timeEnded"));

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
