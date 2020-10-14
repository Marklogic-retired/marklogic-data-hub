package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeType;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class WriteDataViaCustomEndpointTest extends AbstractSparkConnectorTest {

    private JsonNode writtenDocument;

    @BeforeEach
    void installCustomEndpoint() throws IOException {
        GenericDocumentManager mgr = getHubClient().getModulesClient().newDocumentManager();
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE, DocumentMetadataHandle.Capability.EXECUTE);

        mgr.write("/custom-ingestion-endpoint/endpoint.api", metadata,
            new FileHandle(new ClassPathResource("custom-ingestion-endpoint/endpoint.api").getFile()).withFormat(Format.JSON));
        mgr.write("/custom-ingestion-endpoint/endpoint.sjs", metadata,
            new FileHandle(new ClassPathResource("custom-ingestion-endpoint/endpoint.sjs").getFile()).withFormat(Format.TEXT));
    }

    @Test
    void customEndpointStateAndEndpointConstants() {
        ObjectNode endpointConstants = objectMapper.createObjectNode();
        endpointConstants.put("someString", "value");
        endpointConstants.put("someNumber", 123);

        ObjectNode endpointState = objectMapper.createObjectNode();
        endpointState.put("someState", "hello world");

        writeRowUsingCustomEndpoint(endpointConstants, endpointState);

        // Verify custom constants and state data were added to document
        assertEquals("value", writtenDocument.get("myEndpointConstants").get("someString").asText());
        assertEquals(123, writtenDocument.get("myEndpointConstants").get("someNumber").asInt());
        assertEquals("hello world", writtenDocument.get("myEndpointState").get("someState").asText());
    }

    @Test
    void customEndpointNoEndpointStateAndNoEndpointConstants() {
        writeRowUsingCustomEndpoint(null, null);

        verifyEndpointConstantsIsEmpty();
        assertTrue(writtenDocument.has("myEndpointState"), "myEndpointState should exist, but it should be null since " +
            "we didn't pass anything to the endpoint");
        assertEquals(JsonNodeType.NULL, writtenDocument.get("myEndpointState").getNodeType());
    }

    @Test
    void customEndpointWithEndpointStateAndNoEndpointConstants() {
        ObjectNode customEndpointState = objectMapper.createObjectNode();
        customEndpointState.put("someState", "hello world");

        writeRowUsingCustomEndpoint(null, customEndpointState);

        verifyEndpointConstantsIsEmpty();
        assertEquals("hello world", writtenDocument.get("myEndpointState").get("someState").asText());
    }

    private void writeRowUsingCustomEndpoint(ObjectNode customEndpointConstants, ObjectNode customEndpointState) {
        DataWriter<InternalRow> dataWriter = buildDataWriter(new Options(getHubPropertiesAsMap())
            .withIngestApiPath("/custom-ingestion-endpoint/endpoint.api")
            .withIngestEndpointConstants(customEndpointConstants)
            .withIngestEndpointState(customEndpointState));

        try {
            dataWriter.write(buildRow("apple", "red"));
            dataWriter.commit();

        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }

        loadDocumentAndVerifyInputData();
    }

    private void loadDocumentAndVerifyInputData() {
        writtenDocument = getHubClient().getStagingClient().newJSONDocumentManager().read("/test/doc.json", new JacksonHandle()).get();
        assertEquals("apple", writtenDocument.get("input").get("fruitName").asText());
        assertEquals("red", writtenDocument.get("input").get("fruitColor").asText());
    }

    private void verifyEndpointConstantsIsEmpty() {
        assertEquals(1, writtenDocument.get("myEndpointConstants").size(),
            "When the user provides empty ingestion endpointConstants, the jobId is still added to them so that it's " +
                "available for the ingestion endpoint");
        assertNotNull(writtenDocument.get("myEndpointConstants").get("jobId").asText());
    }
}
