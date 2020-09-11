package com.marklogic.hub.cloud.aws.glue;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.cloud.aws.glue.Writer.MarkLogicDataWriterFactory;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.writer.DataWriter;
import org.apache.spark.sql.types.StructType;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Map;

public class WriteDataTest extends AbstractGlueConnectorTest {

    /**
     * First cut at a test that passes a HubClient to MarkLogicDataWriter and writes some rows, then verifies the
     * results.
     */
    @Test
    @Disabled("Have to figure out how to run a SparkContext first")
    void test() throws IOException {
        StructType schema = null; // TODO Set this to something for the test

        // Get the set of DHF properties used to connect to ML as a map, and then add connector-specific params
        Map<String, String> params = getHubPropertiesAsMap();
        params.put("batchsize", "10");
        params.put("apipath", "TODO");
        params.put("prefixvalue", "TODO");

        MarkLogicDataWriterFactory factory = new MarkLogicDataWriterFactory(params, schema);
        DataWriter<InternalRow> writer = factory.createDataWriter(1, 1, 1);
        InternalRow row1 = null; // TODO Set this to something
        InternalRow row2 = null; // TODO Set this to something
        writer.write(row1);
        writer.write(row2);

        DatabaseClient stagingClient = getHubClient().getStagingClient();
        // TODO Verify that the results were written to the staging database correctly
    }

}
