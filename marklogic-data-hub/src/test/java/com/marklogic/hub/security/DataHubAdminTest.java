package com.marklogic.hub.security;

import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

/**
 * Needs manage-user for RMA access plus granular privileges for clearing the staging and final databases.
 */
public class DataHubAdminTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-admin";
    }

    @Test
    public void task7ClearStagingDatabase() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        try {
            new DatabaseManager(userWithRoleBeingTestedClient).clearDatabase(STAGING_DB, false);
            String count = getHubClient().getStagingClient().newServerEval().xquery("xdmp:estimate(fn:doc())").evalAs(String.class);
            assertEquals(0, Integer.parseInt(count), "The database should have been cleared");
        } finally {
            installHubArtifacts();
        }
    }

    @Test
    public void task7CannotOtherwiseUpdateStagingDatabase() {
        try {
            Database db = new Database(userWithRoleBeingTestedApi, STAGING_DB);
            db.setRebalancerThrottle(3);
            db.save();
            fail("The user should only have the ability to clear the database and modify indexes");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
        }
    }

    @Test
    public void task8ClearFinalDatabase() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        try {
            new DatabaseManager(userWithRoleBeingTestedClient).clearDatabase(FINAL_DB, false);
            String count = getHubClient().getFinalClient().newServerEval().xquery("xdmp:estimate(fn:doc())").evalAs(String.class);
            assertEquals(0, Integer.parseInt(count), "The database should have been cleared");
        } finally {
            installHubArtifacts();
        }
    }

    @Test
    public void task8CannotOtherwiseUpdateFinalDatabase() {
        try {
            Database db = new Database(userWithRoleBeingTestedApi, FINAL_DB);
            db.setRebalancerThrottle(3);
            db.save();
            fail("The user should only have the ability to clear the database and modify indexes");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
        }
    }

    @Test
    public void clearJobsDatabase() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        new DatabaseManager(userWithRoleBeingTestedClient).clearDatabase(JOBS_DB, false);
        String count = getHubClient().getJobsClient().newServerEval().xquery("xdmp:estimate(fn:doc())").evalAs(String.class);
        assertEquals(0, Integer.parseInt(count), "The database should have been cleared");
    }

    @Test
    public void cannotOtherwiseUpdateJobsDatabase() {
        try {
            Database db = new Database(userWithRoleBeingTestedApi, JOBS_DB);
            db.setRebalancerThrottle(3);
            db.save();
            fail("The user should only have the ability to clear the database and modify indexes");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
        }
    }
}
