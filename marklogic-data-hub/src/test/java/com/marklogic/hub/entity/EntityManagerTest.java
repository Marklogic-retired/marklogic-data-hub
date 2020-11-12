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

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MarkLogicVersion;
import com.marklogic.hub.impl.EntityManagerImpl;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.rest.util.Fragment;
import org.apache.commons.io.FileUtils;
import org.jdom2.Namespace;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class EntityManagerTest extends AbstractHubCoreTest {

    @Autowired
    EntityManagerImpl entityManager;

    private void installEntities() {
        Path entitiesDir = getHubProject().getHubEntitiesDir();
        if (!entitiesDir.toFile().exists()) {
            entitiesDir.toFile().mkdirs();
        }
        assertTrue(entitiesDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"),
            entitiesDir.resolve("employee.entity.json").toFile());

        FileUtil.copy(getResourceStream("scaffolding-test/manager.entity.json"), entitiesDir.resolve("manager.entity.json").toFile());
    }

    private void updateManagerEntity() {
        Path entitiesDir = getHubProject().getHubEntitiesDir();
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
        Path dir = getHubProject().getEntityConfigDir();

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

        runAsAdmin();
        Path dir = getHubProject().getEntityConfigDir();
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertFalse(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertFalse(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());

        runAsDataHubDeveloper();
        entityManager.deployQueryOptions();

        // Gotta user admin in order to have read permission
        runAsAdmin();
        assertNotNull(getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE));
        assertNotNull(getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE));
        assertTrue(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
    }


    @Test
    public void testSaveDbIndexes() throws IOException {
        installEntities();

        Path dir = getHubProject().getEntityDatabaseDir();

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
    }

    @Test
    public void doNotReturnExternalReferencesInExpandedEntities() {
        installEntities();
        Path entitiesDir = getHubProject().getHubEntitiesDir();
        FileUtil.copy(getResourceStream("scaffolding-test/ManagerWithEmployeeRef.entity.json"), entitiesDir.resolve("ManagerWithEmployeeRef.entity.json").toFile());

        HubEntity hubEntity = entityManager.getEntityFromProject("ManagerWithEmployeeRef", true);

        AtomicBoolean employeesFound = new AtomicBoolean(false);
        hubEntity.getDefinitions().getDefinitions().get("ManagerWithEmployeeRef").getProperties().forEach((propType) -> {
            if ("employees".equals(propType.getName())) {
                employeesFound.set(true);
            }
        });
        assertFalse(employeesFound.get(), "Employees property should not exist");
    }

    @Test
    public void generateExplorerOptions() {
        installEntities();
        File finalDbOptions = getHubProject().getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile();
        File stagingDbOptions = getHubProject().getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile();

        entityManager.saveQueryOptions();

        assertTrue(finalDbOptions.exists());
        assertTrue(stagingDbOptions.exists());
    }

    @Test
    public void generateExplorerOptionsWithNoEntities() {
        File finalDbOptions = getHubProject().getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile();
        File stagingDbOptions = getHubProject().getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile();

        entityManager.saveQueryOptions();

        assertFalse(finalDbOptions.exists());
        assertFalse(stagingDbOptions.exists());
    }

    @Test
    public void overrideExistingExplorerOptions() {
        installEntities();
        copyTestEntityOptionsIntoProject();
        File finalDbOptions = getHubProject().getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile();
        File stagingDbOptions = getHubProject().getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile();

        long oldFinalOptionsTimeStamp = finalDbOptions.lastModified();
        long oldStagingOptionsTimeStamp = stagingDbOptions.lastModified();

        entityManager.saveQueryOptions();

        long newFinalOptionsTimeStamp = finalDbOptions.lastModified();
        long newStagingOptionsTimeStamp = stagingDbOptions.lastModified();

        assertTrue(newFinalOptionsTimeStamp > oldFinalOptionsTimeStamp);
        assertTrue(newStagingOptionsTimeStamp > oldStagingOptionsTimeStamp);
    }

    @Test
    public void deployExplorerOptionsWithoutContainerConstraint() {
        clearUserModules();

        Path entitiesDir = getHubProject().getHubEntitiesDir();
        if (!entitiesDir.toFile().exists()) {
            entitiesDir.toFile().mkdirs();
        }
        FileUtil.copy(getResourceStream("scaffolding-test/Collection.entity.json"),
                entitiesDir.resolve("Collection.entity.json").toFile());

        runAsDataHubDeveloper();
        entityManager.deployQueryOptions();

        runAsAdmin();
        Stream.of(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME)
                .forEach(dbName -> assertNull(getModulesFile("/Default/" + dbName + "/rest-api/options/exp-default.xml"), "Did not expect exp-default.xml options file in " + dbName + "since we dont use it anymore."));

        Path dir = getHubProject().getEntityConfigDir();
        assertTrue(Paths.get(dir.toString(), HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());
        assertTrue(Paths.get(dir.toString(), HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE).toFile().exists());

        String stagingOptions = getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.STAGING_ENTITY_QUERY_OPTIONS_FILE);
        String finalOptions = getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.FINAL_ENTITY_QUERY_OPTIONS_FILE);
        Stream<String> optionsString = Stream.of(stagingOptions, finalOptions);
        MarkLogicVersion version = new MarkLogicVersion(getHubClient().getManageClient());
        if(version.supportsRangeIndexConstraints()){
            optionsString.forEach(option -> assertNull(option, "Expected the option to not be deployed since there is a conflicting constraint for 'Collection'."));
        }
        else{
            optionsString.forEach(option -> assertNotNull(option, "Expected the option to be deployed since entity constraint is not generated in this marklogic version."));
        }


        String stagingExplorerOptions = getModulesFile("/Default/" + HubConfig.DEFAULT_STAGING_NAME + "/rest-api/options/" + HubConfig.EXP_STAGING_ENTITY_QUERY_OPTIONS_FILE);
        String finalExplorerOptions = getModulesFile("/Default/" + HubConfig.DEFAULT_FINAL_NAME + "/rest-api/options/" + HubConfig.EXP_FINAL_ENTITY_QUERY_OPTIONS_FILE);
        Stream.of(stagingExplorerOptions, finalExplorerOptions).forEach(option -> {
            assertNotNull(option, "Expected the option to be deployed since the conflicting container constraint has been removed.");

            Fragment fragment = new Fragment(option, Namespace.getNamespace("search", "http://marklogic.com/appservices/search"));
            assertEquals(0, fragment.getElements("//search:constraint[@name = 'Collection']/search:container").size(), "Did not expect to find the ES generated container constraint in explorer options file: " + option);
        });
    }

    private void copyTestEntityOptionsIntoProject() {
        try {
            FileUtils.copyFile(
                getResourceFile("entity-manager-test/options.xml"),
                getHubProject().getEntityConfigDir().resolve("exp-final-entity-options.xml").toFile()
            );
            FileUtils.copyFile(
                getResourceFile("entity-manager-test/options2.xml"),
                getHubProject().getEntityConfigDir().resolve("exp-staging-entity-options.xml").toFile()
            );
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
