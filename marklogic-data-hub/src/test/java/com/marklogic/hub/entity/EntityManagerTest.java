/*
 * Copyright (c) 2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.*;

public class EntityManagerTest extends AbstractHubCoreTest {

    @Autowired
    EntityManager entityManager;

    @Autowired
    HubProject project;

    private void installEntities() {
        Path entitiesDir = project.getHubEntitiesDir();
        if (!entitiesDir.toFile().exists()) {
            entitiesDir.toFile().mkdirs();
        }
        assertTrue(entitiesDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"),
            entitiesDir.resolve("employee.entity.json").toFile());

        FileUtil.copy(getResourceStream("scaffolding-test/manager.entity.json"), entitiesDir.resolve("manager.entity.json").toFile());
    }

    private void updateManagerEntity() {
        Path entitiesDir = project.getHubEntitiesDir();
        assertTrue(entitiesDir.toFile().exists());
        File targetFile = entitiesDir.resolve("manager.entity.json").toFile();
        FileUtil.copy(getResourceStream("scaffolding-test/manager2.entity.json"), targetFile);
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        targetFile.setLastModified(System.currentTimeMillis());
    }

    @Test
    public void testDeploySearchOptionsWithNoEntities() {
        clearUserModules();
        Path dir = project.getEntityConfigDir();

        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        // this should be true regardless
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());

        HashMap<Enum, Boolean> deployed = entityManager.deployQueryOptions();

        assertEquals(0, deployed.size());
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
    }

    @Test
    public void deploySearchOptionsAsDataHubDeveloper() {
        runAsDataHubDeveloper();

        clearUserModules();
        installEntities();

        Path dir = Paths.get(PROJECT_PATH, HubConfig.ENTITY_CONFIG_DIR);
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());

        entityManager.deployQueryOptions();

        //Change to admin config
        getDataHubAdminConfig();
        //Search options files not written to modules db but created.
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertTrue(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
    }


    @Test
    public void testSaveDbIndexes() throws IOException {
        installEntities();

        Path dir = getDataHubAdminConfig().getEntityDatabaseDir();

        assertFalse(dir.resolve("final-database.json").toFile().exists());
        assertFalse(dir.resolve("staging-database.json").toFile().exists());

        assertTrue(entityManager.saveDbIndexes());

        assertTrue(dir.resolve("final-database.json").toFile().exists());
        assertTrue(dir.resolve("staging-database.json").toFile().exists());

        assertJsonEqual(getResource("entity-manager-test/db-config.json"), FileUtils.readFileToString(dir.resolve("final-database.json").toFile()), true);
        assertJsonEqual(getResource("entity-manager-test/db-config.json"), FileUtils.readFileToString(dir.resolve("staging-database.json").toFile()), true);

        updateManagerEntity();
        assertTrue(entityManager.saveDbIndexes());

        assertJsonEqual(getResource("entity-manager-test/db-config2.json"), FileUtils.readFileToString(dir.resolve("final-database.json").toFile()), true);
        assertJsonEqual(getResource("entity-manager-test/db-config2.json"), FileUtils.readFileToString(dir.resolve("staging-database.json").toFile()), true);

        // try a deploy too
        /* this section causes a state change in the db that's hard to tear down/
         so it's excluded from our automated testing for the time being
        try {
            getDataHub().updateIndexes();
            // pass
        } catch (Exception e) {
            throw (e);
        }
         */

    }


    @Test
    @Tag("NoAWS")
    public void testDeployPiiConfigurations() throws IOException {
        installEntities();

        ObjectMapper mapper = new ObjectMapper();
        Path dir = getDataHubAdminConfig().getHubEntitiesDir();

        // deploy is separate
        entityManager.savePii();

        File protectedPathConfig = getDataHubAdminConfig().getUserSecurityDir().resolve("protected-paths/01_" + HubConfig.PII_PROTECTED_PATHS_FILE).toFile();
        File secondProtectedPathConfig = getDataHubAdminConfig().getUserSecurityDir().resolve("protected-paths/02_" + HubConfig.PII_PROTECTED_PATHS_FILE).toFile();
        File queryRolesetsConfig = getDataHubAdminConfig().getUserSecurityDir().resolve("query-rolesets/" + HubConfig.PII_QUERY_ROLESET_FILE).toFile();

        // assert that ELS configuation is in project
        JsonNode protectedPaths = mapper.readTree(protectedPathConfig);
        assertTrue(protectedPaths.get("path-expression").isTextual(),
            "Protected Path Config should have path expression.");
        protectedPaths = mapper.readTree(secondProtectedPathConfig);
        assertTrue(protectedPaths.get("path-expression").isTextual(),
            "Protected Path Config should have path expression.");
        JsonNode rolesets = mapper.readTree(queryRolesetsConfig);
        assertEquals("pii-reader",
            rolesets.get("role-name").get(0).asText(), "Config should have one roleset, pii-reader.");


    }

    @Test
    public void generateExplorerOptions() {
        installEntities();
        File finalDbOptions = project.getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile();
        File stagingDbOptions = project.getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile();

        entityManager.generateExplorerQueryOptions();

        assertTrue(finalDbOptions.exists());
        assertTrue(stagingDbOptions.exists());
    }

    @Test
    public void generateExplorerOptionsWithNoEntities() {
        File finalDbOptions = project.getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile();
        File stagingDbOptions = project.getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile();

        entityManager.generateExplorerQueryOptions();

        assertFalse(finalDbOptions.exists());
        assertFalse(stagingDbOptions.exists());
    }

    @Test
    public void overrideExistingExplorerOptions() {
        installEntities();
        copyTestEntityOptionsIntoProject();
        File finalDbOptions = project.getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile();
        File stagingDbOptions = project.getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile();

        long oldFinalOptionsTimeStamp = finalDbOptions.lastModified();
        long oldStagingOptionsTimeStamp = stagingDbOptions.lastModified();

        entityManager.generateExplorerQueryOptions();

        long newFinalOptionsTimeStamp = finalDbOptions.lastModified();
        long newStagingOptionsTimeStamp = stagingDbOptions.lastModified();

        assertTrue(newFinalOptionsTimeStamp > oldFinalOptionsTimeStamp);
        assertTrue(newStagingOptionsTimeStamp > oldStagingOptionsTimeStamp);
    }

    private void copyTestEntityOptionsIntoProject() {
        try {
            FileUtils.copyFile(
                getResourceFile("entity-manager-test/options.xml"),
                project.getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile()
            );
            FileUtils.copyFile(
                getResourceFile("entity-manager-test/options2.xml"),
                project.getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile()
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
