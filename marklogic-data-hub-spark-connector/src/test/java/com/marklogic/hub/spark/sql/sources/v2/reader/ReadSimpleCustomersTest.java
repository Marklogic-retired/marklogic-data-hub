package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.reader.InputPartition;
import org.apache.spark.sql.sources.v2.reader.InputPartitionReader;
import org.apache.spark.sql.types.DataTypes;
import org.apache.spark.sql.types.StructField;
import org.apache.spark.sql.types.StructType;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

/**
 * This test just focuses on some basic queries and mapping support for a simple Customer TDE that only has 3
 * columns - an int, a string, and a date.
 */
public class ReadSimpleCustomersTest extends AbstractSparkConnectorTest {

    @Test
    void differentSqlConditionsAndPartitionCounts() {
        runAsDataHubDeveloper();
        loadTde();

        runAsDataHubOperator();
        loadTenCustomers();

        verifyRowCountForSqlCondition(null, 10);
        verifyRowCountForSqlCondition("customerId > 3 and customerId < 7", 3);
        verifyRowCountForSqlCondition("customerId > 11", 0);
    }

    @Test
    void noCustomersExist() {
        runAsDataHubDeveloper();
        loadTde();

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
            verifySparkSchema(dataSourceReader);

            List<InternalRow> rows = readRows(dataSourceReader);
            assertEquals(expectedRowCount, rows.size());
            verifyCustomerRows(rows);
        });
    }

    private void loadTenCustomers() {
        ReferenceModelProject project = new ReferenceModelProject(getHubClient());
        for (int i = 0; i <= 9; i++) {
            Customer c = new Customer(i, "Customer" + i);
            c.setCustomerSince("2020-01-1" + i);
            project.createCustomerInstance(c);
        }
    }

    // TODO Will soon have a nice convenience method for doing this
    private void loadTde() {
        String template;
        try {
            template = new String(FileCopyUtils.copyToByteArray(readInputStreamFromClasspath("tde-views/Customer.tdex")));
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        String query = "var template; xdmp.invokeFunction(function() {declareUpdate(); xdmp.documentInsert('/tde/Customer-0.0.1.tdex', template, " +
            "[xdmp.permission('data-hub-operator', 'read'), xdmp.permission('data-hub-operator', 'update')], " +
            "'http://marklogic.com/xdmp/tde')}, {'database':xdmp.database('data-hub-final-SCHEMAS')});";
        getHubClient().getFinalClient().newServerEval()
            .javascript(query).addVariable("template", new StringHandle(template).withFormat(Format.XML)).evalAs(String.class);
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

    private List<InternalRow> readRows(HubDataSourceReader dataSourceReader) {
        List<InternalRow> rows = new ArrayList<>();

        List<InputPartition<InternalRow>> inputPartitions = dataSourceReader.planInputPartitions();

        for (InputPartition<InternalRow> inputPartition : inputPartitions) {
            try (InputPartitionReader<InternalRow> reader = inputPartition.createPartitionReader()) {
                while (reader.next()) {
                    rows.add(reader.get());
                }
            } catch (IOException ex) {
                throw new RuntimeException(ex);
            }
        }

        return rows;
    }

    private void verifyCustomerRows(List<InternalRow> rows) {
        final int firstDateValueAsInt = 18271;
        for (InternalRow row : rows) {
            int customerId = row.getInt(0);
            assertEquals("Customer" + customerId, row.getString(1));
            assertEquals(firstDateValueAsInt + customerId, row.get(2, DataTypes.DateType),
                "2020-01-10 as a java.sql.Date is 18271, so the value of 'customerSince' is expected to be relative to that");
        }
    }
}
