package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.util.ArrayData;
import org.apache.spark.sql.catalyst.util.MapData;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.Metadata;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.OS;
import scala.collection.immutable.HashMap;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

public class ReadArraysAndMapsTest extends AbstractSparkReadTest {

    // When building a Spark schema to be used, a Metadata object is needed; an empty one suffices for these tests
    private Metadata emptySchemaMetadata = new Metadata(new HashMap<>());

    @BeforeEach
    void setup() {
        runAsDataHubDeveloper();
        loadSimpleCustomerTDE();
        runAsDataHubOperator();
    }

    @Test
    void arrayOfStrings() {
        assumeTrue(OS.LINUX.isCurrentOs(), "Running this test on Windows and mac result in SEGFAULT when trying to get partition's row count\n" +
            "       (readLib.sjs's getRowCountForPartition() method. Once server bug https://bugtrack.marklogic.com/55743\n" +
            "       is fixed, the test should run fine on all platforms.");
        loadSimpleCustomers(1);

        StructType sparkSchema = new StructType(new StructField[]{
            new StructField("customerId", DataTypes.IntegerType, false, emptySchemaMetadata),
            new StructField("myStrings", DataTypes.createArrayType(DataTypes.StringType), true, emptySchemaMetadata)
        });

        Options options = newOptions()
            .withSerializedPlan(buildPlanForArrayOfStrings())
            .withSparkSchema(sparkSchema.json());

        List<InternalRow> rows = readRows(options);
        assertEquals(1, rows.size());
        assertEquals(0, rows.get(0).getInt(0));
        Object[] strings = rows.get(0).getArray(1).toObjectArray(DataTypes.StringType);
        assertEquals("hello", strings[0].toString(), "The type of the string is a UTF8String, so need to call " +
            "toString on it to get the actual value");
        assertEquals("Customer0", strings[1].toString());
    }

    @Test
    void mapOfIntegers() {
        loadSimpleCustomers(2);

        StructType sparkSchema = new StructType(new StructField[]{
            new StructField("myObject", DataTypes.createMapType(DataTypes.StringType, DataTypes.IntegerType), true, emptySchemaMetadata)
        });

        Options options = newOptions()
            .withSerializedPlan(buildPlanForObjectOfStringsAndIntegers())
            .withSparkSchema(sparkSchema.json());

        List<InternalRow> rows = readRows(options);
        assertEquals(1, rows.size(), "Expecting a single row containing myObject");
        MapData mapData = rows.get(0).getMap(0);
        Object[] keys = mapData.keyArray().toObjectArray(DataTypes.StringType);
        assertEquals("customerIdCount", keys[0].toString());
        assertEquals("otherCustomerIdCount", keys[1].toString());
        Object[] values = mapData.valueArray().toObjectArray(DataTypes.IntegerType);
        assertEquals(2, values[0]);
        assertEquals(2, values[1]);
    }

    @Test
    void arrayOfObjects() {
        loadSimpleCustomers(3);

        StructType sparkSchema = new StructType(new StructField[]{
            new StructField("customerId", DataTypes.IntegerType, false, emptySchemaMetadata),
            new StructField("myArrayOfObjects", DataTypes.createArrayType(
                DataTypes.createMapType(DataTypes.StringType, DataTypes.StringType)
            ), true, emptySchemaMetadata)
        });

        Options options = newOptions()
            .withSerializedPlan(buildPlanForArrayOfObjects())
            .withSparkSchema(sparkSchema.json());

        List<InternalRow> rows = readRows(options);
        assertEquals(3, rows.size(), "Expecting one row for each customer since customerId is one of the columns being selected");

        for (InternalRow row : rows) {
            ArrayData array = row.getArray(1);
            MapData mapData = array.getMap(0);
            Object[] keys = mapData.keyArray().toObjectArray(DataTypes.StringType);
            assertEquals("hello", keys[0].toString());
            assertEquals("and", keys[1].toString());
            Object[] values = mapData.valueArray().toObjectArray(DataTypes.StringType);
            assertEquals("world", values[0].toString());
            assertEquals("hello again", values[1].toString());
        }

    }

    private String buildPlanForArrayOfStrings() {
        return exportQueryToPlan("const op = require('/MarkLogic/optic');\n" +
            "op.fromView(null, 'Customer', '')\n" +
            "  .select(['customerId', \n" +
            "    op.as('myStrings', op.jsonArray([\n" +
            "      op.jsonString('hello'),\n" +
            "      op.col('name')\n" +
            "    ]))\n" +
            "  ])\n" +
            "  .export()");
    }

    private String buildPlanForObjectOfStringsAndIntegers() {
        return exportQueryToPlan("const op = require('/MarkLogic/optic');\n" +
            "op.fromView(null, 'Customer', '')\n" +
            "  .groupBy(null, op.count('customerIdCount'))\n" +
            "  .select([\n" +
            "    op.as('myObject', op.jsonObject([\n" +
            "      op.prop('customerIdCount', op.col('customerIdCount')),\n" +
            "      op.prop('otherCustomerIdCount', op.col('customerIdCount'))\n" +
            "    ]))\n" +
            "  ])\n" +
            "  .export()");
    }


    private String buildPlanForArrayOfObjects() {
        return exportQueryToPlan("const op = require('/MarkLogic/optic');\n" +
            "op.fromView(null, 'Customer', '')\n" +
            "  .groupBy('customerId', op.count('customerIdCount'))\n" +
            "  .select(['customerId',\n" +
            "    op.as('myArrayOfObjects', op.jsonArray([\n" +
            "      op.jsonObject([\n" +
            "        op.prop('hello', 'world'),\n" +
            "        op.prop('and', 'hello again'),\n" +
            "      ])\n" +
            "    ]))\n" +
            "  ])\n" +
            "  .export()");
    }

    private String exportQueryToPlan(String query) {
        return getHubClient().getFinalClient().newServerEval().javascript(query).evalAs(String.class);
    }
}
