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

package com.marklogic.hub.scaffolding;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

public class ScaffoldingTest extends AbstractHubCoreTest {

    private static File pluginDir;

    @Autowired
    Scaffolding scaffolding;

    @BeforeEach
    public void setup() {
        pluginDir = getHubProject().getHubPluginsDir().toFile();
    }

    @Test
    public void createEntity() {
        scaffolding.createEntity("my-fun-test");

        Path entityPath = getHubProject().getProjectDir().resolve("entities").resolve("my-fun-test.entity.json");
        assertTrue(entityPath.toFile().exists());

        Path flowDir = scaffolding.getLegacyFlowDir("my-fun-test", "blah", FlowType.INPUT);
        assertEquals(Paths.get(pluginDir.toString(), "entities", "my-fun-test", "input", "blah"),
            flowDir);
        assertFalse(flowDir.toFile().exists());
    }

    @Test
    public void createMappingDir() {
        scaffolding.createMappingDir("my-fun-test");

        Path mappingDir = getHubProject().getMappingDir("my-fun-test");
        assertTrue(mappingDir.toFile().exists());
        assertEquals(
            Paths.get(getHubProject().getProjectDir().toString(), "mappings", "my-fun-test"),
            mappingDir);
    }
}

