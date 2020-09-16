package com.marklogic.hub.dhs;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class DeployCustomUserFieldsTest extends AbstractHubCoreTest {

    @BeforeEach
    void beforeEach() {
        resetFieldsAndIndexes();
    }

    @AfterEach
    void afterEach() {
        // dhsDeployer mucks around with appConfig, so gotta reset everything
        getHubConfig().applyDefaultPropertyValues();
        getHubConfig().refreshProject();

        resetFieldsAndIndexes();
    }

    @Test
    void test() {
        // Project is expected to only have a final-database file so that we don't end up deploying anything beyond that
        installProjectInFolder("test-projects/user-fields", false);

        // Get the initial counts of fields/indexes for later comparisons
        runAsDataHubDeveloper();
        Database db = readFinalDatabase();
        final int initialFieldCount = db.getField().size();
        final int initialFieldIndexCount = db.getRangeFieldIndex().size();
        final int initialPathIndexCount = db.getRangePathIndex().size();

        // Deploy as a data-hub-developer
        new DhsDeployer().deployAsDeveloper(getHubConfig());

        // Verify that the existing DH fields/indexes still exist, and we have the user fields/indexes too (1 of each)
        db = readFinalDatabase();
        assertEquals(initialFieldCount + 1, db.getField().size());
        assertEquals(initialFieldIndexCount + 1, db.getRangeFieldIndex().size());
        assertEquals(initialPathIndexCount + 1, db.getRangePathIndex().size());
    }

    private Database readFinalDatabase() {
        String json = new DatabaseManager(getHubClient().getManageClient()).getPropertiesAsJson(getHubClient().getDbName(DatabaseKind.FINAL));
        return new DefaultResourceMapper(new API(getHubClient().getManageClient())).readResource(json, Database.class);
    }

    private void resetFieldsAndIndexes() {
        runAsFlowDeveloper();

        // Wipe out all fields/indexes
        Database db = new Database(new API(getHubClient().getManageClient()), getHubClient().getDbName(DatabaseKind.FINAL));
        db.setField(new ArrayList<>());
        db.setRangeFieldIndex(new ArrayList<>());
        db.setRangePathIndex(new ArrayList<>());
        db.save();

        // Then run the command to deploy the OOTB fields/indexes
        new DeployDatabaseFieldCommand().execute(newCommandContext());
    }
}
