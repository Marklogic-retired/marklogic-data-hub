package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeType;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class WriteDataViaCustomEndpointTest extends AbstractSparkConnectorTest {

    private JsonNode writtenDocument;

    @BeforeEach
    void beforeEach() {
        installCustomIngestionEndpoint();
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
        initializeDataWriter(new Options(getHubPropertiesAsMap())
            .withIngestApiPath(CUSTOM_INGESTION_API_PATH)
            .withWriteRecordsEndpointConstants(customEndpointConstants)
            .withWriteRecordsEndpointState(customEndpointState));

        try {
            writeRows(buildRow("apple", "red"));

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
