package com.marklogic.hub.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.api.database.GeospatialElementIndex;
import com.marklogic.mgmt.api.security.protectedpath.Permission;
import com.marklogic.mgmt.api.security.protectedpath.ProtectedPath;
import com.marklogic.mgmt.api.task.Task;
import com.marklogic.mgmt.api.trigger.*;
import com.marklogic.mgmt.resource.alert.AlertConfigManager;
import com.marklogic.mgmt.resource.security.ProtectedPathManager;
import com.marklogic.mgmt.resource.tasks.TaskManager;
import com.marklogic.mgmt.resource.temporal.TemporalAxesManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DataHubAppAdminTest extends AbstractSecurityTest {

    @Override
    protected String getRoleName() {
        return "data-hub-app-admin";
    }

    @Test
    @Disabled("This is not yet possible; a new granular privilege will be needed to only allow for temporal config to be " +
        "added to a database while not being able to make any modification to the database")
    public void task9ConfigureBitemporal() throws IOException {
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

        new TemporalAxesManager(userWithRoleBeingTestedClient, FINAL_DB).save(temporalAxis);

        // Verify and delete the axis as the admin user
        TemporalAxesManager mgr = new TemporalAxesManager(adminUserClient, FINAL_DB);
        try {
            JsonNode json = ObjectMapperFactory.getObjectMapper().readTree(mgr.getPropertiesAsJson("test-axis"));
            assertEquals("test-axis", json.get("axis-name").asText(),
                "Sanity check that the axis was created; if it wasn't, an error should have been thrown already");
        } finally {
            mgr.delete(temporalAxis);
        }
    }

    /**
     * Note that protect-path seems to allow both create and update, but neither protect-path nor unprotect-path allow
     * for deleting a protected path.
     */
    @Test
    public void task10CreateProtectedPaths() {
        final String pathExpression = "/some/path";
        ProtectedPath path = new ProtectedPath(pathExpression);
        path.setPermission(Arrays.asList(new com.marklogic.mgmt.api.security.protectedpath.Permission("rest-reader", "read")));
        path.setApi(userWithRoleBeingTestedApi);

        try {
            path.save();

            // And update it
            path.setPermission(Arrays.asList(new Permission("rest-writer", "read")));
            path.save();

            // Verify it as the admin user
            ProtectedPath updatedPath = resourceMapper.readResource(new ProtectedPathManager(adminUserClient).getAsJson(pathExpression), ProtectedPath.class);
            assertEquals(1, updatedPath.getPermission().size());
            assertEquals("rest-writer", updatedPath.getPermission().get(0).getRoleName(), "The protect-path privilege should allow " +
                "the user to both create and update protected paths");
        } finally {
            path.setApi(adminUserApi);
            path.delete();
        }
    }

    @Test
    @Disabled("Seem to be missing the granularity to only allow configuring triggers on a database")
    public void task11CreateFinalTriggers() {
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
            trigger.setApi(adminUserApi);
            trigger.delete();
        }
    }

    @Test
    @Disabled("Can't get this working without giving the user the manage-admin role; see https://bugtrack.marklogic.com/53319")
    public void task13ConfigureAlertsInFinal() {
        ObjectNode node = ObjectMapperFactory.getObjectMapper().createObjectNode();
        node.put("uri", "my-alert-config");
        node.put("name", "my alerting app");
        node.put("description", "my description");
        try {
            new AlertConfigManager(userWithRoleBeingTestedClient, FINAL_DB).save(node.toString());
        } finally {
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
    @Disabled("Seems to still require manage-admin at the RMA level")
    public void task17CreateScheduledTask() {
        Task task = new Task(userWithRoleBeingTestedApi, null);
        task.setTaskPath("/MarkLogic/flexrep/tasks/push-local-forests.xqy");
        task.setGroupName("Default");
        task.setTaskEnabled(false);
        task.setTaskDatabase(FINAL_DB);
        task.setTaskModules("");
        task.setTaskRoot("Modules/");
        task.setTaskPeriod(1);
        task.setTaskType("minutely");
        task.setTaskUser("nobody");

        try {
            task.save();
        } finally {
            new TaskManager(adminUserClient).deleteTaskWithPath(task.getTaskPath());
        }
    }

    @Test
    public void task18ConfigureFinalIndexes() {
        Database db = new Database(userWithRoleBeingTestedApi, FINAL_DB);
        db.setGeospatialElementIndex(Arrays.asList(buildGeoIndex()));
        try {
            db.save();
        } finally {
            db.setApi(adminUserApi);
            db.setGeospatialElementIndex(Arrays.asList());
            db.save();
        }
    }

    @Test
    public void task18ConfigureStagingIndexes() {
        Database db = new Database(userWithRoleBeingTestedApi, STAGING_DB);
        db.setGeospatialElementIndex(Arrays.asList(buildGeoIndex()));
        try {
            db.save();
        } finally {
            db.setApi(adminUserApi);
            db.setGeospatialElementIndex(Arrays.asList());
            db.save();
        }
    }

    @Test
    public void task19LoadModulesAndArtifacts() {
        final String originalMlUsername = adminHubConfig.getMlUsername();
        final String originalMlPassword = adminHubConfig.getMlPassword();
        try {
            adminHubConfig.setMlUsername(userWithRoleBeingTested.getUserName());
            adminHubConfig.setMlPassword(userWithRoleBeingTested.getPassword());

            installUserModules(adminHubConfig, true);
        } finally {
            adminHubConfig.setMlUsername(originalMlUsername);
            adminHubConfig.setMlPassword(originalMlPassword);
        }
    }

    /**
     * Combining all of these since they're just simple role checks.
     */
    @Test
    public void tasks19And20And22And23And24And26And27And29And30And31And37And38() {
        assertTrue(roleBeingTested.getRole().contains("rest-admin"),
            "Task 19: rest-admin allows the user to insert documents via /v1/documents");

        assertTrue(roleBeingTested.getRole().contains("tde-admin"),
            "Task 19 and 24: tde-admin allows the user to insert TDE schemas into the TDE protected collection");

        assertTrue(roleBeingTested.getRole().contains("rest-admin"),
            "Tasks 20 and 22: rest-admin is sufficient for allowing the user to perform CRUD operations on flows and " +
                "schemas, as these both default to being inserted with rest-reader/rest-writer permissions via " +
                "mlModulePermissions");

        assertTrue(roleBeingTested.getRole().contains("ps-user"),
            "Task 23: The ML provenance functions add ps-user/read and ps-internal/update permissions by default on " +
                "provenance documents; thus, a user needs ps-user to read these documents");

        assertTrue(roleBeingTested.getRole().contains("rest-admin"),
            "Tasks 26 and 27: Artifacts get rest-reader and rest-writer by default via mlModulePermissions and " +
                "mlEntityModelPermissions, and thus rest-admin provides access to reading these documents");

        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "Tasks 29 and 30: manage-user grants access to app-server logs, but not system logs");

        assertTrue(roleBeingTested.getRole().contains("manage-user"),
            "Task 31: manage-user grants read access to documents in the Meters database");

        assertTrue(roleBeingTested.getRole().contains("rest-admin"),
            "Tasks 37 and 38: these tasks are redundant with task 19; rest-admin allows a user to write these documents");


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
