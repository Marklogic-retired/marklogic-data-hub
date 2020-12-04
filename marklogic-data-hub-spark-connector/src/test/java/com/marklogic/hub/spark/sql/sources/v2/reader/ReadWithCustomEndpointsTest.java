package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.catalyst.InternalRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class ReadWithCustomEndpointsTest extends AbstractSparkReadTest {

    @BeforeEach
    void setup() {
        installCustomEndpoint("custom-read-endpoints/initializeRead.api", "custom-read-endpoints/initializeRead.sjs");
        installCustomEndpoint("custom-read-endpoints/customReadRows.api", "custom-read-endpoints/customReadRows.sjs");
    }

    @Test
    void test() {
        ObjectNode endpointState = objectMapper.createObjectNode();
        ObjectNode testRow = endpointState.putObject("testRow");
        testRow.put("myId", 12345);
        testRow.put("myName", "This is a test row");

        Options options = newOptions()
            .withInitializeReadApiPath("/custom-read-endpoints/initializeRead.api")
            .withReadRowsApiPath("/custom-read-endpoints/customReadRows.api")
            .withReadRowsEndpointState(endpointState);

        List<InternalRow> rows = readRows(new HubDataSourceReader(options.toDataSourceOptions()));
        assertEquals(1, rows.size(), "Expecting a single row back, which should be the testRow in endpointState. And the " +
            "row is expected to conform to the static schema defined in our custom initializeRead.sjs endpoint.");
        InternalRow row = rows.get(0);
        assertEquals(12345, row.getInt(1));
        assertEquals("This is a test row", row.getString(0));
    }

    @Test
    public void testHasEndpointStateWithoutApiPath() {
        ObjectNode readrowsendpointparams = objectMapper.createObjectNode();
        readrowsendpointparams.put("endpointState", "testValue");
        Options options = newOptions().withView("Customer").withReadRowsEndpointparams(readrowsendpointparams);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> new HubDataSourceReader(options.toDataSourceOptions()));
        assertEquals("Cannot set endpointState in readrowsendpointparams option unless apiPath is defined as well.",
            ex.getMessage());
    }

    @Test
    public void testHasEndpointConstants() {
        ObjectNode readrowsendpointparams = objectMapper.createObjectNode();
        readrowsendpointparams.put("endpointConstants", "testValue");
        Options options = newOptions().withView("Customer").withReadRowsEndpointparams(readrowsendpointparams);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> new HubDataSourceReader(options.toDataSourceOptions()));
        assertEquals("Cannot set endpointConstants in readrowsendpointparams option; can only set apiPath and endpointState.",
            ex.getMessage());
    }
}
