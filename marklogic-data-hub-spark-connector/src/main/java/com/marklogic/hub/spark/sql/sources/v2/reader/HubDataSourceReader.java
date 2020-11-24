package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
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
import java.util.stream.Stream;

/**
 * Responsible for calling the initialization endpoint which allows it to know how many input partitions to
 * build and what schema to use.
 */
public class HubDataSourceReader extends LoggingObject implements DataSourceReader {

    private final Map<String, String> options;
    private final JsonNode initializationResponse;
    private final StructType sparkSchema;

    /**
     * The current default for partition count is based on the active SparkSession. The PartitionCountProvider is used
     * to allow for JUnit tests to specify a custom partition count and not depend on a SparkSession being available.
     *
     * @param dataSourceOptions
     */
    public HubDataSourceReader(DataSourceOptions dataSourceOptions) {
        logger.debug("Created: " + toString());

        this.options = dataSourceOptions.asMap();
        validateOptions(this.options);

        this.initializationResponse = initializeRead(this.options);
        this.sparkSchema = (StructType) StructType.fromJson(initializationResponse.get("sparkSchema").toString());
    }

    /**
     * @param options
     */
    private void validateOptions(Map<String, String> options) {
        if (options.containsKey("serializedplan")) {
            Stream.of("view", "schema", "sqlcondition", "selectedcolumns").forEach(key -> {
                if (options.containsKey(key)) {
                    throw new IllegalArgumentException(format("The '%s' option may not be specified when 'serializedplan' is also specified", key));
                }
            });
            return;
        }

        if (!options.containsKey("view")) {
            throw new RuntimeException("The 'view' option must define a TDE view name from which to retrieve rows");
        }
    }

    /**
     * @param options
     * @return
     */
    private JsonNode initializeRead(Map<String, String> options) {
        ObjectNode inputs = buildInitializeReadInputs(options);
        try {
            return SparkService.on(
                HubClient.withHubClientConfig(Util.buildHubClientConfig(options)).getFinalClient()
            ).initializeRead(inputs);
        } catch (FailedRequestException ex) {
            throw new RuntimeException("Unable to initialize read, cause: " + ex.getMessage(), ex);
        }

    }

    /**
     * Protected so that it can be unit-tested.
     *
     * @param options
     * @return
     */
    protected ObjectNode buildInitializeReadInputs(Map<String, String> options) {
        ObjectNode inputs = new ObjectMapper().createObjectNode();

        // The same all-lowercase style is used here for consistency with Spark, even though it's not consistent with
        // DHF code conventions
        Stream.of("view", "schema", "sqlcondition", "selectedcolumns", "sparkschema").forEach(key -> inputs.put(key, options.get(key)));
        inputs.put("numpartitions", determineNumPartitions(options));

        if (options.containsKey("serializedplan")) {
            try {
                inputs.set("serializedPlan", new ObjectMapper().readTree(options.get("serializedplan")));
            } catch (Exception ex) {
                throw new IllegalArgumentException("Unable to read serializedplan as a JSON object; cause: " + ex.getMessage(), ex);
            }
        }

        return inputs;
    }

    /**
     * @param options
     * @return
     */
    private int determineNumPartitions(Map<String, String> options) {
        int numPartitions;
        if (options.containsKey("numpartitions")) {
            try {
                numPartitions = Integer.parseInt(options.get("numpartitions"));
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("numpartitions must be an integer greater than or equal to 1");
            }
        } else {
            numPartitions = SparkSession.active().sparkContext().defaultMinPartitions();
        }
        if (numPartitions < 1) {
            throw new IllegalArgumentException("numpartitions must be an integer greater than or equal to 1");
        }
        return numPartitions;
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
        return sparkSchema;
    }
}

