package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class WriteDataWithOptionsTest extends AbstractSparkConnectorTest {

    @Test
    void ingestDocsWithCollection() {
        String collections = "fruits,stuff";
        initializeDataWriter(newFruitOptions().withCollections(collections));
        writeRows(buildRow("pineapple", "green"));

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
    void ingestDocsWithSourceName() {
        String sourceName = "spark";
        initializeDataWriter(newFruitOptions().withSourceName(sourceName));
        writeRows(buildRow("pineapple", "green"));

        JsonNode doc = getHubClient().getStagingClient().newJSONDocumentManager().read(getFruitUris()[0], new JacksonHandle()).get();
        JsonNode sources = doc.get("envelope").get("headers").get("sources");
        assertEquals(1, sources.size(), "Expecting one source");
        assertEquals(sourceName, sources.get(0).get("datahubSourceName").asText());
        assertFalse(sources.get(0).has("name"), "Starting in 5.4.0 DHF, datahubSourceName is the right field for " +
            "capturing a user-provided source name");
    }

    @Test
    void ingestDocsWithSourceType() {
        String sourceType = "fruits";
        initializeDataWriter(newFruitOptions().withSourceType(sourceType));
        writeRows(buildRow("pineapple", "green"));

        JsonNode doc = getHubClient().getStagingClient().newJSONDocumentManager().read(getFruitUris()[0], new JacksonHandle()).get();
        assertEquals(sourceType, doc.get("envelope").get("headers").get("sources").get(0).get("datahubSourceType").asText());
    }

    @Test
    void ingestDocsWithPermissions() {
        String permissions = "rest-extension-user,read,rest-reader,update";
        initializeDataWriter(newFruitOptions().withPermissions(permissions));
        writeRows(buildRow("pineapple", "green"));

        DocumentMetadataHandle.DocumentPermissions perms = getFirstFruitMetadata().getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("rest-extension-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("rest-reader").iterator().next());
    }

}
