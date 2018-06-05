/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.scaffold.impl.ScaffoldingImpl;
import com.marklogic.hub.util.FileUtil;
import org.junit.Before;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.Assert.*;

public class GeneratePiiCommandTest extends HubTestBase  {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();
    private static final String RESOURCES_DIR = "scaffolding-test";

    GeneratePiiCommand generatePiiCommand;

    @Before
    public void setup() {
        generatePiiCommand = new GeneratePiiCommand(getHubConfig());
        deleteProjectDir();
    }

    private void installEntities() {
        ScaffoldingImpl scaffolding = new ScaffoldingImpl(projectDir.toString(), finalClient);
        Path employeeDir = scaffolding.getEntityDir("employee");
        employeeDir.toFile().mkdirs();
        assertTrue(employeeDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"), employeeDir.resolve("employee.entity.json").toFile());

        Path managerDir = scaffolding.getEntityDir("manager");
        managerDir.toFile().mkdirs();
        assertTrue(managerDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/manager.entity.json"), managerDir.resolve("manager.entity.json").toFile());
    }

    @Test
    public void generatePii() throws IOException {
        installEntities();
        generatePiiCommand.execute(null);
        File protectedPathConfig = getHubConfig().getUserSecurityDir().resolve("protected-paths/01_" + HubConfig.PII_PROTECTED_PATHS_FILE).toFile();
        File secondProtectedPathConfig = getHubConfig().getUserSecurityDir().resolve("protected-paths/02_" + HubConfig.PII_PROTECTED_PATHS_FILE).toFile();
        File queryRolesetsConfig = getHubConfig().getUserSecurityDir().resolve("query-rolesets/" + HubConfig.PII_QUERY_ROLESET_FILE).toFile();

        // assert that ELS configuation is in project
        ObjectMapper mapper = new ObjectMapper();
        JsonNode protectedPaths = mapper.readTree(protectedPathConfig);
        assertTrue("Protected Path Config should have path expression.",
            protectedPaths.get("path-expression").isTextual());
        protectedPaths = mapper.readTree(secondProtectedPathConfig);
        assertTrue("Protected Path Config should have path expression.",
            protectedPaths.get("path-expression").isTextual());
        JsonNode rolesets = mapper.readTree(queryRolesetsConfig);
        assertEquals("Config should have one roleset, pii-reader.",
            "pii-reader",
            rolesets.get("role-name").get(0).asText());
    }

}
