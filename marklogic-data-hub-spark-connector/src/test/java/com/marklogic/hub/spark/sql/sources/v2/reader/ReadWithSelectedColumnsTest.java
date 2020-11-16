package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.catalyst.InternalRow;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ReadWithSelectedColumnsTest extends AbstractSparkReadTest {

    /**
     * Using one test method so the setup only has to be done once.
     */
    @Test
    void test() {
        runAsDataHubDeveloper();
        loadSimpleCustomerTDE();

        runAsDataHubOperator();
        loadTenSimpleCustomers();

        verifyTwoColumnsSelected();
        verifyOneColumnSelected();
        verifyInvalidColumnName();
    }

    private void verifyTwoColumnsSelected() {
        readRows("customerId,name").forEach(row -> {
            assertEquals(2, row.numFields());
            int customerId = row.getInt(0);
            assertEquals("Customer" + customerId, row.getString(1));
        });
    }

    private void verifyOneColumnSelected() {
        readRows("customerId").forEach(row -> {
            assertEquals(1, row.numFields());
            assertTrue(row.getInt(0) > -1, "Just verifying we get an integer customerId back");
        });
    }

    private void verifyInvalidColumnName() {
        RuntimeException ex = assertThrows(RuntimeException.class, () -> readRows("customerId,unrecognizedColumn"));
        assertTrue(ex.getMessage().startsWith("Unable to initialize read"));
        assertTrue(ex.getMessage().contains("Unable to get row count for partition, which may be due to invalid user input; cause: Column not found"),
            "Expected message about a column not being found. Unfortunately the ML error doesn't specify which column is not found. Message: " + ex.getMessage());
    }

    private List<InternalRow> readRows(String selectedColumns) {
        Options options = newOptions().withView("Customer")
            .withSelectedColumns(selectedColumns)
            .withSqlCondition("customerId < 3");
        HubDataSourceReader dataSourceReader = new HubDataSourceReader(options.toDataSourceOptions(), () -> 2);

        List<InternalRow> rows = readRows(dataSourceReader);
        assertEquals(3, rows.size(), "Expecting 3 rows due to the SQL condition");
        return rows;
    }
}
