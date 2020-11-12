package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * This test just focuses on some basic queries and mapping support for a simple Customer TDE that only has 3
 * columns - an int, a string, and a date.
 */
public class ReadSimpleCustomersTest extends AbstractSparkReadTest {

    @Test
    void differentSqlConditionsAndPartitionCounts() {
        runAsDataHubDeveloper();
        loadSimpleCustomerTDE();

        runAsDataHubOperator();
        loadTenSimpleCustomers();

        verifyRowCountForSqlCondition(null, 10);
        verifyRowCountForSqlCondition("customerId > 3 and customerId < 7", 3);
        verifyRowCountForSqlCondition("customerId > 11", 0);
    }

    @Test
    void noCustomersExist() {
        runAsDataHubDeveloper();
        loadSimpleCustomerTDE();

        runAsDataHubOperator();
        verifyRowCountForSqlCondition(null, 0);
    }

    @Test
    void noViewProvided() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            new HubDataSourceReader(newOptions().toDataSourceOptions());
        });
        assertEquals("The 'view' option must define a TDE view name from which to retrieve rows", ex.getMessage(),
            "The reader currently requires a TDE view to be specified; this will change in the future when " +
                "additional query inputs are supported");
    }

    private void verifyRowCountForSqlCondition(String sqlCondition, int expectedRowCount) {
        // Use different partition values to ensure they all return the same results.
        // We don't care how many partitions end up being used - that's random, based on the randomly-generated row ID
        // for each row. Just want to make sure we get the correct result regardless of the partition count.
        Stream.of(1, 2, 10).forEach(partitionCount -> {
            Options options = newOptions().withView("Customer").withSqlCondition(sqlCondition);
            HubDataSourceReader dataSourceReader = new HubDataSourceReader(options.toDataSourceOptions(), () -> partitionCount);

            if (expectedRowCount > 0) {
                verifySparkSchema(dataSourceReader);
            }

            List<InternalRow> rows = readRows(dataSourceReader);
            assertEquals(expectedRowCount, rows.size());
            verifySimpleCustomerRows(rows);
        });
    }

    private void verifySparkSchema(HubDataSourceReader hubDataSourceReader) {
        StructType schema = hubDataSourceReader.readSchema();
        assertEquals(3, schema.fields().length);

        StructField field = schema.fields()[0];
        assertEquals("customerId", field.name());
        assertEquals(DataTypes.IntegerType, field.dataType());
        assertFalse(field.nullable());

        field = schema.fields()[1];
        assertEquals("name", field.name());
        assertEquals(DataTypes.StringType, field.dataType());
        assertTrue(field.nullable());

        field = schema.fields()[2];
        assertEquals("customerSince", field.name());
        assertEquals(DataTypes.DateType, field.dataType());
        assertTrue(field.nullable());
    }
}
