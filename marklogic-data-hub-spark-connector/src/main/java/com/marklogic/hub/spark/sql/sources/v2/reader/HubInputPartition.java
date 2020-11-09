package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.reader.InputPartition;
import org.apache.spark.sql.sources.v2.reader.InputPartitionReader;
import org.apache.spark.sql.types.StructType;

import java.util.Map;

/**
 * Simple factory class for creating a HubInputPartitionReader based on the inputs to this class's constructor.
 */
public class HubInputPartition implements InputPartition<InternalRow> {

    private Map<String, String> options;
    private JsonNode initializeResponse;
    private int partitionNumber;

    public HubInputPartition(Map<String, String> options, JsonNode initializeResponse, int partitionNumber) {
        this.options = options;
        this.initializeResponse = initializeResponse;
        this.partitionNumber = partitionNumber;
    }

    @Override
    public InputPartitionReader<InternalRow> createPartitionReader() {
        return new HubInputPartitionReader(options, initializeResponse, partitionNumber);
    }
}
