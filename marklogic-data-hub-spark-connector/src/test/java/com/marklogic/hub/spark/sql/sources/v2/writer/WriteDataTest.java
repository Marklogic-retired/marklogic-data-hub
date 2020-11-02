package com.marklogic.hub.spark.sql.sources.v2.writer;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.writer.WriterCommitMessage;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class WriteDataTest extends AbstractSparkConnectorTest {

    @Test
    public void ingestWithoutCustomApiWithCustomEndpointConstants() {
        ObjectNode customEndpointConstants = objectMapper.createObjectNode();
        customEndpointConstants.put("userDefinedValue", 0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> initializeDataWriter(new Options(getHubPropertiesAsMap()).withWriteRecordsEndpointConstants(customEndpointConstants)),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        assertEquals("Cannot set endpointConstants or endpointState in writerecordsendpointparams unless apiPath is defined as well.", ex.getMessage());
    }

    @Test
    public void ingestWithIncorrectApi() {
        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
            () -> initializeDataWriter(new Options(getHubPropertiesAsMap()).withIngestApiPath("/incorrect.api")),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        System.out.println(ex.getMessage());
        assertTrue(ex.getMessage().contains("Could not read non-existent document."));
    }

    @Test
    public void ingestWithEmptyApiWithCustomEndpointConstants() {
        ObjectNode customEndpointConstants = objectMapper.createObjectNode();
        customEndpointConstants.put("userDefinedValue", 0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> initializeDataWriter(new Options(getHubPropertiesAsMap()).withIngestApiPath("").withWriteRecordsEndpointConstants(customEndpointConstants)),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        assertEquals("Cannot set endpointConstants or endpointState in writerecordsendpointparams unless apiPath is defined as well.", ex.getMessage());
    }

    @Test
    public void ingestWithEmptyApiWithCustomEndpointState() {
        ObjectNode customEndpointState = objectMapper.createObjectNode();
        customEndpointState.put("userDefinedValue", 0);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> initializeDataWriter(new Options(getHubPropertiesAsMap()).withIngestApiPath("").withWriteRecordsEndpointState(customEndpointState)),
            "Expected an error because a custom work unit was provided without a custom API path"
        );
        assertEquals("Cannot set endpointConstants or endpointState in writerecordsendpointparams unless apiPath is defined as well.", ex.getMessage());
    }

    @Test
    void nullEndpointConstantsNoApiPath() {
        Map<String, String> params = new HashMap<>();
        params.putAll(getHubPropertiesAsMap());

        ObjectNode node = objectMapper.createObjectNode();
        node.set("endpointState", null);
        params.put("writerecordsendpointparams", node.toString());

        initializeDataWriter(new DataSourceOptions(params));
        logger.info("No exception should have occurred because a null endpointConstant doesn't mean that Ernie tried to " +
            "set an endpointConstant without an apiPath");
    }

    @Test
    void nullEndpointStateNoApiPath() {
        Map<String, String> params = new HashMap<>();
        params.putAll(getHubPropertiesAsMap());

        ObjectNode node = objectMapper.createObjectNode();
        node.set("endpointState", null);
        params.put("writerecordsendpointparams", node.toString());

        initializeDataWriter(new DataSourceOptions(params));
        logger.info("No exception should have occurred because a null endpointState doesn't mean that Ernie tried to " +
            "set an endpointState without an apiPath");
    }

    @Test
    void invalidJsonForIngestionParams() {
        Map<String, String> params = new HashMap<>();
        params.putAll(getHubPropertiesAsMap());

        final String invalidJson = "{\"endpointConstants\":{}";
        params.put("writerecordsendpointparams", invalidJson);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> initializeDataWriter(new DataSourceOptions(params)));
        assertTrue(ex.getMessage().contains("Unable to parse writerecordsendpointparams"), "Unexpected error message: " + ex.getMessage());
    }

    @Test
    void invalidPermissionsString() {
        initializeDataWriter(newFruitOptions().withPermissions("rest-reader,read,rest-writer"));
        WriterCommitMessage message = writeRows(buildRow("apple", "red"), buildRow("apple2", "also red"));
        assertTrue(message instanceof AtLeastOneWriteFailedMessage);
        assertEquals(0, getFruitCount(), "No records should have been written since the permissions are invalid; " +
            "rest-writer is missing a capability. TODO We may want to enhance this so that this failure occurs " +
            "before the job document is written, though we'd likely need to verify that each role name is correct " +
            "as well, not just that the string is formatted correctly.");
    }

    @Test
    public void testEndpointsAreLoaded() {
        runAsAdmin().getModulesClient().newTextDocumentManager().delete(
            "/marklogic-data-hub-spark-connector/writeLib.sjs",
            "/marklogic-data-hub-spark-connector/writeRecords.api",
            "/marklogic-data-hub-spark-connector/writeRecords.sjs",
            "/marklogic-data-hub-spark-connector/initializeWrite.api",
            "/marklogic-data-hub-spark-connector/initializeWrite.sjs",
            "/marklogic-data-hub-spark-connector/finalizeWrite.api",
            "/marklogic-data-hub-spark-connector/finalizeWrite.sjs");


        runAsDataHubOperator();
        initializeDataWriter(new Options(getHubPropertiesAsMap()).withUriPrefix("/testFruit"));
        writeRows(buildRow("apple", "red"));

        verifyFruitCount(1, "Verifying the data was written");
        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/writeRecords.api");
        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/writeRecords.sjs");
        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/initializeWrite.api");
        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/initializeWrite.sjs");

        dataSourceWriter.commit(null);

        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/finalizeWrite.api");
        verifyModuleWasLoadedByConnector("/marklogic-data-hub-spark-connector/finalizeWrite.sjs");
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
