package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.eval.EvalResultIterator;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.writer.DataSourceWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

public class WriteDataTest extends AbstractSparkConnectorTest {

    @Test
    void ingestThreeFruitsWithBatchSizeOfTwo() throws IOException {
        DataWriter<InternalRow> dataWriter = buildDataWriter(new Options(getHubPropertiesAsMap()).withBatchSize(2).withUriPrefix("/testFruit"));

        verifyFruitCount(0, "Shouldn't have any fruits ingested yet");

        dataWriter.write(buildRow("apple", "red"));
        verifyFruitCount(0, "Still shouldn't have any fruits ingested yet because batchSize is 2");

        dataWriter.write(buildRow("banana", "yellow"));
        verifyFruitCount(2, "Since batchSize is 2 and 2 records have been written, they should have been ingested into ML");

        dataWriter.write(buildRow("canteloupe", "melon"));
        verifyFruitCount(2, "Should still be at 2 since batchSize is 2 and only 1 has been written since last ingest");

        dataWriter.commit();
        verifyFruitCount(3, "The commit call should result in the 3rd fruit being ingested");
    }

    @Test
    public void ingestWithoutCustomApiWithCustomWorkunit() {
        ObjectNode customWorkUnit = objectMapper.createObjectNode();
        customWorkUnit.put("userDefinedValue", 0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> buildDataWriter(new Options(getHubPropertiesAsMap()).withIngestWorkUnit(customWorkUnit)),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        assertEquals("Cannot set workUnit or endpointState in ingestionendpointparams unless apiPath is defined as well.", ex.getMessage());
    }

    @Test
    public void ingestWithIncorrectApi(){
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
            () -> buildDataWriter(new Options(getHubPropertiesAsMap()).withIngestApiPath("/incorrect.api")),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        System.out.println(ex.getMessage());
        assertTrue( ex.getMessage().contains("Could not read non-existent document."));
    }

    @Test
    public void ingestWithEmptyApiWithCustomWorkUnit() {
        ObjectNode customWorkUnit = objectMapper.createObjectNode();
        customWorkUnit.put("userDefinedValue", 0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> buildDataWriter(new Options(getHubPropertiesAsMap()).withIngestApiPath("").withIngestWorkUnit(customWorkUnit)),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        assertEquals("Cannot set workUnit or endpointState in ingestionendpointparams unless apiPath is defined as well.", ex.getMessage());
    }

    @Test
    public void ingestWithEmptyApiWithCustomEndpointState() {
        ObjectNode  customEndpointState= objectMapper.createObjectNode();
        customEndpointState.put("userDefinedValue", 0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> buildDataWriter(new Options(getHubPropertiesAsMap()).withIngestApiPath("").withIngestEndpointState(customEndpointState)),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        assertEquals("Cannot set workUnit or endpointState in ingestionendpointparams unless apiPath is defined as well.", ex.getMessage());
    }

    @Test
    void nullWorkUnitNoApiPath() {
        Map<String, String> params = new HashMap<>();
        params.putAll(getHubPropertiesAsMap());

        ObjectNode node = objectMapper.createObjectNode();
        node.set("endpointState", null);
        params.put("ingestendpointparams", node.toString());

        buildDataWriter(new DataSourceOptions(params));
        logger.info("No exception should have occurred because a null workUnit doesn't mean that Ernie tried to " +
            "set a workUnit without an apiPath");
    }

    @Test
    void nullEndpointStateNoApiPath() {
        Map<String, String> params = new HashMap<>();
        params.putAll(getHubPropertiesAsMap());

        ObjectNode node = objectMapper.createObjectNode();
        node.set("endpointState", null);
        params.put("ingestendpointparams", node.toString());

        buildDataWriter(new DataSourceOptions(params));
        logger.info("No exception should have occurred because a null endpointState doesn't mean that Ernie tried to " +
            "set an endpointState without an apiPath");
    }

    @Test
    void invalidJsonForIngestionParams() {
        Map<String, String> params = new HashMap<>();
        params.putAll(getHubPropertiesAsMap());

        final String invalidJson = "{\"workUnit\":{}";
        params.put("ingestendpointparams", invalidJson);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> buildDataWriter(new DataSourceOptions(params)));
        assertTrue(ex.getMessage().contains("Unable to parse ingestendpointparams"), "Unexpected error message: " + ex.getMessage());
    }

    private void verifyFruitCount(int expectedCount, String message) {
        String query = "cts.uriMatch('/testFruit**').toArray().length";
        String count = getHubClient().getStagingClient().newServerEval().javascript(query).evalAs(String.class);
        assertEquals(expectedCount, Integer.parseInt(count), message);

        if (expectedCount > 0) {
        String uriQuery = "cts.uris('', null, cts.andQuery([\n" +
            "  cts.directoryQuery('/'),\n" +
            "  cts.jsonPropertyValueQuery('fruitName', 'apple')\n" +
            "]))";

        EvalResultIterator uriQueryResult = getHubClient().getStagingClient().newServerEval().javascript(uriQuery).eval();
        assertTrue(uriQueryResult.hasNext());
        assertTrue(uriQueryResult.next().getString().startsWith("/testFruit"));
        assertFalse(uriQueryResult.hasNext());

        uriQuery = "cts.uris('', null, cts.andQuery([\n" +
            "  cts.directoryQuery('/'),\n" +
            "  cts.jsonPropertyValueQuery('fruitName', 'banana')\n" +
            "]))";

        uriQueryResult = getHubClient().getStagingClient().newServerEval().javascript(uriQuery).eval();
        assertTrue(uriQueryResult.hasNext());
        assertTrue(uriQueryResult.next().getString().startsWith("/testFruit"));
        assertFalse(uriQueryResult.hasNext());
        }
    }
}
