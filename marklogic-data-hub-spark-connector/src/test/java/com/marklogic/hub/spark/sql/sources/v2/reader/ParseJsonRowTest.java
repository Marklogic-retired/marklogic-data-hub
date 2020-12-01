package com.marklogic.hub.spark.sql.sources.v2.reader;

import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.Metadata;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ParseJsonRowTest {

    /**
     * Verifies that the RowJsonParser class is correctly using Scala's JacksonParser class outside the context of
     * reading Optic rows.
     */
    @Test
    void test() {
        Metadata metadata = new Metadata();
        StructType sparkSchema = new StructType(new StructField[]{
            new StructField("customerId", DataTypes.IntegerType, false, metadata),
            new StructField("myStrings", DataTypes.createArrayType(DataTypes.StringType), true, metadata)
        });

        String json = "{ \"customerId\": 123, \"myStrings\": [\"hello\", \"world\"] }";

        InternalRow row = new JsonRowParser(sparkSchema).parseJsonRow(json).head();

        assertEquals(123, row.getInt(0));
        List<Object> strings = Arrays.asList(row.getArray(1).toObjectArray(DataTypes.StringType));
        assertEquals(2, strings.size());
        assertEquals("hello", strings.get(0).toString());
        assertEquals("world", strings.get(1).toString());
    }

}
