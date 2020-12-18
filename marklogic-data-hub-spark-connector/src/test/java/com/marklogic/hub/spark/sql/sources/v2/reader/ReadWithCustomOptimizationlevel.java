package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.hub.spark.sql.sources.v2.Options;
import org.apache.spark.sql.catalyst.InternalRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ReadWithCustomOptimizationlevel extends AbstractSparkReadTest {

    @BeforeEach
    public void setUp() {
        runAsDataHubDeveloper();
        loadSimpleCustomerTDE();

        runAsDataHubOperator();
        loadTenSimpleCustomers();
    }

    @Test
    public void testStringOptimizationlevel() {
        setUp();
        Options options = newOptions().withView("Customer").withStringOptimizationlevel("2");
        List<InternalRow> rows = readRows(new HubDataSourceReader(options.toDataSourceOptions()));
        assertEquals(10, rows.size(), "All 10 rows could not be read.");
    }

    @Test
    public void testIntegerOptimizationlevel() {
        setUp();
        Options options = newOptions().withView("Customer").withIntegerOptimizationlevel(2);
        List<InternalRow> rows = readRows(new HubDataSourceReader(options.toDataSourceOptions()));
        assertEquals(10, rows.size(), "All 10 rows could not be read.");
    }

    @Test
    public void testInvalidOptimizationlevel() {
        setUp();
        Options options = newOptions().withView("Customer").withIntegerOptimizationlevel(6);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> readRows(new HubDataSourceReader(options.toDataSourceOptions())));
        assertEquals("optimizationlevel needs to be 0,1 or 2",
            ex.getMessage());

        Options newOptions = newOptions().withView("Customer").withIntegerOptimizationlevel(-1);
        ex = assertThrows(IllegalArgumentException.class,
            () -> readRows(new HubDataSourceReader(newOptions.toDataSourceOptions())));
        assertEquals("optimizationlevel needs to be 0,1 or 2",
            ex.getMessage());
    }

    @Test
    public void testDecimalOptimizationlevel() {
        setUp();
        Options options = newOptions().withView("Customer").withStringOptimizationlevel("1.5");
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> readRows(new HubDataSourceReader(options.toDataSourceOptions())));
        assertEquals("optimizationlevel needs to be 0,1 or 2",
            ex.getMessage());
    }
}
