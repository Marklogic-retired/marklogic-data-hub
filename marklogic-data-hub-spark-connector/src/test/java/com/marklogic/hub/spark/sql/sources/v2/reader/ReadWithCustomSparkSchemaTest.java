package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.Metadata;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import static org.junit.jupiter.api.Assumptions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.OS;
import scala.collection.immutable.HashMap;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ReadWithCustomSparkSchemaTest extends AbstractSparkReadTest {


    @Test
    void validCustomSparkSchema() {
        MarkLogicVersion version = new MarkLogicVersion(getHubClient().getManageClient());
        assumeTrue(OS.LINUX.isCurrentOs() || (version.getMajor() >= 10 &&
            version.isNightly()), "Running this test on Windows and mac used to result in SEGFAULT when trying to get" +
            " partition's row count. The server bug https://bugtrack.marklogic.com/55743 is fixed so the test should run" +
            " fine on any version > 10.0-5 on Linux and on 10.0-nightly in other platforms.");
        setupTenSimpleCustomers();

        Options options = newOptions()
            .withSparkSchema(buildCustomSparkSchema())
            .withSerializedPlan(buildSerializedPlanThatMatchesCustomSparkSchema());

        verifyRowsConfirmToCustomSparkSchema(options);
    }

    @Test
    void invalidJsonForSparkSchema() {
        Options options = newOptions()
            .withSparkSchema("not-valid-json")
            .withSerializedPlan(buildSerializedPlanThatMatchesCustomSparkSchema());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> readRows(options));
        assertTrue(ex.getMessage().contains("Unable to initialize read"));
        assertTrue(ex.getMessage().contains("Unable to read 'sparkschema' input as JSON"),
            "Expecting the error message from the ML endpoint to identify the exact reason why initialization failed");
    }

    private String buildCustomSparkSchema() {
        Metadata metadata = new Metadata(new HashMap<>());
        return new StructType(new StructField[]{
            new StructField("myName", DataTypes.StringType, false, metadata),
            new StructField("myId", DataTypes.IntegerType, false, metadata)
        }).json();
    }

    private String buildSerializedPlanThatMatchesCustomSparkSchema() {
        return getHubClient().getFinalClient().newServerEval().javascript("const op = require('/MarkLogic/optic');\n" +
            "op.fromView(null, 'Customer', '')\n" +
            "  .select([\n" +
            "    op.as('myName', op.col('name')),\n" +
            "    op.as('myId', op.col('customerId'))\n" +
            "  ])\n" +
            "  .export()").evalAs(String.class);
    }

    private void verifyRowsConfirmToCustomSparkSchema(Options options) {
        List<InternalRow> rows = readRows(new HubDataSourceReader(options.toDataSourceOptions()));
        assertEquals(10, rows.size());
        for (InternalRow row : rows) {
            int customerId = row.getInt(1);
            assertEquals("Customer" + customerId, row.getString(0),
                "Per the custom schema, 'myName' is expected to be the first column and 'myId' is second");
        }
    }
}
