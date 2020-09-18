package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.JacksonHandle;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.expressions.GenericInternalRow;
import org.apache.spark.sql.sources.v2.DataSourceOptions;
import org.apache.spark.sql.sources.v2.writer.DataSourceWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.sources.v2.writer.DataWriterFactory;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.Metadata;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.apache.spark.unsafe.types.UTF8String;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class WriteDataTest extends AbstractSparkConnectorTest {

    private final static StructType SCHEMA = new StructType(new StructField[]{
        new StructField("fruitName", DataTypes.StringType, true, Metadata.empty()),
        new StructField("fruitColor", DataTypes.StringType, true, Metadata.empty()),
    });

    @Test
    void ingestThreeFruitsWithBatchSizeOfTwo() throws IOException {
        DataWriter<InternalRow> dataWriter = buildDataWriter("2", "/testFruit");

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

    /**
     * Spark will do all of this in the real world - i.e. a user will specify the entry class and the set of options.
     * But in a test, we need to do that ourselves. So we create the DataSource class, build up the params, and then
     * call the factory/writer methods ourselves.
     *
     * @param batchSize
     * @param uriPrefix
     * @return
     */
    private DataWriter<InternalRow> buildDataWriter(String batchSize, String uriPrefix) {
        HubDataSource dataSource = new HubDataSource();
        final String writeUUID = "doesntMatter";
        final SaveMode saveModeDoesntMatter = SaveMode.Overwrite;

        // Get the set of DHF properties used to connect to ML as a map, and then add connector-specific params
        Map<String, String> params = getHubPropertiesAsMap();
        params.put("batchsize", batchSize);
        params.put("prefix", uriPrefix);
        DataSourceOptions options = new DataSourceOptions(params);

        Optional<DataSourceWriter> dataSourceWriter = dataSource.createWriter(writeUUID, SCHEMA, saveModeDoesntMatter, options);
        DataWriterFactory<InternalRow> dataWriterFactory = dataSourceWriter.get().createWriterFactory();

        final int partitionIdDoesntMatter = 0;
        final long taskId = 2;
        final int epochIdDoesntMatter = 0;
        return dataWriterFactory.createDataWriter(partitionIdDoesntMatter, taskId, epochIdDoesntMatter);
    }

    private GenericInternalRow buildRow(String... values) {
        Object[] rowValues = new Object[values.length];
        for (int i = 0; i < values.length; i++) {
            rowValues[i] = UTF8String.fromString(values[i]);
        }
        return new GenericInternalRow(rowValues);
    }

    private void verifyFruitCount(int expectedCount, String message) {
        String query = "cts.uriMatch('/testFruit/**').toArray().length";
        String count = getHubClient().getStagingClient().newServerEval().javascript(query).evalAs(String.class);
        assertEquals(expectedCount, Integer.parseInt(count), message);

        if (expectedCount > 0) {
            String expectedUri = "/testFruit/2/1.json";
            JsonNode doc = getHubClient().getStagingClient().newJSONDocumentManager().read(expectedUri, new JacksonHandle()).get();
            assertEquals("apple", doc.get("envelope").get("instance").get("fruitName").asText());
            assertEquals("red", doc.get("envelope").get("instance").get("fruitColor").asText());
        }
    }
}
