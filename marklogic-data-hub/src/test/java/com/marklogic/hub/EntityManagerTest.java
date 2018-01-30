/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.hub;

import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.springframework.core.io.Resource;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.Assert.*;

public class EntityManagerTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        deleteProjectDir();
        installHub();
    }

    @Before
    public void clearDbs() {
        deleteProjectDir();
        createProjectDir();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_MODULES_DB_NAME);
        installHubModules();
        getPropsMgr().deletePropertiesFile();
    }

    @AfterClass
    public static void teardown() throws IOException {
        deleteProjectDir();
    }

    private void installEntity() {
        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), finalClient);
        Path employeeDir = scaffolding.getEntityDir("employee");
        employeeDir.toFile().mkdirs();
        assertTrue(employeeDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"), employeeDir.resolve("employee.entity.json").toFile());
    }

//    private void removeEntity() throws IOException {
//        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), finalClient);
//        Path employeeDir = scaffolding.getEntityDir("employee");
//        FileUtils.deleteDirectory(employeeDir.toFile());
//    }

    private HubModuleManager getPropsMgr() {
        String timestampFile = getHubConfig().getUserModulesDeployTimestampFile();
        HubModuleManager propertiesModuleManager = new HubModuleManager(timestampFile);
        return propertiesModuleManager;
    }

    @Test
    public void testDeploySearchOptionsWithNoEntities() throws IOException, SAXException {
        Path dir = Paths.get(getHubConfig().getProjectDir(), HubConfig.ENTITY_CONFIG_DIR);

        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE));
        Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE).toFile().delete();
        Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE).toFile().delete();
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());

        EntityManager entityManager = new EntityManager(getHubConfig());
        List<Resource> deployed = entityManager.deploySearchOptions();

        assertEquals(0, deployed.size());
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE));
    }

    @Test
    public void testDeploySearchOptions() throws IOException, SAXException {
        installEntity();

        Path dir = Paths.get(getHubConfig().getProjectDir(), HubConfig.ENTITY_CONFIG_DIR);

        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE));
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());

        EntityManager entityManager = new EntityManager(getHubConfig());
        List<Resource> deployed = entityManager.deploySearchOptions();

        assertEquals(2, deployed.size());
        assertTrue(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE).toFile().exists());
        assertEquals(0, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        assertXMLEqual(getResource("entity-manager-test/options.xml"), getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_SEARCH_OPTIONS_FILE));
        assertXMLEqual(getResource("entity-manager-test/options.xml"), getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_SEARCH_OPTIONS_FILE));

        // shouldn't deploy a 2nd time because of modules properties files
        deployed = entityManager.deploySearchOptions();
        assertEquals(0, deployed.size());
    }

    @Test
    public void testSaveDbIndexes() throws IOException, SAXException {
        installEntity();

        Path dir = getHubConfig().getEntityDatabaseDir();

        assertFalse(dir.resolve("final-database.json").toFile().exists());
        assertFalse(dir.resolve("staging-database.json").toFile().exists());

        EntityManager entityManager = new EntityManager(getHubConfig());
        assertTrue(entityManager.saveDbIndexes());

        assertTrue(dir.resolve("final-database.json").toFile().exists());
        assertTrue(dir.resolve("staging-database.json").toFile().exists());

        assertJsonEqual(getResource("entity-manager-test/db-config.json"), FileUtils.readFileToString(dir.resolve("final-database.json").toFile()), true);
        assertJsonEqual(getResource("entity-manager-test/db-config.json"), FileUtils.readFileToString(dir.resolve("staging-database.json").toFile()), true);

        // shouldn't save them on round 2 because of timestamps
        assertFalse(entityManager.saveDbIndexes());

        installUserModules(getHubConfig(), false);

        // shouldn't save them on round 3 because of timestamps
        assertFalse(entityManager.saveDbIndexes());
    }

}
