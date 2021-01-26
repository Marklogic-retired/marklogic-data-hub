package com.marklogic.hub.dhs;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.EntityManagerImpl;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class DeployEntityIndexesTest extends AbstractHubCoreTest {

    @AfterEach
    void afterEach() {
        // Need to restore path range indexes that were deleted during the test
        applyDatabasePropertiesForTests(getHubConfig());
    }

    @Test
    void test() {
        HubConfig hubConfig = getHubConfig();

        // Reset the path range indexes on final and staging
        Stream.of(DatabaseKind.STAGING, DatabaseKind.FINAL).forEach(databaseKind -> {
            Database db = new Database(new API(hubConfig.getManageClient()), hubConfig.getDbName(databaseKind));
            db.setRangePathIndex(new ArrayList<>());
            db.save();
        });
        verifyNoPathRangeIndexesExist();

        // Install the project and save indexes to the project
        installProjectInFolder("test-projects/entity-with-indexes");
        new EntityManagerImpl(hubConfig).saveDbIndexes();
        verifyNoPathRangeIndexesExist();

        // And deploy as a data-hub-developer
        deployAsDeveloper(getHubConfig());
        verifyPathRangeIndexExists();
    }

    private void verifyNoPathRangeIndexesExist() {
        DatabaseManager mgr = new DatabaseManager(getHubConfig().getManageClient());
        Stream.of(DatabaseKind.STAGING, DatabaseKind.FINAL).forEach(databaseKind -> {
            String json = mgr.getPropertiesAsJson(getHubConfig().getDbName(databaseKind));
            ObjectNode db = readJsonObject(json);
            assertFalse(db.has("range-path-index"));
        });
    }

    private void verifyPathRangeIndexExists() {
        DatabaseManager mgr = new DatabaseManager(getHubConfig().getManageClient());
        Stream.of(DatabaseKind.STAGING, DatabaseKind.FINAL).forEach(databaseKind -> {
            String json = mgr.getPropertiesAsJson(getHubConfig().getDbName(databaseKind));
            ObjectNode db = readJsonObject(json);
            assertTrue(db.has("range-path-index"), "The entity-based range-path-indexes defined in the database files " +
                "in src/main/entity-config should have been deployed. Because DhsDeployer is expected to ignore the " +
                "hub-internal-config directory (which contains a bunch of stuff that have already been deployed and which " +
                "the user should not be modifying), the expectation is that src/main/entity-config is added as an additional " +
                "configuration directory.");

            ArrayNode indexes = (ArrayNode) db.get("range-path-index");
            if (databaseKind.equals(DatabaseKind.STAGING)) {
                assertEquals(2, indexes.size());
            } else {
                assertEquals(4, indexes.size(), "Expecting the Person/personId, Person/name indexes and " +
                        "then two path range indexes that are added to Final for mastering purposes");
            }
            assertEquals("/(es:envelope|envelope)/(es:instance|instance)/Person/personId", indexes.get(0).get("path-expression").asText());
            assertEquals("/(es:envelope|envelope)/(es:instance|instance)/Person/name", indexes.get(1).get("path-expression").asText());
        });
    }
}
