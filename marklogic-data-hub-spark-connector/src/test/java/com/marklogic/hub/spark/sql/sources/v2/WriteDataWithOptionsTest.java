package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class WriteDataWithOptionsTest extends AbstractSparkConnectorTest {

    @Test
    void ingestDocsWithCollection() throws IOException {
        String collections = "fruits,stuff";
        DataWriter<InternalRow> dataWriter = buildDataWriter(newFruitOptions().withCollections(collections));
        dataWriter.write(buildRow("pineapple", "green"));

        DocumentMetadataHandle metadata = getFirstFruitMetadata();
        assertEquals(2, metadata.getCollections().size());
        assertTrue(metadata.getCollections().contains("fruits"));
        assertTrue(metadata.getCollections().contains("stuff"));

        // Verify default permissions
        DocumentMetadataHandle.DocumentPermissions perms = getFirstFruitMetadata().getPermissions();
        Set<DocumentMetadataHandle.Capability> capabilities = perms.get("data-hub-operator");
        assertTrue(capabilities.contains(DocumentMetadataHandle.Capability.READ));
        assertTrue(capabilities.contains(DocumentMetadataHandle.Capability.UPDATE));
    }

    @Test
    void ingestDocsWithSourceName() throws IOException {
        String sourceName = "spark";
        DataWriter<InternalRow> dataWriter = buildDataWriter(newFruitOptions().withSourceName(sourceName));
        dataWriter.write(buildRow("pineapple", "green"));

        JsonNode doc = getHubClient().getStagingClient().newJSONDocumentManager().read(getFruitUris()[0], new JacksonHandle()).get();
        assertEquals(sourceName, doc.get("envelope").get("headers").get("sources").get(0).get("name").asText());
    }

    @Test
    void ingestDocsWithSourceType() throws IOException {
        String sourceType = "fruits";
        DataWriter<InternalRow> dataWriter = buildDataWriter(newFruitOptions().withSourceType(sourceType));
        dataWriter.write(buildRow("pineapple", "green"));

        JsonNode doc = getHubClient().getStagingClient().newJSONDocumentManager().read(getFruitUris()[0], new JacksonHandle()).get();
        assertEquals(sourceType, doc.get("envelope").get("headers").get("sources").get(0).get("datahubSourceType").asText());
    }

    @Test
    void ingestDocsWithPermissions() throws IOException {
        String permissions = "rest-extension-user,read,rest-reader,update";
        DataWriter<InternalRow> dataWriter = buildDataWriter(newFruitOptions().withPermissions(permissions));
        dataWriter.write(buildRow("pineapple", "green"));

        DocumentMetadataHandle.DocumentPermissions perms = getFirstFruitMetadata().getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("rest-extension-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("rest-reader").iterator().next());
    }

}
