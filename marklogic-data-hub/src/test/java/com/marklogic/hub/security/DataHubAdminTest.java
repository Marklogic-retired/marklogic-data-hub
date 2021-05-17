package com.marklogic.hub.security;

import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

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
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles() && isNotProvisionedEnvironment());
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
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles() && isNotProvisionedEnvironment());
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
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles() && isNotProvisionedEnvironment());
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

    @Test
    void requestPrivileges() {
        List<String> privilegeNames = roleBeingTested.getPrivilege().stream()
            .map(rolePrivilege -> rolePrivilege.getPrivilegeName())
            .collect(Collectors.toList());

        assertTrue(privilegeNames.contains("cancel-any-request"),
            "Starting in 5.5, a data-hub-admin is permitted to cancel any request");
        assertTrue(privilegeNames.contains("set-any-time-limit"),
            "Starting in 5.5, a data-hub-admin is permitted to set a time limit on any request");
    }

    /**
     * When "clear database" is run against a database in DHS with replicas enabled, the operation intermittently fails
     * with an error of "Server Message: XDMP-FORESTNOT: Forest data-hub-STAGING-forest1 not available: wait replication".
     * This is not a DHF issue, but presumably an ML issue. We know the "clear database" tests succeed when run without
     * replicas enabled, which is good enough for the purpose of this test class.
     *
     * @return
     */
    private boolean isNotProvisionedEnvironment() {
        return !Boolean.TRUE.equals(getHubConfig().getIsProvisionedEnvironment());
    }
}
