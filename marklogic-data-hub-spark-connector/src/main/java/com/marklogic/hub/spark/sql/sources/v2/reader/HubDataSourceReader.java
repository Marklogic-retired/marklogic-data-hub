package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.spark.dataservices.SparkService;
import com.marklogic.hub.spark.sql.sources.v2.Util;
import org.apache.spark.sql.SparkSession;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.reader.DataSourceReader;
import org.apache.spark.sql.sources.v2.reader.InputPartition;
import org.apache.spark.sql.types.StructType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Responsible for calling the initialization endpoint which allows it to know how many input partitions to
 * build and what schema to use.
 */
public class HubDataSourceReader extends LoggingObject implements DataSourceReader {

    private final Map<String, String> options;
    private final JsonNode initializationResponse;
    private final StructType schema;

    /**
     * The current default for partition count is based on the active SparkSession. The PartitionCountProvider is used
     * to allow for JUnit tests to specify a custom partition count and not depend on a SparkSession being available.
     *
     * @param dataSourceOptions
     */
    public HubDataSourceReader(DataSourceOptions dataSourceOptions) {
        this(dataSourceOptions, () -> SparkSession.active().sparkContext().defaultMinPartitions());
    }

    public HubDataSourceReader(DataSourceOptions dataSourceOptions, PartitionCountProvider partitionCountProvider) {
        logger.debug("Created: " + toString());

        this.options = dataSourceOptions.asMap();

        if (!options.containsKey("view")) {
            throw new RuntimeException("The 'view' option must define a TDE view name from which to retrieve rows");
        }

        this.initializationResponse = initializeRead(partitionCountProvider);
        this.schema = (StructType) StructType.fromJson(initializationResponse.get("schema").toString());
    }

    private JsonNode initializeRead(PartitionCountProvider partitionCountProvider) {
        ObjectNode inputs = new ObjectMapper().createObjectNode();
        inputs.put("view", options.get("view"));
        inputs.put("schema", options.get("schema"));
        inputs.put("sqlCondition", options.get("sqlcondition"));
        inputs.put("partitionCount", partitionCountProvider.getPartitionCount());

        HubClient hubClient = HubClient.withHubClientConfig(Util.buildHubClientConfig(options));
        return SparkService.on(hubClient.getFinalClient()).initializeRead(inputs);
    }

    @Override
    public List<InputPartition<InternalRow>> planInputPartitions() {
        List<InputPartition<InternalRow>> inputPartitions = new ArrayList<>();
        int partitionCount = initializationResponse.get("partitions").size();
        logger.info("Input partition count: " + partitionCount);
        for (int i = 0; i < partitionCount; i++) {
            inputPartitions.add(new HubInputPartition(this.options, initializationResponse, i));
        }
        return inputPartitions;
    }

    @Override
    public StructType readSchema() {
        return schema;
    }
}

