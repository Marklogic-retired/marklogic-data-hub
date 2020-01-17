package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
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
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class CreateGranularPrivilegesTest extends HubTestBase {

    @BeforeEach
    public void setUp() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
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
        final String finalTriggersDbId = databasesXml.getIdForNameOrId("data-hub-final-TRIGGERS");
        final String stagingTriggersDbId = databasesXml.getIdForNameOrId("data-hub-staging-TRIGGERS");

        Privilege p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + stagingDbId, p.getAction());
        assertEquals("data-hub-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + finalDbId, p.getAction());
        assertEquals("data-hub-admin", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + stagingDbId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + finalDbId, p.getAction());
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

        if (adminHubConfig.getIsProvisionedEnvironment()) {
            ResourcesFragment groupsXml = new GroupManager(adminHubConfig.getManageClient()).getAsXml();
            String groupId = groupsXml.getIdForNameOrId("Analyzer");
            p = resourceMapper.readResource(mgr.getAsJson("admin-group-scheduled-task-Analyzer", "kind", "execute"), Privilege.class);
            assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, p.getAction());
            assertEquals("data-hub-developer", p.getRole().get(0));

            groupId = groupsXml.getIdForNameOrId("Curator");
            p = resourceMapper.readResource(mgr.getAsJson("admin-group-scheduled-task-Curator", "kind", "execute"), Privilege.class);
            assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, p.getAction());
            assertEquals("data-hub-developer", p.getRole().get(0));

            groupId = groupsXml.getIdForNameOrId("Evaluator");
            p = resourceMapper.readResource(mgr.getAsJson("admin-group-scheduled-task-Evaluator", "kind", "execute"), Privilege.class);
            assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, p.getAction());
            assertEquals("data-hub-developer", p.getRole().get(0));

            groupId = groupsXml.getIdForNameOrId("Operator");
            p = resourceMapper.readResource(mgr.getAsJson("admin-group-scheduled-task-Operator", "kind", "execute"), Privilege.class);
            assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, p.getAction());
            assertEquals("data-hub-developer", p.getRole().get(0));
        } else {
            String groupName = adminHubConfig.getAppConfig().getGroupName();
            ResourcesFragment groupsXml = new GroupManager(adminHubConfig.getManageClient()).getAsXml();
            final String groupId = groupsXml.getIdForNameOrId(groupName);
            p = resourceMapper.readResource(mgr.getAsJson("admin-group-scheduled-task-" + groupName, "kind", "execute"), Privilege.class);
            assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, p.getAction());
            assertEquals("data-hub-developer", p.getRole().get(0));
        }
    }

    @Test
    void deletePrivilegesOnUndeploy() {
        PrivilegeManager mgr = new PrivilegeManager(adminHubConfig.getManageClient());
        ResourcesFragment privileges = mgr.getAsXml();
        assertTrue(privileges.resourceExists("admin-database-clear-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-clear-data-hub-FINAL"));
        assertTrue(privileges.resourceExists("admin-database-index-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-index-data-hub-FINAL"));
        assertTrue(privileges.resourceExists("admin-database-triggers-data-hub-staging-TRIGGERS"));
        assertTrue(privileges.resourceExists("admin-database-triggers-data-hub-final-TRIGGERS"));
        assertTrue(privileges.resourceExists("admin-database-temporal-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-temporal-data-hub-FINAL"));
        assertTrue(privileges.resourceExists("admin-database-alerts-data-hub-STAGING"));
        assertTrue(privileges.resourceExists("admin-database-alerts-data-hub-FINAL"));
        String groupName = adminHubConfig.getAppConfig().getGroupName();
        if (adminHubConfig.getIsProvisionedEnvironment()) {
            assertTrue(privileges.resourceExists("admin-group-scheduled-task-Operator"));
        } else {
            assertTrue(privileges.resourceExists("admin-group-scheduled-task-" + groupName));
        }

        final CreateGranularPrivilegesCommand command = new CreateGranularPrivilegesCommand(adminHubConfig);
        final CommandContext context = new CommandContext(adminHubConfig.getAppConfig(), adminHubConfig.getManageClient(), null);
        try {
            command.undo(context);

            privileges = mgr.getAsXml();
            assertFalse(privileges.resourceExists("admin-database-clear-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-clear-data-hub-FINAL"));
            assertFalse(privileges.resourceExists("admin-database-index-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-index-data-hub-FINAL"));
            assertFalse(privileges.resourceExists("admin-database-triggers-data-hub-staging-TRIGGERS"));
            assertFalse(privileges.resourceExists("admin-database-triggers-data-hub-final-TRIGGERS"));
            assertFalse(privileges.resourceExists("admin-database-temporal-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-temporal-data-hub-FINAL"));
            assertFalse(privileges.resourceExists("admin-database-alerts-data-hub-STAGING"));
            assertFalse(privileges.resourceExists("admin-database-alerts-data-hub-FINAL"));
            if (adminHubConfig.getIsProvisionedEnvironment()) {
                assertFalse(privileges.resourceExists("admin-group-scheduled-task-Operator"));
            } else {
                assertFalse(privileges.resourceExists("admin-group-scheduled-task-" + groupName));
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
    void createClearDatabasePrivilegesInSimulatedDhsEnvironment() {
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

        try {
            dhsDbaRole.save();
            dhsStagingPriv.save();
            dhsFinalPriv.save();

            List<Privilege> list = new CreateGranularPrivilegesCommand(adminHubConfig).buildClearDatabasePrivileges(adminHubConfig.getManageClient(), "data-hub-FINAL", "data-hub-STAGING");
            Privilege stagingPriv = list.get(0);
            assertEquals("clear-data-hub-STAGING", stagingPriv.getPrivilegeName());
            assertEquals("dba", stagingPriv.getRole().get(0));
            assertEquals("data-hub-admin", stagingPriv.getRole().get(1));

            Privilege finalPriv = list.get(1);
            assertEquals("clear-data-hub-FINAL", finalPriv.getPrivilegeName());
            assertEquals("dba", finalPriv.getRole().get(0));
            assertEquals("data-hub-admin", finalPriv.getRole().get(1));
        } finally {
            dhsDbaRole.delete();
            PrivilegeManager mgr = new PrivilegeManager(adminHubConfig.getManageClient());
            mgr.deleteAtPath("/manage/v2/privileges/clear-data-hub-FINAL?kind=execute");
            mgr.deleteAtPath("/manage/v2/privileges/clear-data-hub-STAGING?kind=execute");
        }
    }
}
