package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.FileHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class WriteDataViaCustomEndpointTest extends AbstractSparkConnectorTest {

    @Test
    void test() throws IOException {
        givenACustomIngestionEndpoint();
        whenARowIsWrittenUsingTheCustomEndpoint();
        thenTheExpectedDocumentExists();
    }

    private void givenACustomIngestionEndpoint() throws IOException {
        GenericDocumentManager mgr = getHubClient().getModulesClient().newDocumentManager();
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE, DocumentMetadataHandle.Capability.EXECUTE);

        mgr.write("/custom-ingestion-endpoint/endpoint.api", metadata,
            new FileHandle(new ClassPathResource("custom-ingestion-endpoint/endpoint.api").getFile()).withFormat(Format.JSON));
        mgr.write("/custom-ingestion-endpoint/endpoint.sjs", metadata,
            new FileHandle(new ClassPathResource("custom-ingestion-endpoint/endpoint.sjs").getFile()).withFormat(Format.TEXT));
    }

    private void whenARowIsWrittenUsingTheCustomEndpoint() throws IOException {
        ObjectNode customWorkUnit = objectMapper.createObjectNode();
        customWorkUnit.put("someString", "value");
        customWorkUnit.put("someNumber", 123);
        ObjectNode customEndpointState = objectMapper.createObjectNode();
        customEndpointState.put("someState", "hello world");

        DataWriter<InternalRow> dataWriter = buildDataWriter(new Options(getHubPropertiesAsMap())
            .withIngestApiPath("/custom-ingestion-endpoint/endpoint.api")
            .withIngestWorkUnit(customWorkUnit)
            .withIngestEndpointState(customEndpointState));

        dataWriter.write(buildRow("apple", "red"));
        dataWriter.commit();
    }

    private void thenTheExpectedDocumentExists() {
        JsonNode doc = getHubClient().getStagingClient().newJSONDocumentManager().read("/test/doc.json", new JacksonHandle()).get();

        final String message = "Did not find expected data in doc: " + doc.toString();

        assertEquals("apple", doc.get("input").get("fruitName").asText(), message);
        assertEquals("red", doc.get("input").get("fruitColor").asText(), message);

        assertEquals("value", doc.get("workUnit").get("someString").asText(), message);
        assertEquals(123, doc.get("workUnit").get("someNumber").asInt(), message);
        assertEquals("hello world", doc.get("endpointState").get("someState").asText(), message);
    }
}
