package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Privilege;
import com.marklogic.mgmt.api.security.Role;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.mapper.ResourceMapper;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.resource.groups.GroupManager;
import com.marklogic.mgmt.resource.security.PrivilegeManager;
import com.marklogic.rest.util.ResourcesFragment;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class CreateGranularPrivilegesTest extends AbstractHubCoreTest {

    @BeforeEach
    public void setUp() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());

        // It's acceptable to run this as an admin, as an admin or admin-like user is typically used to install DH
        // either on-premise or in DHS.
        runAsAdmin();
    }

    /**
     * The CreateGranularPrivilegesCommand is assumed to have been run as part of bootstrapping the test application,
     * so this test just verifies the results of that command having been run.
     */
    @Test
    void verifyGranularPrivilegesExist() {
        PrivilegeManager mgr = new PrivilegeManager(adminHubConfig.getManageClient());
        ResourceMapper resourceMapper = new DefaultResourceMapper(new API(adminHubConfig.getManageClient()));

        ResourcesFragment databasesXml = new DatabaseManager(adminHubConfig.getManageClient()).getAsXml();
        final String finalDbId = databasesXml.getIdForNameOrId("data-hub-FINAL");
        final String stagingDbId = databasesXml.getIdForNameOrId("data-hub-STAGING");
        final String jobsDbId = databasesXml.getIdForNameOrId("data-hub-JOBS");
        final String finalTriggersDbId = databasesXml.getIdForNameOrId("data-hub-final-TRIGGERS");
        final String stagingTriggersDbId = databasesXml.getIdForNameOrId("data-hub-staging-TRIGGERS");

        Privilege p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + stagingDbId, p.getAction());
        assertEquals("data-hub-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + finalDbId, p.getAction());
        assertEquals("data-hub-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-JOBS", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + jobsDbId, p.getAction());
        assertEquals("data-hub-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + stagingDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + finalDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-JOBS", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + jobsDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-triggers-data-hub-staging-TRIGGERS", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/triggers/" + stagingTriggersDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-triggers-data-hub-final-TRIGGERS", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/triggers/" + finalTriggersDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-temporal-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/temporal/" + stagingDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-temporal-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/temporal/" + finalDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-alerts-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/alerts/" + stagingDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-alerts-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/alerts/" + finalDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        String groupName = adminHubConfig.getAppConfig().getGroupName();
        ResourcesFragment groupsXml = new GroupManager(adminHubConfig.getManageClient()).getAsXml();
        final String groupId = groupsXml.getIdForNameOrId(groupName);
        p = resourceMapper.readResource(mgr.getAsJson("admin-group-scheduled-task-" + groupName, "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));
    }

    @Test
    void deletePrivilegesOnUndeploy() {
        final CreateGranularPrivilegesCommand command = new CreateGranularPrivilegesCommand(adminHubConfig);
        final CommandContext context = new CommandContext(adminHubConfig.getAppConfig(), adminHubConfig.getManageClient(), null);

        PrivilegeManager mgr = new PrivilegeManager(adminHubConfig.getManageClient());
        ResourcesFragment privileges = mgr.getAsXml();
        assertTrue(privileges.resourceExists("admin-database-clear-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-clear-data-hub-FINAL"));
        assertTrue(privileges.resourceExists("admin-database-clear-data-hub-JOBS"));
        assertTrue(privileges.resourceExists("admin-database-index-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-index-data-hub-FINAL"));
        assertTrue(privileges.resourceExists("admin-database-index-data-hub-JOBS"));
        assertTrue(privileges.resourceExists("admin-database-triggers-data-hub-staging-TRIGGERS"));
        assertTrue(privileges.resourceExists("admin-database-triggers-data-hub-final-TRIGGERS"));
        assertTrue(privileges.resourceExists("admin-database-temporal-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-temporal-data-hub-FINAL"));
        assertTrue(privileges.resourceExists("admin-database-alerts-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-alerts-data-hub-FINAL"));
        assertTrue(privileges.resourceExists("admin-group-scheduled-task-" + adminHubConfig.getAppConfig().getGroupName()));

        for (Privilege privilege : command.buildPrivilegesForRolesThatCanBeInherited(adminHubConfig.getManageClient())) {
            assertTrue(privileges.resourceExists(privilege.getPrivilegeName()));
        }

        try {
            assertEquals(adminHubConfig.getAppConfig().getGroupName(), command.getGroupNamesForScheduledTaskPrivileges().get(0));

            command.undo(context);

            privileges = mgr.getAsXml();
            assertFalse(privileges.resourceExists("admin-database-clear-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-clear-data-hub-FINAL"));
            assertFalse(privileges.resourceExists("admin-database-clear-data-hub-JOBS"));
            assertFalse(privileges.resourceExists("admin-database-index-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-index-data-hub-FINAL"));
            assertFalse(privileges.resourceExists("admin-database-index-data-hub-JOBS"));
            assertFalse(privileges.resourceExists("admin-database-triggers-data-hub-staging-TRIGGERS"));
            assertFalse(privileges.resourceExists("admin-database-triggers-data-hub-final-TRIGGERS"));
            assertFalse(privileges.resourceExists("admin-database-temporal-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-temporal-data-hub-FINAL"));
            assertFalse(privileges.resourceExists("admin-database-alerts-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-alerts-data-hub-FINAL"));
            assertFalse(privileges.resourceExists("admin-group-scheduled-task-" + adminHubConfig.getAppConfig().getGroupName()));

            for (Privilege privilege : command.buildPrivilegesForRolesThatCanBeInherited(adminHubConfig.getManageClient())) {
                assertFalse(privileges.resourceExists(privilege.getPrivilegeName()));
            }
        } finally {
            // Need to deploy these privileges back so the lack of them doesn't impact other tests
            command.execute(context);
            verifyGranularPrivilegesExist();
        }
    }

    /**
     * Verifies that if the DHS privileges - clear-data-hub-FINAL and clear-data-hub-STAGING - already exist, then those
     * are reused and the data-hub-admin role is added to them. This avoids errors in trying to create privileges with
     * the same action.
     */
    @Test
    void createDatabasePrivilegesInSimulatedDhsEnvironment() {
        final API api = new API(adminHubConfig.getManageClient());
        Role dhsDbaRole = new Role(api, "dba");

        Privilege dhsFinalPriv = new Privilege(api, "clear-data-hub-FINAL");
        dhsFinalPriv.setKind("execute");
        dhsFinalPriv.setAction("not-the-real-privilege-final");
        dhsFinalPriv.addRole("dba");

        Privilege dhsStagingPriv = new Privilege(api, "clear-data-hub-STAGING");
        dhsStagingPriv.setKind("execute");
        dhsStagingPriv.setAction("not-the-real-privilege-staging");
        dhsStagingPriv.addRole("dba");

        Privilege dhsJobsPriv = new Privilege(api, "clear-data-hub-JOBS");
        dhsJobsPriv.setKind("execute");
        dhsJobsPriv.setAction("not-the-real-privilege-jobs");
        dhsJobsPriv.addRole("dba");

        Privilege dhsStagingIndexPriv = new Privilege(api, "STAGING-index-editor");
        dhsStagingIndexPriv.setKind("execute");
        dhsStagingIndexPriv.setAction("not-the-real-index-staging");
        dhsStagingIndexPriv.addRole("dba");

        Privilege dhsFinalIndexPriv = new Privilege(api, "FINAL-index-editor");
        dhsFinalIndexPriv.setKind("execute");
        dhsFinalIndexPriv.setAction("not-the-real-index-final");
        dhsFinalIndexPriv.addRole("dba");

        Privilege dhsJobsIndexPriv = new Privilege(api, "JOBS-index-editor");
        dhsJobsIndexPriv.setKind("execute");
        dhsJobsIndexPriv.setAction("not-the-real-index-jobs");
        dhsJobsIndexPriv.addRole("dba");

        try {
            dhsDbaRole.save();
            dhsStagingPriv.save();
            dhsFinalPriv.save();
            dhsJobsPriv.save();
            dhsStagingIndexPriv.save();
            dhsFinalIndexPriv.save();
            dhsJobsIndexPriv.save();

            List<Privilege> list = new CreateGranularPrivilegesCommand(adminHubConfig).buildPrivilegesThatDhsMayHaveCreated(adminHubConfig.getManageClient());
            Privilege stagingPriv = list.get(0);
            assertEquals("clear-data-hub-STAGING", stagingPriv.getPrivilegeName());
            assertEquals("dba", stagingPriv.getRole().get(0));
            assertEquals("data-hub-admin", stagingPriv.getRole().get(1));

            Privilege finalPriv = list.get(1);
            assertEquals("clear-data-hub-FINAL", finalPriv.getPrivilegeName());
            assertEquals("dba", finalPriv.getRole().get(0));
            assertEquals("data-hub-admin", finalPriv.getRole().get(1));

            Privilege jobsPriv = list.get(2);
            assertEquals("clear-data-hub-JOBS", jobsPriv.getPrivilegeName());
            assertEquals("dba", jobsPriv.getRole().get(0));
            assertEquals("data-hub-admin", jobsPriv.getRole().get(1));

            Privilege stagingIndexPriv = list.get(3);
            assertEquals("STAGING-index-editor", stagingIndexPriv.getPrivilegeName());
            assertEquals("dba", stagingIndexPriv.getRole().get(0));
            assertEquals("data-hub-developer", stagingIndexPriv.getRole().get(1));

            Privilege finalIndexPriv = list.get(4);
            assertEquals("FINAL-index-editor", finalIndexPriv.getPrivilegeName());
            assertEquals("dba", finalIndexPriv.getRole().get(0));
            assertEquals("data-hub-developer", finalIndexPriv.getRole().get(1));

            Privilege finalJobsPriv = list.get(5);
            assertEquals("JOBS-index-editor", finalJobsPriv.getPrivilegeName());
            assertEquals("dba", finalJobsPriv.getRole().get(0));
            assertEquals("data-hub-developer", finalJobsPriv.getRole().get(1));
        } finally {
            dhsDbaRole.delete();
            PrivilegeManager mgr = new PrivilegeManager(adminHubConfig.getManageClient());
            mgr.deleteAtPath("/manage/v2/privileges/clear-data-hub-FINAL?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/clear-data-hub-STAGING?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/clear-data-hub-JOBS?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/FINAL-index-editor?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/STAGING-index-editor?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/JOBS-index-editor?kind=execute");
        }
    }

    /**
     * Verify that the correct privileges are built (but not yet saved) for an arbitrary set of groups.
     */
    @Test
    void buildScheduledTaskPrivilegesForMultipleGroups() {
        CreateGranularPrivilegesCommand command = new CreateGranularPrivilegesCommand(adminHubConfig,
            Arrays.asList("A", "B", "C"));

        List<String> groupNames = command.getGroupNamesForScheduledTaskPrivileges();
        assertEquals(3, groupNames.size());
        assertEquals("A", groupNames.get(0));
        assertEquals("B", groupNames.get(1));
        assertEquals("C", groupNames.get(2));

        List<Privilege> privileges = command.buildScheduledTaskPrivileges();
        assertEquals(3, privileges.size());
        assertEquals("admin-group-scheduled-task-A", privileges.get(0).getPrivilegeName());
        assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(A)", privileges.get(0).getAction());
        assertEquals("admin-group-scheduled-task-B", privileges.get(1).getPrivilegeName());
        assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(B)", privileges.get(1).getAction());
        assertEquals("admin-group-scheduled-task-C", privileges.get(2).getPrivilegeName());
        assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/$$group-id(C)", privileges.get(2).getAction());
    }
}
