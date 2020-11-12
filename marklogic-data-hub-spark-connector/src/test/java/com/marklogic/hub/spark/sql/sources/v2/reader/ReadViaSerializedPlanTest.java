package com.marklogic.hub.spark.sql.sources.v2.reader;

import org.apache.spark.sql.catalyst.InternalRow;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ReadViaSerializedPlanTest extends AbstractSparkReadTest {

    @Test
    void customerIdLessThanFive() {
        runAsDataHubDeveloper();
        loadSimpleCustomerTDE();

        runAsDataHubOperator();
        loadTenSimpleCustomers();

        List<InternalRow> rows = readRows(newOptions()
            .withSerializedPlan(getCustomerIdLessThanFivePlan()));
        assertEquals(5, rows.size());
        verifySimpleCustomerRows(rows);
    }

    @Test
    void groupAndOrderByCustomerId() {
        runAsDataHubDeveloper();
        loadSimpleCustomerTDE();

        runAsDataHubOperator();
        loadTenSimpleCustomers();

        List<InternalRow> rows = readRows(newOptions()
            .withSerializedPlan(readStringFromClasspath("serialized-plans/GroupAndOrderByCustomerId.json")));
        assertEquals(2, rows.size(), "The plan is expected to constrain on customerId < 2");

        assertEquals(0, rows.get(0).getInt(0), "Expected customerId of zero");
        assertEquals(3, rows.get(0).numFields(), "Although Ernie's plan only returns one column, the Spark schema is " +
            "still being built on the 3 columns in the TDE view. Thus, 3 columns are still returned, but with null as " +
            "the value for columns 1 and 2. This will likely be improved in the near future so that the user can " +
            "specify the Spark schema to use.");
        assertEquals(1, rows.get(1).getInt(0), "Expected customerId of one");
        assertEquals(3, rows.get(1).numFields());
    }

    @Test
    void invalidJSONInSerializedPlan() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            readRows(newOptions().withSerializedPlan("this-is-not-valid-json")));
        assertTrue(ex.getMessage().startsWith("Unable to read serializedplan as a JSON object"),
            "Unexpected error message: " + ex.getMessage());
    }

    @Test
    void invalidOpticPlan() {
        RuntimeException ex = assertThrows(RuntimeException.class, () ->
            readRows(newOptions().withSerializedPlan("{\"hello\":\"world\"}")));
        assertTrue(ex.getMessage().startsWith("Unable to initialize read, cause: "),
            "Unexpected error message: " + ex.getMessage());
    }

    @Test
    void serializedPlanAndView() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            readRows(newOptions()
                .withSerializedPlan(getCustomerIdLessThanFivePlan())
                .withView("Customer")
            ));
        assertEquals("The 'view' option may not be specified when 'serializedplan' is also specified", ex.getMessage());
    }

    @Test
    void serializedPlanAndSchema() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            readRows(newOptions()
                .withSerializedPlan(getCustomerIdLessThanFivePlan())
                .withSchema("Customer")
            ));
        assertEquals("The 'schema' option may not be specified when 'serializedplan' is also specified", ex.getMessage());
    }

    @Test
    void serializedPlanAndSqlCondition() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
            readRows(newOptions()
                .withSerializedPlan(getCustomerIdLessThanFivePlan())
                .withSqlCondition("customerId < 10")
            ));
        assertEquals("The 'sqlcondition' option may not be specified when 'serializedplan' is also specified", ex.getMessage());
    }

    private String getCustomerIdLessThanFivePlan() {
        return readStringFromClasspath("serialized-plans/CustomerIdLessThanFive.json");
    }
}
