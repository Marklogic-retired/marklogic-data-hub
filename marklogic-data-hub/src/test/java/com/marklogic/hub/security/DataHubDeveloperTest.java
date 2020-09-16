package com.marklogic.hub.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.SaveReceipt;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.api.database.GeospatialElementIndex;
import com.marklogic.mgmt.api.security.Role;
import com.marklogic.mgmt.api.security.RolePrivilege;
import com.marklogic.mgmt.api.security.protectedpath.Permission;
import com.marklogic.mgmt.api.security.protectedpath.ProtectedPath;
import com.marklogic.mgmt.api.security.queryroleset.QueryRoleset;
import com.marklogic.mgmt.api.task.Task;
import com.marklogic.mgmt.api.trigger.*;
import com.marklogic.mgmt.resource.alert.AlertActionManager;
import com.marklogic.mgmt.resource.alert.AlertConfigManager;
import com.marklogic.mgmt.resource.alert.AlertRuleManager;
import com.marklogic.mgmt.resource.security.ProtectedPathManager;
import com.marklogic.mgmt.resource.security.QueryRolesetManager;
import com.marklogic.mgmt.resource.security.RoleManager;
import com.marklogic.mgmt.resource.tasks.TaskManager;
import com.marklogic.mgmt.resource.temporal.TemporalAxesManager;
import com.marklogic.mgmt.resource.temporal.TemporalCollectionManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class DataHubDeveloperTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-developer";
    }

    @Test
    public void task9ConfigureBitemporal() throws IOException {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        final String temporalAxis = "{\n" +
            "  \"axis-name\": \"test-axis\",\n" +
            "  \"axis-start\": {\n" +
            "    \"element-reference\": {\n" +
            "      \"namespace-uri\": \"\",\n" +
            "      \"localname\": \"test-systemStart\"\n" +
            "    }\n" +
            "  },\n" +
            "  \"axis-end\": {\n" +
            "    \"element-reference\": {\n" +
            "      \"namespace-uri\": \"\",\n" +
            "      \"localname\": \"test-systemEnd\"\n" +
            "    }\n" +
            "  }\n" +
            "}";

        TemporalAxesManager mgr = new TemporalAxesManager(userWithRoleBeingTestedClient, FINAL_DB);
        mgr.save(temporalAxis);

        TemporalCollectionManager collMgr = new TemporalCollectionManager(userWithRoleBeingTestedClient, FINAL_DB);
        final String collPayLoad = "   {\n" +
            "     \"collection-name\": \"mycollectionnameuri\",\n" +
            "     \"system-axis\": \"test-axis\"\n" +
            "   }";
        collMgr.save(collPayLoad);

        try {
            JsonNode json = ObjectMapperFactory.getObjectMapper().readTree(mgr.getPropertiesAsJson("test-axis"));
            assertEquals("test-axis", json.get("axis-name").asText(),
                "Sanity check that the axis was created; if it wasn't, an error should have been thrown already");
        } finally {
            collMgr.delete(collPayLoad);
            mgr.delete(temporalAxis);
        }

        mgr = new TemporalAxesManager(userWithRoleBeingTestedClient, "Documents");
        try {
            mgr.save(temporalAxis);
            Assertions.fail();
        } catch (Exception e) {
            logger.info("Cannot create temporal axes in 'Documents' db");
        }
    }

    @Test
    public void task10CreateProtectedPaths() throws Exception {
        verifyRoleHasAllProtectedPathAndQueryRolesetPrivileges();

        final String pathExpression = "/some/path";
        ProtectedPath path = new ProtectedPath(pathExpression);
        path.setPermission(Arrays.asList(new com.marklogic.mgmt.api.security.protectedpath.Permission("rest-reader", "read")));
        path.setApi(userWithRoleBeingTestedApi);

        final ProtectedPathManager adminProtectedPathManager = new ProtectedPathManager(adminUserClient);

        try {
            path.save();
            assertTrue(adminProtectedPathManager.exists(pathExpression));

            // And update it
            path.setPermission(Arrays.asList(new Permission("rest-writer", "read")));
            path.save();

            // Verify it as the admin user
            ProtectedPath updatedPath = resourceMapper.readResource(adminProtectedPathManager.getAsJson(pathExpression), ProtectedPath.class);
            assertEquals(1, updatedPath.getPermission().size());
            assertEquals("rest-writer", updatedPath.getPermission().get(0).getRoleName(), "The protect-path privilege should allow " +
                "the user to both create and update protected paths");
        } finally {
            String pathId = adminProtectedPathManager.getAsXml().getIdForNameOrId(pathExpression);
            userWithRoleBeingTestedClient.delete("/manage/v2/protected-paths/" + pathId + "?force=true");
            assertFalse(adminProtectedPathManager.exists(pathExpression),
                "The remove-path privilege should allow the user to delete a protected path. Note that in ML 10.0-3, the unprotect-path " +
                    "privilege is not needed to perform this operation. The Admin UI requires first unprotecting a protected path, but " +
                    "the Manage API is able to delete a protected path without unprotecting it first.");
        }
    }

    private void verifyRoleHasAllProtectedPathAndQueryRolesetPrivileges() {
        Role role = resourceMapper.readResource(new RoleManager(adminUserClient).getPropertiesAsJson("data-hub-developer"), Role.class);
        List<RolePrivilege> privileges = role.getPrivilege();
        Arrays.asList("protect-path", "remove-path", "unprotect-path", "path-add-permissions", "path-get-permissions", "path-remove-permissions",
            "path-set-permissions", "add-query-rolesets", "remove-query-rolesets", "database-node-query-rolesets", "node-query-rolesets")
            .stream().forEach(privilegeName -> {

            boolean found = false;
            for (RolePrivilege rp : privileges) {
                if (privilegeName.equals(rp.getPrivilegeName())) {
                    found = true;
                    break;
                }
            }
            assertTrue(found, "Did not find privilege: " + privilegeName + ". Due to the odd issue with protected paths " +
                "not working if query rolesets are deployed immediately after protected paths by a user without the " +
                "'security' role, all privileges related to PPs and QRs are granted to the data-hub-developer role to " +
                "minimize the chance of some other mysterious issue popping up. The Manage API appears to allow for " +
                "PPs to be deployed and deleted with just protect-path and remove-path, and for QRs to be deployed " +
                "and deleted with just add-query-rolesets and remove-query-rolesets, but we're granting all the privileges " +
                "just to be safe.");
        });
    }

    @Test
    void task10CreateQueryRolesets() {
        final QueryRolesetManager mgr = new QueryRolesetManager(userWithRoleBeingTestedClient);
        final List<String> originalRolesetIds = mgr.getAsXml().getListItemIdRefs();

        QueryRoleset qr = new QueryRoleset(null);
        qr.setRoleName(Arrays.asList("harmonized-reader", "harmonized-updater"));
        qr.setApi(userWithRoleBeingTestedApi);
        SaveReceipt receipt = mgr.save(qr.getJson());
        final String rolesetPath = receipt.getResponse().getHeaders().getLocation().toString();

        final List<String> newRolesetIds = mgr.getAsXml().getListItemIdRefs();
        try {
            assertEquals(originalRolesetIds.size() + 1, newRolesetIds.size(),
                "Expected one more roleset to exist");
        } finally {
            userWithRoleBeingTestedClient.delete(rolesetPath);
            final List<String> rolesetIdsAfterDeletion = mgr.getAsXml().getListItemIdRefs();
            assertEquals(originalRolesetIds.size(), rolesetIdsAfterDeletion.size());
        }
    }

    @Test
    public void task11CreateFinalTriggers() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        Trigger trigger = new Trigger();
        trigger.setApi(userWithRoleBeingTestedApi);
        trigger.setName("test-trigger");
        trigger.setDatabaseName("data-hub-final-TRIGGERS");
        Event event = new Event();
        DataEvent dataEvent = new DataEvent();
        dataEvent.setWhen("pre-commit");
        dataEvent.setDocumentContent(new DocumentContent("create"));
        dataEvent.setCollectionScope(new CollectionScope("test"));
        event.setDataEvent(dataEvent);
        trigger.setEvent(event);
        trigger.setModule("/some/trigger.sjs");
        trigger.setRecursive(false);
        trigger.setEnabled(false);
        trigger.setModuleDb("data-hub-MODULES");
        try {
            trigger.save();
        } finally {
            trigger.delete();
        }

        try {
            trigger.setModuleDb("Modules");
            trigger.setDatabaseName("Triggers");
            trigger.save();
            Assertions.fail();
        } catch (Exception e) {
            logger.info("User doesn't have privilege to create triggers in 'Triggers' db");
        }

    }

    @Test
    public void task13ConfigureAlertsInFinal() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();
        node.put("uri", "my-alert-config");
        node.put("name", "my alerting app");
        node.put("description", "my description");

        ObjectNode alertActionNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        alertActionNode.put("name", "log2");
        alertActionNode.put("module", "/alert-action.xqy");
        alertActionNode.put("description", "log to ErrorLog.txt1");
        alertActionNode.put("module-db", HubConfig.DEFAULT_MODULES_DB_NAME);
        alertActionNode.put("module-root", "/");

        ObjectNode alertRuleNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        ObjectNode ctsQuery = ObjectMapperFactory.getObjectMapper().createObjectNode();
        ctsQuery.set("wordQuery", ObjectMapperFactory.getObjectMapper().createObjectNode().put("text", "MarkLogic"));
        alertRuleNode.put("name", "my-rule");
        alertRuleNode.set("query", ctsQuery);
        alertRuleNode.put("description", "my-rule");

        try {
            new AlertConfigManager(userWithRoleBeingTestedClient, FINAL_DB).save(node.toString());
            new AlertActionManager(userWithRoleBeingTestedClient, FINAL_DB, "my-alert-config").save(alertActionNode.toString());
            new AlertRuleManager(userWithRoleBeingTestedClient, FINAL_DB, "my-alert-config", "log2").save(alertRuleNode.toString());
        } finally {
            new AlertRuleManager(userWithRoleBeingTestedClient, FINAL_DB, "my-alert-config", "log2").delete(alertRuleNode.toString());
            new AlertActionManager(adminUserClient, FINAL_DB, "my-alert-config").delete(alertActionNode.toString());
            new AlertConfigManager(adminUserClient, FINAL_DB).delete(node.toString());
        }
    }

    @Test
    public void task14ViewAuditLog() {
        verifySystemLogsCanBeAccessed();
    }

    @Test
    public void task15MonitorDatabase() {
        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "The manage-user role grants access to the monitoring GUI on port 8002, which also provides visibility of deadlocks " +
                "(as do the system logs)");
    }

    @Test
    public void task16MonitorBackups() {
        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "The manage-user role (and the 'manage' role) grants access to 8002:/manage/v2, which provides read-only " +
                "access to database and forest status, which can be used for checking backup status per the instructions at " +
                "https://help.marklogic.com/Knowledgebase/Article/View/377/0/creating-a-web-service-for-monitoring-marklogic-backups");
    }

    @Test
    public void task17CreateScheduledTask() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        Task task = new Task(userWithRoleBeingTestedApi, null);
        task.setTaskPath("/MarkLogic/flexrep/tasks/push-local-forests.xqy");
        if (getHubConfig().getIsProvisionedEnvironment()) {
            task.setGroupName("Curator");
        } else {
            task.setGroupName("Default");
        }
        task.setTaskEnabled(false);
        task.setTaskDatabase(FINAL_DB);
        task.setTaskModules("");
        task.setTaskRoot("Modules/");
        task.setTaskPeriod(1);
        task.setTaskType("minutely");
        task.setTaskUser("nobody");

        try {
            task.save();
            //Modify the task
            task.setTaskRoot("newModules/");
            task.setTaskPeriod(2);
            task.save();
        } finally {
            new TaskManager(adminUserClient).delete(task.getJson());
        }
    }

    @Test
    public void task18ConfigureFinalIndexes() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        Database db = new Database(userWithRoleBeingTestedApi, FINAL_DB);
        db.setGeospatialElementIndex(Arrays.asList(buildGeoIndex()));
        try {
            db.save();
        } finally {
            db.setGeospatialElementIndex(Arrays.asList());
            db.save();
        }
    }

    @Test
    public void task18ConfigureStagingIndexes() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        Database db = new Database(userWithRoleBeingTestedApi, STAGING_DB);
        db.setGeospatialElementIndex(Arrays.asList(buildGeoIndex()));
        try {
            db.save();
        } finally {
            db.setGeospatialElementIndex(Arrays.asList());
            db.save();
        }
    }

    @Test
    public void task18ConfigureJobIndexes() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        Database db = new Database(userWithRoleBeingTestedApi, JOBS_DB);
        db.setGeospatialElementIndex(Arrays.asList(buildGeoIndex()));
        try {
            db.save();
        } finally {
            db.setGeospatialElementIndex(Arrays.asList());
            db.save();
        }
    }

    @Test
    public void task19LoadModulesAndArtifacts() {
        HubConfigImpl hubConfig = getHubConfig();
        final String originalMlUsername = hubConfig.getMlUsername();
        final String originalMlPassword = hubConfig.getMlPassword();
        try {
            hubConfig.setMlUsername(userWithRoleBeingTested.getUserName());
            hubConfig.setMlPassword(userWithRoleBeingTested.getPassword());

            installUserModules(hubConfig, true);
        } finally {
            hubConfig.setMlUsername(originalMlUsername);
            hubConfig.setMlPassword(originalMlPassword);
        }
    }

    /**
     * Combining all of these since they're just simple role checks.
     */
    @Test
    public void tasks19And20And22And23And24And26And27And29And30And31And37And38() {
        assertFalse(roleBeingTested.getRole().contains("rest-admin"),
            "The role should have the rest-admin privilege, but not the rest-admin role; this prevents several " +
                "default permissions from being added to the role which users may not want");
        assertFalse(roleBeingTested.getRole().contains("rest-writer"),
            "The role should not have the rest-writer role; this prevents several " +
                "default permissions from being added to the role which users may not want");

        assertTrue(roleBeingTested.getRole().contains("data-hub-operator"),
            "Task 19: data-hub-operator inherits the rest-writer privilege, which allows the user to write documents via /v1/documents");

        assertTrue(roleBeingTested.getRole().contains("tde-admin"),
            "Task 19 and 24: tde-admin allows the user to insert TDE schemas into the TDE protected collection");

        assertTrue(roleBeingTested.getRole().contains("data-hub-flow-writer"),
            "Tasks 20 : data-hub-flow-writer is required for allowing the user to perform CRUD operations on flows");

        assertTrue(roleBeingTested.getRole().contains("data-hub-operator"),
            "Tasks 22: data-hub-operator has the rest-writer privilege, which is sufficient for allowing the user to perform CRUD operations on  " +
                "schemas, as it defaults to being inserted with rest-reader/rest-writer permissions via " +
                "flow-developer/ data-hub-developer roles");

        assertTrue(roleBeingTested.getRole().contains("ps-user"),
            "Task 23: The ML provenance functions add ps-user/read and ps-internal/update permissions by default on " +
                "provenance documents; thus, a user needs ps-user to read these documents");

        assertTrue(roleBeingTested.getRole().contains("data-hub-operator"),
            "Tasks 26 and 27: Artifacts get rest-reader and rest-writer by default via " +
                "mlEntityModelPermissions, and thus data-hub-operator, which inherits rest-reader, provides access to reading these documents");

        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "Tasks 29 and 30: manage-user grants access to app-server logs, but not system logs");

        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "Task 31: manage-user grants read access to documents in the Meters database");

        assertTrue(roleBeingTested.getRole().contains("data-hub-operator"),
            "Tasks 37 and 38: these tasks are redundant with task 19; data-hub-operator allows a user to write these documents");
    }

    private GeospatialElementIndex buildGeoIndex() {
        GeospatialElementIndex index = new GeospatialElementIndex();
        index.setLocalname("someLocalname");
        index.setNamespaceUri("someNamespace");
        index.setPointFormat("point");
        index.setCoordinateSystem("wgs84");
        index.setInvalidValues("reject");
        index.setRangeValuePositions(false);
        return index;
    }
}
