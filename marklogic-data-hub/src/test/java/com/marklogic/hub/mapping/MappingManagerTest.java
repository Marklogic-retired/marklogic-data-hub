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
package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.scaffold.impl.ScaffoldingImpl;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.HubModuleManager;
import org.apache.commons.io.FileUtils;
import org.junit.Before;
import org.junit.Test;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.Assert.*;

public class MappingManagerTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();

   // @Before
    public void clearDbs() {
        deleteProjectDir();
        basicSetup();
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_MODULES_DB_NAME);
        installHubModules();
        getPropsMgr().deletePropertiesFile();
    }

    @Test
    public void createMapping() {

    }

    private void installMappings() {
        ScaffoldingImpl scaffolding = new ScaffoldingImpl(projectDir.toString(), finalClient);
        Path employeeDir = scaffolding.getEntityDir("employee");
        employeeDir.toFile().mkdirs();
        assertTrue(employeeDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"),
            employeeDir.resolve("employee.entity.json").toFile());

        Path managerDir = scaffolding.getEntityDir("manager");
        managerDir.toFile().mkdirs();
        assertTrue(managerDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/manager.entity.json"), managerDir.resolve("manager.entity.json").toFile());
    }

    private void updateManagerEntity() {
        ScaffoldingImpl scaffolding = new ScaffoldingImpl(projectDir.toString(), finalClient);
        Path managerDir = scaffolding.getEntityDir("manager");
        assertTrue(managerDir.toFile().exists());
        File targetFile = managerDir.resolve("manager.entity.json").toFile();
        FileUtil.copy(getResourceStream("scaffolding-test/manager2.entity.json"), targetFile);
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        targetFile.setLastModified(System.currentTimeMillis());
    }

    private HubModuleManager getPropsMgr() {
        String timestampFile = getHubConfig().getUserModulesDeployTimestampFile();
        HubModuleManager propertiesModuleManager = new HubModuleManager(timestampFile);
        return propertiesModuleManager;
    }



}
