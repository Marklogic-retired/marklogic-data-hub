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
import org.apache.spark.sql.Row;
import org.apache.spark.sql.RowFactory;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.encoders.RowEncoder;
import org.apache.spark.sql.sources.v2.reader.InputPartitionReader;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;

import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;

/**
 * Does all the work of using a BulkOutputCaller to repeatedly fetch rows for a given partition.
 */
public class HubInputPartitionReader extends LoggingObject implements InputPartitionReader<InternalRow> {

    private final HubClient hubClient;
    private final ObjectMapper objectMapper;
    private final OutputCaller.BulkOutputCaller<InputStream> bulkOutputCaller;
    private final StructType schema;

    private InputStream[] rows;
    private int rowIndex;
    private JsonNode currentRow;
    private long numberOfRowsRead;

    /**
     * @param options   options provided by the Spark user; needed to both connect to ML and to query for data
     * @param partition the set of row IDs that constrain this reader's queries
     * @param schema    needed in order to use RowEncoder to construct InternalRow objects
     */
    public HubInputPartitionReader(Map<String, String> options, JsonNode partition, StructType schema) {
        this.hubClient = HubClient.withHubClientConfig(Util.buildHubClientConfig(options));
        this.schema = schema;
        this.objectMapper = new ObjectMapper();

        ObjectNode endpointConstants = buildEndpointConstants(options, partition);
        ObjectNode endpointState = objectMapper.createObjectNode();
        endpointState.put("batchNumber", 1);
        this.bulkOutputCaller = buildOutputCaller(endpointConstants, endpointState);
    }

    @Override
    public boolean next() throws IOException {
        if (rows == null || rowIndex >= rows.length) {
            readNextBatchOfRows();
        }

        if (rows == null || rows.length == 0) {
            logger.info("Finished reading rows");
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
        Object[] values = Arrays.stream(schema.fields()).map(field -> {
            String fieldName = field.name();
            if (currentRow.has(fieldName) && !"null".equals(currentRow.get(fieldName).asText())) {
                return readValue(field);
            }
            return null;
        }).toArray();

        Row row = RowFactory.create(values);
        return RowEncoder.apply(this.schema).toRow(row);
    }

    @Override
    public void close() {
        logger.debug("Closing");
    }

    private ObjectNode buildEndpointConstants(Map<String, String> options, JsonNode partition) {
        ObjectNode endpointConstants = objectMapper.createObjectNode();
        endpointConstants.set("partition", partition);
        endpointConstants.put("view", options.get("view"));
        endpointConstants.put("schema", options.get("schema"));
        endpointConstants.put("sqlCondition", options.get("sqlcondition"));

        try {
            endpointConstants.set("sparkSchema", objectMapper.readTree(schema.json()));
        } catch (Exception ex) {
            throw new RuntimeException("Unable to write StructType as JSON; cause: " + ex.getMessage(), ex);
        }

        return endpointConstants;
    }

    private OutputCaller.BulkOutputCaller<InputStream> buildOutputCaller(ObjectNode endpointConstants, ObjectNode endpointState) {
        InputStreamHandle defaultApi = hubClient.getModulesClient().newJSONDocumentManager()
            .read("/marklogic-data-hub-spark-connector/findRowsForPartitionBatch.api", new InputStreamHandle());

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

    /**
     * Just doing the bare minimum here for now, will have lots more to support soon.
     *
     * @param field
     * @return
     */
    private Object readValue(StructField field) {
        final String fieldName = field.name();
        Object value;
        switch (field.dataType().typeName()) {
            case "integer":
                value = currentRow.get(fieldName).asInt();
                break;
            case "date":
                value = parseDate(fieldName, currentRow.get(fieldName).asText());
                break;
            default:
                value = currentRow.get(fieldName).asText();
                break;
        }
        return value;
    }

    /**
     * Spark doesn't allow for java.util.Date as a type; java.sql.Date must be used instead. This also assumes that
     * the date value is stored as an XSD date - e.g. yyyy-MM-dd format.
     *
     * @param fieldName
     * @param dateValue
     * @return
     */
    private java.sql.Date parseDate(String fieldName, String dateValue) {
        try {
            Date date = new SimpleDateFormat("yyyy-MM-dd").parse(dateValue);
            return new java.sql.Date(date.getTime());
        } catch (ParseException ex) {
            logger.warn(format("Unexpected date format for field '%s' and value '%s'; cause: %s",
                fieldName, dateValue, ex.getMessage()));
        }
        return null;
    }

}
