package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.dataservices.OutputCaller;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.spark.sql.sources.v2.Util;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.reader.InputPartitionReader;
import org.apache.spark.sql.types.StructType;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * Uses a BulkOutputCaller to fetch rows for a given partition. Each JSON row is then converted into an InternalRow.
 */
public class HubInputPartitionReader extends LoggingObject implements InputPartitionReader<InternalRow> {

    private final HubClient hubClient;
    private final ObjectMapper objectMapper;
    private final OutputCaller.BulkOutputCaller<InputStream> bulkOutputCaller;
    private final JsonRowParser jsonRowParser;

    private InputStream[] rows;
    private int rowIndex;
    private JsonNode currentRow;
    private long numberOfRowsRead;

    /**
     * @param options                options provided by the Spark user; needed to both connect to ML and to query for data
     * @param initializationResponse
     * @param partitionNumber
     */
    public HubInputPartitionReader(Map<String, String> options, JsonNode initializationResponse, int partitionNumber) {
        this.hubClient = HubClient.withHubClientConfig(Util.buildHubClientConfig(options));
        this.objectMapper = new ObjectMapper();

        StructType sparkSchema = (StructType) StructType.fromJson(initializationResponse.get("sparkSchema").toString());
        this.jsonRowParser = new JsonRowParser(sparkSchema);

        ObjectNode endpointConstants = buildEndpointConstants(initializationResponse, partitionNumber);
        ObjectNode endpointState = objectMapper.createObjectNode();
        endpointState.put("batchNumber", 1);
        this.bulkOutputCaller = buildOutputCaller(endpointConstants, endpointState);
    }

    /**
     * If this reader's rows array is null or empty, then call the endpoint to read the next batch of rows. If no
     * rows are returned, then this returns false, as the endpoint is indicating it has found no more matching rows.
     *
     * @return
     * @throws IOException
     */
    @Override
    public boolean next() throws IOException {
        if (rows == null || rowIndex >= rows.length) {
            readNextBatchOfRows();
        }

        if (rows == null || rows.length == 0) {
            // Somehow, this log statement is showing up twice when the connector is used in a test program. Given that
            // this is returning false, but then somehow Spark is calling this method again, this seems like an issue
            // with Spark. The only cost is that an extra call is made to the endpoint, which is almost certainly going
            // to return zero rows again.
            logger.debug("Finished reading rows");
            return false;
        }

        this.currentRow = objectMapper.readTree(rows[rowIndex++]);
        return true;
    }

    /**
     * Convert the most recently read JSON object into an InternalRow.
     *
     * @return
     */
    @Override
    public InternalRow get() {
        return jsonRowParser.parseJsonRow(currentRow.toString()).head();
    }

    @Override
    public void close() {
        logger.debug("Closing");
    }

    private ObjectNode buildEndpointConstants(JsonNode initializationResponse, int partitionNumber) {
        ObjectNode endpointConstants = objectMapper.createObjectNode();
        endpointConstants.set("initializationResponse", initializationResponse);
        endpointConstants.put("partitionNumber", partitionNumber);
        return endpointConstants;
    }

    private OutputCaller.BulkOutputCaller<InputStream> buildOutputCaller(ObjectNode endpointConstants, ObjectNode endpointState) {
        InputStreamHandle defaultApi = hubClient.getModulesClient().newJSONDocumentManager()
            .read("/marklogic-data-hub-spark-connector/readRows.api", new InputStreamHandle());

        OutputCaller<InputStream> outputCaller = OutputCaller.on(hubClient.getFinalClient(), defaultApi, new InputStreamHandle());

        return outputCaller.bulkCaller(outputCaller.newCallContext()
            .withEndpointConstants(new JacksonHandle(endpointConstants))
            .withEndpointState(new JacksonHandle(endpointState)));
    }

    private void readNextBatchOfRows() {
        this.rows = bulkOutputCaller.next();
        if (rows.length > 0) {
            numberOfRowsRead += rows.length;
            if (logger.isDebugEnabled()) {
                logger.debug("Rows read so far: " + numberOfRowsRead);
            }
            rowIndex = 0;
        }
    }
}
