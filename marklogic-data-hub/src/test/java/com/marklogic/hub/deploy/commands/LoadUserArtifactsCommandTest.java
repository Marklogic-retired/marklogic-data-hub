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

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.ApplicationConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;


@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class LoadUserArtifactsCommandTest extends HubTestBase {

    @BeforeEach
    public void setup() {
        loadUserArtifactsCommand.setHubConfig(getDataHubAdminConfig());
    }

    @Test
    public void testIsEntityDir() {
        Path startPath = Paths.get("/tmp/my-project/plugins/entities");
        Path dir = Paths.get("/tmp/my-project/plugins/entities/my-entity");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input/my-input-flow");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/mappings");
        dir = Paths.get("/tmp/my-project/plugins/mappings/my-mappings/input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/mappings");
        dir = Paths.get("/tmp/my-project/plugins/mappings/my-mappings");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));


        // test windows paths
        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input\\my-input-flow");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\mappings");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\mappings\\my-mappings\\path1\\path2");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\mappings");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\mappings\\my-mappings");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));
    }
}
