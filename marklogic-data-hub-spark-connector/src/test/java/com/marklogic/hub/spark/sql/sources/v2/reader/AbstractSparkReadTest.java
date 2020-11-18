package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.spark.sql.sources.v2.AbstractSparkConnectorTest;
import com.marklogic.hub.spark.sql.sources.v2.Options;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.sources.v2.reader.InputPartition;
import org.apache.spark.sql.sources.v2.reader.InputPartitionReader;
import org.apache.spark.sql.types.DataTypes;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

abstract class AbstractSparkReadTest extends AbstractSparkConnectorTest {

    @BeforeEach
    void verifyMarkLogicSupportsRowID() {
        MarkLogicVersion version = new MarkLogicVersion(getHubClient().getManageClient());
        Assumptions.assumeTrue(version.isNightly() ||
            version.getMajor() > 10 || (version.getMajor() == 10 && version.getMinor() >= 500),
            "The Read capability depends on rowID support in Optic, which was added to ML in 10.0-5; version: "
                + version.getVersionString()
        );
    }

    // TODO Will soon have a nice convenience method for doing this
    protected void loadSimpleCustomerTDE() {
        String template;
        try {
            template = new String(FileCopyUtils.copyToByteArray(readInputStreamFromClasspath("tde-views/Customer.tdex")));
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
        String query = "declareUpdate(); var tde = require('/MarkLogic/tde.xqy'); var template; " +
            "tde.templateInsert('/tde/Customer-0.0.1.tdex', template, " +
            "[xdmp.permission('data-hub-operator', 'read'), xdmp.permission('data-hub-operator', 'update')]);";
        getHubClient().getFinalClient().newServerEval()
            .javascript(query).addVariable("template", new StringHandle(template).withFormat(Format.XML)).evalAs(String.class);
    }

    protected void loadTenSimpleCustomers() {
        ReferenceModelProject project = new ReferenceModelProject(getHubClient());

        // Gotta use data-hub-operator so that these tests can pass on 5.2.x
        project.setCustomerDocumentMetadata(new DocumentMetadataHandle()
            .withCollections(ReferenceModelProject.CUSTOMER_ENTITY_TYPE)
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE));

        for (int i = 0; i <= 9; i++) {
            Customer c = new Customer(i, "Customer" + i);
            c.setCustomerSince("2020-01-1" + i);
            project.createCustomerInstance(c);
        }
    }

    protected List<InternalRow> readRows(Options options) {
        // Uses a single partition count for reliable ordering of results when an orderBy is used
        HubDataSourceReader dataSourceReader = new HubDataSourceReader(options.toDataSourceOptions(), () -> 1);
        return readRows(dataSourceReader);
    }

    protected List<InternalRow> readRows(HubDataSourceReader dataSourceReader) {
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

    /**
     * Can be used to verify customer rows loaded via loadTenSimpleCustomers.
     *
     * @param rows
     */
    protected void verifySimpleCustomerRows(List<InternalRow> rows) {
        final int firstDateValueAsInt = 18271;
        for (InternalRow row : rows) {
            int customerId = row.getInt(0);
            assertEquals("Customer" + customerId, row.getString(1));
            assertEquals(firstDateValueAsInt + customerId, row.get(2, DataTypes.DateType),
                "2020-01-10 as a java.sql.Date is 18271, so the value of 'customerSince' is expected to be relative to that");
        }
    }
}
