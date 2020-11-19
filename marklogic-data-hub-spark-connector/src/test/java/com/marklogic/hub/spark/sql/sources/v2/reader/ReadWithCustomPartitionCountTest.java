package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class ReadWithCustomPartitionCountTest extends AbstractSparkReadTest {

    /**
     * We can't rely on calling planInputPartitions on HubDataSourceReader because the number of actual partitions is
     * based on random distribution of Optic rowIDs. So instead, this test verifies that the numpartitions input that is
     * sent to the initialize input is correct based on user input.
     */
    @Test
    void test() {
        Options options = newOptions().withView("Customer");

        // Need to construct a reader, can then use it to test that it populates numpartitions correctly
        HubDataSourceReader reader = new HubDataSourceReader(options.toDataSourceOptions());

        ObjectNode inputs = reader.buildInitializeReadInputs(options.withNumPartitions("1").toDataSourceOptions().asMap());
        assertEquals(1, inputs.get("numpartitions").asInt());

        inputs = reader.buildInitializeReadInputs(options.withNumPartitions("720").toDataSourceOptions().asMap());
        assertEquals(720, inputs.get("numpartitions").asInt());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> reader.buildInitializeReadInputs(options.withNumPartitions("0").toDataSourceOptions().asMap()));
        assertEquals("numpartitions must be an integer greater than or equal to 1", ex.getMessage());

        ex = assertThrows(IllegalArgumentException.class,
            () -> reader.buildInitializeReadInputs(options.withNumPartitions("not a number").toDataSourceOptions().asMap()));
        assertEquals("numpartitions must be an integer greater than or equal to 1", ex.getMessage());
    }
}
