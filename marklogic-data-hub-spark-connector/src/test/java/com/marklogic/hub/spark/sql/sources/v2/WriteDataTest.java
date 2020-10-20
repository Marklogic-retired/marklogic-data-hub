package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

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

    @Test
    @Disabled("Error handling needs to be reworked based on Java Client 5.3")
    void invalidPermissionsString() {
        DataWriter<InternalRow> writer = buildDataWriter(newFruitOptions().withPermissions("rest-reader,read,rest-writer"));
        RuntimeException ex = assertThrows(RuntimeException.class, () -> writer.write(buildRow("apple", "red")));
        assertTrue(ex.getCause() instanceof FailedRequestException, "The Bulk Java client wraps the actual exception in a RuntimeException");
        assertTrue(ex.getCause().getMessage().contains("Unable to parse permissions: rest-reader,read,rest-writer"), "Unexpected error message: " + ex.getCause().getMessage());
    }

    @Test
    public void testEndpointsAreLoaded() throws Exception {
        runAsAdmin().getModulesClient().newTextDocumentManager().delete(
            "/marklogic-data-hub-spark-connector/bulkIngester.api",
            "/marklogic-data-hub-spark-connector/bulkIngester.sjs");

        runAsDataHubOperator();
        DataWriter<InternalRow> dataWriter = buildDataWriter(new Options(getHubPropertiesAsMap()).withBatchSize(3).withUriPrefix("/testFruit"));
        dataWriter.write(buildRow("apple", "red"));
        dataWriter.commit();

        verifyFruitCount(1, "Verifying the data was written");
        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/bulkIngester.api");
        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/bulkIngester.sjs");
    }

    private void verifyModuleWasLoadedByConnector(String path) {
        GenericDocumentManager mgr = getHubClient().getModulesClient().newDocumentManager();
        assertNotNull(mgr.exists(path), "Expected module to be loaded by connector: " + path);

        DocumentMetadataHandle metadata = mgr.readMetadata(path, new DocumentMetadataHandle());
        assertTrue(metadata.getCollections().contains("hub-core-module"), "The module should be in this collection so that when a " +
            "user clears user modules, these modules are not deleted. They're not really user modules because they're " +
            "not from the user's project.");

        DocumentMetadataHandle.DocumentPermissions perms = metadata.getPermissions();
        // Verify module has default DHF module permissions
        assertTrue(perms.get("data-hub-module-reader").contains(DocumentMetadataHandle.Capability.READ));
        assertTrue(perms.get("data-hub-module-reader").contains(DocumentMetadataHandle.Capability.EXECUTE));
        assertTrue(perms.get("data-hub-module-writer").contains(DocumentMetadataHandle.Capability.UPDATE));
        assertTrue(perms.get("rest-extension-user").contains(DocumentMetadataHandle.Capability.EXECUTE));


    }

    private void verifyFruitCount(int expectedCount, String message) {
        String query = "cts.uriMatch('/testFruit**').toArray().length";
        String count = getHubClient().getStagingClient().newServerEval().javascript(query).evalAs(String.class);
        assertEquals(expectedCount, Integer.parseInt(count), message);

        // Assumes both apple and banana were written
        if (expectedCount > 1) {
            final String fruitQuery = "cts.search(cts.jsonPropertyValueQuery('fruitName', '%s'))";
            ObjectNode apple = readJsonObject(getHubClient().getStagingClient().newServerEval().javascript(format(fruitQuery, "apple")).evalAs(String.class));
            assertEquals("apple", apple.get("envelope").get("instance").get("fruitName").asText());
            ObjectNode banana = readJsonObject(getHubClient().getStagingClient().newServerEval().javascript(format(fruitQuery, "banana")).evalAs(String.class));
            assertEquals("banana", banana.get("envelope").get("instance").get("fruitName").asText());
        }
    }
}
