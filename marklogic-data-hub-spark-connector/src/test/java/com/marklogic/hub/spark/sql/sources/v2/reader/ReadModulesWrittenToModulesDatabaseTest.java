package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.marklogic.client.document.DocumentManager;
import com.marklogic.client.io.StringHandle;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ReadModulesWrittenToModulesDatabaseTest extends AbstractSparkReadTest {

    private String[] uris = {"/marklogic-data-hub-spark-connector/readLib.sjs", "/marklogic-data-hub-spark-connector/partition-lib.xqy",
        "/marklogic-data-hub-spark-connector/readRows.sjs", "/marklogic-data-hub-spark-connector/readRows.api",
        "/marklogic-data-hub-spark-connector/initializeRead.sjs", "/marklogic-data-hub-spark-connector/initializeRead.api"};

    @Test
    void testReadModulesAreWrittenToModulesDatabase() {
        runAsDataHubDeveloper();
        DocumentManager dm = getHubClient().getModulesClient().newDocumentManager();

        dm.delete(uris);
        for(String i:uris) {
            assertFalse(dm.exists(i)!=null,
                i+" was not deleted from Modules database");
        }

        loadSimpleCustomerTDE();
        new HubDataSourceReader(newOptions().withView("Customer").toDataSourceOptions());

        for(String i:uris) {
            assertTrue(dm.exists(i)!=null,
                i+" was not written to Modules database");
        }
    }
}
