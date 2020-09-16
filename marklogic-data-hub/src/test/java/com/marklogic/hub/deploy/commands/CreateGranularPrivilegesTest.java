package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.security.Privilege;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

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
        PrivilegeManager mgr = new PrivilegeManager(getHubClient().getManageClient());
        ResourceMapper resourceMapper = new DefaultResourceMapper(new API(getHubClient().getManageClient()));

        ResourcesFragment databasesXml = new DatabaseManager(getHubClient().getManageClient()).getAsXml();
        final String finalDbId = databasesXml.getIdForNameOrId("data-hub-FINAL");
        final String stagingDbId = databasesXml.getIdForNameOrId("data-hub-STAGING");
        final String jobsDbId = databasesXml.getIdForNameOrId("data-hub-JOBS");
        final String finalTriggersDbId = databasesXml.getIdForNameOrId("data-hub-final-TRIGGERS");
        final String stagingTriggersDbId = databasesXml.getIdForNameOrId("data-hub-staging-TRIGGERS");

        Privilege p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + stagingDbId, p.getAction());
        assertTrue(p.getRole().contains("data-hub-admin"));
        assertTrue(p.getRole().contains("hub-central-clear-user-data"));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + finalDbId, p.getAction());
        assertTrue(p.getRole().contains("data-hub-admin"));
        assertTrue(p.getRole().contains("hub-central-clear-user-data"));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-clear-data-hub-JOBS", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/clear/" + jobsDbId, p.getAction());
        assertTrue(p.getRole().contains("data-hub-admin"));
        assertTrue(p.getRole().contains("hub-central-clear-user-data"));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-STAGING", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + stagingDbId, p.getAction());
        assertTrue(p.getRole().contains("data-hub-developer"));
        assertTrue(p.getRole().contains("hub-central-entity-model-writer"));

        p = resourceMapper.readResource(mgr.getAsJson("admin-database-index-data-hub-FINAL", "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/database/index/" + finalDbId, p.getAction());
        assertTrue(p.getRole().contains("data-hub-developer"));
        assertTrue(p.getRole().contains("hub-central-entity-model-writer"));

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

        String groupName = getHubConfig().getAppConfig().getGroupName();
        ResourcesFragment groupsXml = new GroupManager(getHubClient().getManageClient()).getAsXml();
        final String groupId = groupsXml.getIdForNameOrId(groupName);
        p = resourceMapper.readResource(mgr.getAsJson("admin-group-scheduled-task-" + groupName, "kind", "execute"), Privilege.class);
        assertEquals("http://marklogic.com/xdmp/privileges/admin/group/scheduled-task/" + groupId, p.getAction());
        assertEquals("data-hub-developer", p.getRole().get(0));
    }

    @Test
    void existingPrivilegeHasSameAction() {
        ResourcesFragment databasesXml = new DatabaseManager(getHubClient().getManageClient()).getAsXml();
        final String finalDbId = databasesXml.getIdForNameOrId("data-hub-FINAL");

        // Setup a test privilege that we want to create via the command's logic; it has the same action as one of the
        // privileges that we know the command creates
        Privilege p = new Privilege(null, "aaa-test-privilege");
        p.setKind("execute");
        p.addRole("qconsole-user");
        p.setAction("http://marklogic.com/xdmp/privileges/admin/database/index/" + finalDbId);
        Map<String, Privilege> privileges = new HashMap<>();
        privileges.put(p.getAction(), p);

        final ResourceMapper resourceMapper = new DefaultResourceMapper(new API(getHubClient().getManageClient()));
        final PrivilegeManager privilegeManager = new PrivilegeManager(getHubClient().getManageClient());

        try {
            // Now apply the logic in the command for saving this test privilege
            CreateGranularPrivilegesCommand command = new CreateGranularPrivilegesCommand(getHubConfig());
            command.saveGranularPrivileges(getHubClient().getManageClient(), privileges);

            assertFalse(privilegeManager.exists("aaa-test-privilege"), "The test privilege should not have been created " +
                "since there's an existing DHF granular privilege with the same action");
            assertTrue(privilegeManager.exists("admin-database-index-data-hub-FINAL"));

            String privilegeJson = privilegeManager.getAsJson("admin-database-index-data-hub-FINAL", "kind", "execute");
            Privilege privilege = resourceMapper.readResource(privilegeJson, Privilege.class);
            assertEquals(3, privilege.getRole().size(), "Expecting the 2 existing roles plus the qconsole one; roles: " + privilege.getRole());
            Stream.of("data-hub-developer", "hub-central-entity-model-writer", "qconsole-user").forEach(role -> {
                assertTrue(privilege.getRole().contains(role), "Did not find role: " + role + " in privilege roles: " + privilege.getRole());
            });
        } finally {
            // Ensure qconsole-user is removed from the role
            String privilegeJson = privilegeManager.getAsJson("admin-database-index-data-hub-FINAL", "kind", "execute");
            Privilege privilege = resourceMapper.readResource(privilegeJson, Privilege.class);
            privilege.getRole().remove("qconsole-user");
            privilege.save();
        }
    }

    @Test
    void deletePrivilegesOnUndeploy() {
        final CreateGranularPrivilegesCommand command = new CreateGranularPrivilegesCommand(getHubConfig());
        final CommandContext context = newCommandContext();

        PrivilegeManager privilegeManager = new PrivilegeManager(context.getManageClient());
        ResourcesFragment existingPrivileges = privilegeManager.getAsXml();

        final Map<String, Privilege> granularPrivileges = command.buildGranularPrivileges(getHubClient().getManageClient());
        granularPrivileges.values().forEach(priv -> {
            assertTrue(existingPrivileges.resourceExists(priv.getPrivilegeName()));
        });

        try {
            assertEquals(getHubConfig().getAppConfig().getGroupName(), command.getGroupNamesForScheduledTaskPrivileges().get(0));

            command.undo(context);

            ResourcesFragment updatedPrivileges = privilegeManager.getAsXml();
            granularPrivileges.values().forEach(priv -> {
                assertFalse(updatedPrivileges.resourceExists(priv.getPrivilegeName()));
            });
        } finally {
            // Need to deploy these privileges back so the lack of them doesn't impact other tests
            command.execute(context);
            verifyGranularPrivilegesExist();
        }
    }

    /**
     * Just verifies that the command uses the correct group names when it tries to build scheduled task privileges.
     */
    @Test
    void buildScheduledTaskPrivilegesForMultipleGroups() {
        CreateGranularPrivilegesCommand command = new CreateGranularPrivilegesCommand(getHubConfig(),
            Arrays.asList("A", "B", "C"));

        List<String> groupNames = command.getGroupNamesForScheduledTaskPrivileges();
        assertEquals(3, groupNames.size());
        assertEquals("A", groupNames.get(0));
        assertEquals("B", groupNames.get(1));
        assertEquals("C", groupNames.get(2));

        command = new CreateGranularPrivilegesCommand(getHubConfig());
        assertEquals("Default", command.getGroupNamesForScheduledTaskPrivileges().get(0));
    }
}
