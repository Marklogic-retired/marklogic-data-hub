/*
 * Copyright 2012-2019 MarkLogic Corporation
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
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class EntityManagerTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();

    @Autowired
    private EntityManager entityManager;

    @Autowired
    HubProject project;

    @BeforeEach
    public void clearDbs() {
        deleteProjectDir();
        basicSetup();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        getDataHub().clearUserModules();
        installHubModules();
        getPropsMgr().deletePropertiesFile();
    }

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

    private HubModuleManager getPropsMgr() {
        String timestampFile = getDataHubAdminConfig().getHubProject().getUserModulesDeployTimestampFile();
        HubModuleManager propertiesModuleManager = new HubModuleManager(timestampFile);
        return propertiesModuleManager;
    }

    @Test
    public void testDeploySearchOptionsWithNoEntities() {
    	getDataHub().clearUserModules();
        Path dir = project.getEntityConfigDir();

        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        // this should be true regardless
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());

        HashMap<Enum, Boolean> deployed = entityManager.deployQueryOptions();

        assertEquals(0, deployed.size());
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
    }

    @Test
    @Disabled
    public void testDeploySearchOptions() throws IOException, SAXException {
    	getDataHub().clearUserModules();
        installEntities();

        Path dir = project.getHubEntitiesDir();

        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());

        HashMap<Enum, Boolean> deployed = entityManager.deployQueryOptions();

        assertEquals(2, deployed.size());
        assertTrue(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        String expectedFile = getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE);
        // In DHS, group is 'Curator'
        if (expectedFile == null) {
            expectedFile = getModulesFile("/Curator/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE);
        }

        assertXMLEqual(getResource("entity-manager-test/options.xml"), expectedFile);
        // if we re-merge modules this assertion will be true again:
         assertXMLEqual(getResource("entity-manager-test/options.xml"), getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));

        updateManagerEntity();
        deployed = entityManager.deployQueryOptions();
        assertEquals(2, deployed.size());
        assertTrue(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        assertXMLEqual(getResource("entity-manager-test/options2.xml"), getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        // if we re-merge modules this assertion will be true again:
        assertXMLEqual(getResource("entity-manager-test/options2.xml"), getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));

        // shouldn't deploy a 2nd time because of modules properties files
        deployed = entityManager.deployQueryOptions();
        assertEquals(0, deployed.size());
    }

    @Test
    public void testDeploySearchOptionsWithFlowRunnerUser() throws IOException, SAXException {
    	getDataHub().clearUserModules();
        installEntities();
        
        Path dir = Paths.get(PROJECT_PATH, HubConfig.ENTITY_CONFIG_DIR);
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        //Deploy with flow runner
        getHubFlowRunnerConfig();
        HashMap<Enum, Boolean> deployed = entityManager.deployQueryOptions();
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
        assertEquals( "pii-reader",
            rolesets.get("role-name").get(0).asText(), "Config should have one roleset, pii-reader.");


    }
}
