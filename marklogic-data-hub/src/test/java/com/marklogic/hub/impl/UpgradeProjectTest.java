package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.nio.file.Paths;
import java.util.HashMap;

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
        // The tokens map doesn't seem to matter for what we're testing here
        hubProject.init(new HashMap<>());
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
        // The tokens map doesn't seem to matter for what we're testing here
        hubProject.init(new HashMap<>());
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

    private void verifyInternalDatabases(File internalConfigDir) {
        File databasesDir = new File(internalConfigDir, "databases");

        File jobFile = new File(databasesDir, "job-database.json");
        assertTrue(jobFile.exists());
        ObjectNode jobDatabase = readFile(jobFile);
        assertEquals("%%mlJobDbName%%", jobDatabase.get("database-name").asText());
        assertEquals("%%mlStagingSchemasDbName%%", jobDatabase.get("schema-database").asText());
        assertEquals("%%mlStagingTriggersDbName%%", jobDatabase.get("triggers-database").asText());

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

    private void verifyUserDatabases(File configDir) {
        File databasesDir = new File(configDir, "databases");

        File finalFile = new File(databasesDir, "final-database.json");
        assertTrue(finalFile.exists());
        ObjectNode finalDatabase = readFile(finalFile);
        assertEquals("%%mlFinalDbName%%", finalDatabase.get("database-name").asText());

        String schemasValue = finalDatabase.get("schema-database").asText();
        assertTrue(schemasValue.equals("%%mlFinalSchemasDbName%%") || schemasValue.equals("%%SCHEMAS_DATABASE%%"),
            "Either token is okay, as they will have the same value");

        String triggersValue = finalDatabase.get("triggers-database").asText();
        assertTrue(triggersValue.equals("%%mlFinalTriggersDbName%%") || triggersValue.equals("%%TRIGGERS_DATABASE%%"),
            "Either token is okay, as they will have the same value");

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
        assertEquals("/data-hub/4/tracing/tracing-rewriter.xml", jobServer.get("url-rewriter").asText());
        assertEquals("%%mlModulesDbName%%", jobServer.get("modules-database").asText());
        assertEquals("%%mlJobDbName%%", jobServer.get("content-database").asText());

        File stagingFile = new File(serversDir, "staging-server.json");
        assertTrue(stagingFile.exists());
        ObjectNode stagingServer = readFile(stagingFile);
        assertEquals("%%mlStagingAppserverName%%", stagingServer.get("server-name").asText());
        assertEquals("/data-hub/4/rest-api/rewriter.xml", stagingServer.get("url-rewriter").asText());
        assertEquals("/data-hub/4/rest-api/error-handler.xqy", stagingServer.get("error-handler").asText());
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
