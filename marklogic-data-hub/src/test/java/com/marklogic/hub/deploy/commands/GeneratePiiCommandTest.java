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
package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.util.FileUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class GeneratePiiCommandTest extends HubTestBase  {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();
    private static final String RESOURCES_DIR = "scaffolding-test";

    @Autowired
    HubProject project;

    @Autowired
    GeneratePiiCommand generatePiiCommand;

    @BeforeEach
    public void setup() {
        deleteProjectDir();
    }

    private void installEntities() {
        Path employeeDir = project.getEntityDir("employee");
        employeeDir.toFile().mkdirs();
        assertTrue(employeeDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"), employeeDir.resolve("employee.entity.json").toFile());

        Path managerDir = project.getEntityDir("manager");
        managerDir.toFile().mkdirs();
        assertTrue(managerDir.toFile().exists());
        FileUtil.copy(getResourceStream("scaffolding-test/manager.entity.json"), managerDir.resolve("manager.entity.json").toFile());
    }

    @Test
    public void generatePii() throws IOException {
        installEntities();
        generatePiiCommand.execute(null);
        File protectedPathConfig = getDataHubAdminConfig().getUserSecurityDir().resolve("protected-paths/01_" + HubConfig.PII_PROTECTED_PATHS_FILE).toFile();
        File secondProtectedPathConfig = getDataHubAdminConfig().getUserSecurityDir().resolve("protected-paths/02_" + HubConfig.PII_PROTECTED_PATHS_FILE).toFile();
        File queryRolesetsConfig = getDataHubAdminConfig().getUserSecurityDir().resolve("query-rolesets/" + HubConfig.PII_QUERY_ROLESET_FILE).toFile();

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
