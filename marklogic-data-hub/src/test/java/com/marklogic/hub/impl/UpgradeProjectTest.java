package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests various upgrade scenarios. General approach is to copy a stubbed out project from
 * src/test/resources/upgrade-projects into the build directory (a non-version-controlled area) where it
 * can then be upgraded and verified.
 */
public class UpgradeProjectTest {

    @Test
    public void upgrade300ToCurrentVersion() throws Exception {
        final String projectPath = "build/tmp/upgrade-projects/dhf300";
        final File projectDir = Paths.get(projectPath).toFile();
        FileUtils.deleteDirectory(projectDir);
        FileUtils.copyDirectory(Paths.get("src/test/resources/upgrade-projects/dhf300").toFile(), projectDir);

        HubProjectImpl hubProject = new HubProjectImpl();
        hubProject.createProject(projectPath);
        // We require %%mlStagingSchemasDbName%% in the map for test. In real scenarios, its value will always be set.
        hubProject.init(createMap());
        hubProject.upgradeProject();

        File srcDir = new File(projectDir, "src");
        File mainDir = new File(srcDir, "main");

        File internalConfigDir = new File(mainDir, "hub-internal-config");
        verifyInternalDatabases(internalConfigDir);
        verifyInternalServers(internalConfigDir);

        File configDir = new File(mainDir, "ml-config");
        verifyUserDatabases(configDir);
        verifyUserServers(configDir);
    }

    @Test
    public void upgrade300To403ToCurrentVersion() throws Exception {
        final String projectPath = "build/tmp/upgrade-projects/dhf403from300";
        final File projectDir = Paths.get(projectPath).toFile();
        FileUtils.deleteDirectory(projectDir);
        FileUtils.copyDirectory(Paths.get("src/test/resources/upgrade-projects/dhf403from300").toFile(), projectDir);

        HubProjectImpl hubProject = new HubProjectImpl();
        hubProject.createProject(projectPath);
        // We require %%mlStagingSchemasDbName%% in the map for test. In real scenarios, its value will always be set.
        hubProject.init(createMap());
        hubProject.upgradeProject();

        File srcDir = new File(projectDir, "src");
        File mainDir = new File(srcDir, "main");

        File internalConfigDir = new File(mainDir, "hub-internal-config");
        verifyInternalDatabases(internalConfigDir);
        verifyInternalServers(internalConfigDir);

        File configDir = new File(mainDir, "ml-config");
        verifyUserDatabases(configDir);
        verifyUserServers(configDir);
    }

    private Map<String, String> createMap() {
        Map<String,String> myMap = new HashMap<>();
        myMap.put("%%mlStagingSchemasDbName%%", HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        return myMap;
    }

    private void verifyInternalDatabases(File internalConfigDir) {
        File databasesDir = new File(internalConfigDir, "databases");

        // old schemas doesn't exist
        assertFalse(internalConfigDir.toPath().resolve("schemas").toFile().exists());

        File jobFile = new File(databasesDir, "job-database.json");
        assertTrue(jobFile.exists());
        ObjectNode jobDatabase = readFile(jobFile);
        assertEquals("%%mlJobDbName%%", jobDatabase.get("database-name").asText());
        assertEquals("%%mlStagingSchemasDbName%%", jobDatabase.get("schema-database").asText());
        assertEquals("%%mlStagingTriggersDbName%%", jobDatabase.get("triggers-database").asText());

        verifyJobDatabaseHasPathRangeIndexes(jobDatabase);

        File stagingFile = new File(databasesDir, "staging-database.json");
        assertTrue(stagingFile.exists());
        ObjectNode stagingDatabase = readFile(stagingFile);
        assertEquals("%%mlStagingDbName%%", stagingDatabase.get("database-name").asText());
        assertEquals("%%mlStagingSchemasDbName%%", stagingDatabase.get("schema-database").asText());
        assertEquals("%%mlStagingTriggersDbName%%", stagingDatabase.get("triggers-database").asText());

        File schemasFile = new File(databasesDir, "staging-schemas-database.json");
        assertTrue(schemasFile.exists());
        ObjectNode schemasDatabase = readFile(schemasFile);
        assertEquals("%%mlStagingSchemasDbName%%", schemasDatabase.get("database-name").asText());

        File triggersFile = new File(databasesDir, "staging-triggers-database.json");
        assertTrue(triggersFile.exists());
        ObjectNode triggersDatabase = readFile(triggersFile);
        assertEquals("%%mlStagingTriggersDbName%%", triggersDatabase.get("database-name").asText());

        assertFalse(new File(databasesDir, "final-database.json").exists());
        assertFalse(new File(databasesDir, "modules-database.json").exists());
        verifyObsoleteDatabaseFilesDontExist(databasesDir);
    }

    private void verifyJobDatabaseHasPathRangeIndexes(ObjectNode jobDatabase) {
        ArrayNode indexes = (ArrayNode)jobDatabase.get("range-path-index");
        assertEquals(6, indexes.size());
        assertEquals("/trace/hasError", indexes.get(0).get("path-expression").asText());
        assertEquals("/trace/flowType", indexes.get(1).get("path-expression").asText());
        assertEquals("/trace/jobId", indexes.get(2).get("path-expression").asText());
        assertEquals("/trace/traceId", indexes.get(3).get("path-expression").asText());
        assertEquals("/trace/identifier", indexes.get(4).get("path-expression").asText());
        assertEquals("/trace/created", indexes.get(5).get("path-expression").asText());

        for (int i = 0; i < 5; i++) {
            assertEquals("string", indexes.get(i).get("scalar-type").asText());
            assertEquals("http://marklogic.com/collation/codepoint", indexes.get(i).get("collation").asText());
            assertEquals(false, indexes.get(i).get("range-value-positions").asBoolean());
            assertEquals("reject", indexes.get(i).get("invalid-values").asText());
        }

        assertEquals("dateTime", indexes.get(5).get("scalar-type").asText());
        assertEquals("", indexes.get(5).get("collation").asText());
        assertEquals(false, indexes.get(5).get("range-value-positions").asBoolean());
        assertEquals("reject", indexes.get(5).get("invalid-values").asText());
    }

    private void verifyUserDatabases(File configDir) {
        File databasesDir = new File(configDir, "databases");
        // new schemas path exists
        assertTrue(databasesDir.toPath().resolve(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME).resolve("schemas").toFile().exists());

        File finalFile = new File(databasesDir, "final-database.json");
        assertTrue(finalFile.exists());
        ObjectNode finalDatabase = readFile(finalFile);
        assertEquals("%%mlFinalDbName%%", finalDatabase.get("database-name").asText());
        
        /*These schema and triggers db values should be equal to 
         * %%mlFinalSchemasDbName%% and  %%mlFinalTriggersDbName%%
         */
        String schemasValue = finalDatabase.get("schema-database").asText();
        assertTrue(schemasValue.equals("%%mlFinalSchemasDbName%%"));

        String triggersValue = finalDatabase.get("triggers-database").asText();
        assertTrue(triggersValue.equals("%%mlFinalTriggersDbName%%"));

        File schemasFile = new File(databasesDir, "final-schemas-database.json");
        assertTrue(schemasFile.exists());
        ObjectNode schemasDatabase = readFile(schemasFile);
        assertEquals("%%mlFinalSchemasDbName%%", schemasDatabase.get("database-name").asText());

        File triggersFile = new File(databasesDir, "final-triggers-database.json");
        assertTrue(triggersFile.exists());
        ObjectNode triggersDatabase = readFile(triggersFile);
        assertEquals("%%mlFinalTriggersDbName%%", triggersDatabase.get("database-name").asText());

        File modulesFile = new File(databasesDir, "modules-database.json");
        assertTrue(modulesFile.exists());
        ObjectNode modulesDatabase = readFile(modulesFile);
        assertEquals("%%mlModulesDbName%%", modulesDatabase.get("database-name").asText());

        assertFalse(new File(databasesDir, "staging-database.json").exists());
        assertFalse(new File(databasesDir, "job-database.json").exists());
        verifyObsoleteDatabaseFilesDontExist(databasesDir);
    }

    private void verifyObsoleteDatabaseFilesDontExist(File databasesDir) {
        assertFalse(new File(databasesDir, "schemas-database.json").exists());
        assertFalse(new File(databasesDir, "trace-database.json").exists());
        assertFalse(new File(databasesDir, "triggers-database.json").exists());
    }

    private void verifyInternalServers(File internalConfigDir) {
        File serversDir = new File(internalConfigDir, "servers");

        File jobFile = new File(serversDir, "job-server.json");
        assertTrue(jobFile.exists());
        ObjectNode jobServer = readFile(jobFile);
        assertEquals("%%mlJobAppserverName%%", jobServer.get("server-name").asText());
        assertEquals("/data-hub/5/tracing/tracing-rewriter.xml", jobServer.get("url-rewriter").asText());
        assertEquals("%%mlModulesDbName%%", jobServer.get("modules-database").asText());
        assertEquals("%%mlJobDbName%%", jobServer.get("content-database").asText());

        File stagingFile = new File(serversDir, "staging-server.json");
        assertTrue(stagingFile.exists());
        ObjectNode stagingServer = readFile(stagingFile);
        assertEquals("%%mlStagingAppserverName%%", stagingServer.get("server-name").asText());
        assertEquals("/data-hub/5/rest-api/rewriter.xml", stagingServer.get("url-rewriter").asText());
        assertEquals("/data-hub/5/rest-api/error-handler.xqy", stagingServer.get("error-handler").asText());
        assertEquals("%%mlModulesDbName%%", stagingServer.get("modules-database").asText());
        assertEquals("%%mlStagingDbName%%", stagingServer.get("content-database").asText());

        assertFalse(new File(serversDir, "final-server.json").exists());
        assertFalse(new File(serversDir, "trace-server.json").exists());
    }

    private void verifyUserServers(File configDir) {
        File serversDir = new File(configDir, "servers");

        File finalFile = new File(serversDir, "final-server.json");
        assertTrue(finalFile.exists());
        ObjectNode finalServer = readFile(finalFile);
        assertEquals("%%mlFinalAppserverName%%", finalServer.get("server-name").asText());
        assertEquals("%%mlModulesDbName%%", finalServer.get("modules-database").asText());
        assertEquals("%%mlFinalDbName%%", finalServer.get("content-database").asText());

        assertFalse(new File(serversDir, "staging-server.json").exists());
        assertFalse(new File(serversDir, "job-server.json").exists());
        assertFalse(new File(serversDir, "trace-server.json").exists());
    }

    private ObjectNode readFile(File f) {
        try {
            return (ObjectNode) new ObjectMapper().readTree(f);
        } catch (Exception ex) {
            throw new RuntimeException(ex);
        }
    }
}
