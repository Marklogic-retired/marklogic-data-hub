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

package com.marklogic.hub.scaffolding;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.error.ScaffoldingValidationException;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class ScaffoldingTest extends HubTestBase {

    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();
    private static File pluginDir = projectPath.resolve("plugins").toFile();
    private static boolean isMl9 = true;

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    HubProject project;

    @BeforeEach
    public void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);
        createProjectDir();
        //isMl9 = getMlMajorVersion() == 9;
    }

    @AfterEach
    public void teardown() {
        deleteProjectDir();
    }

    @Test
    public void createEntity() throws FileNotFoundException {
        scaffolding.createEntity("my-fun-test");
        assertTrue(projectDir.exists());

        Path entityPath = projectDir.toPath().resolve("entities").resolve("my-fun-test.entity.json");
        assertTrue(entityPath.toFile().exists());

        Path flowDir = scaffolding.getLegacyFlowDir("my-fun-test", "blah", FlowType.INPUT);
        assertEquals(Paths.get(pluginDir.toString(), "entities", "my-fun-test", "input", "blah"),
                flowDir);
        assertFalse(flowDir.toFile().exists());
    }

    @Test
    public void createMappingDir() {
        scaffolding.createMappingDir("my-fun-test");
        assertTrue(projectDir.exists());

        Path mappingDir = project.getMappingDir("my-fun-test");
        assertTrue(mappingDir.toFile().exists());
        assertEquals(
            Paths.get(projectDir.toPath().toString(), "mappings", "my-fun-test"),
            mappingDir);
    }


    @Test
    public void createXqyRestExtension() throws IOException {
        String entityName = "my-fun-test";
        String extensionName = "myExtension";
        FlowType flowType = FlowType.HARMONIZE;
        CodeFormat pluginCodeFormat = CodeFormat.XQUERY;
        try {
            scaffolding.createRestExtension(entityName, extensionName, flowType, pluginCodeFormat);
        } catch (ScaffoldingValidationException e) {
            fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restServicesDir = restDir.resolve("services");
        assertTrue(restServicesDir.toFile().exists());
        Path restExtensionFile = restServicesDir.resolve(extensionName + "." + pluginCodeFormat);
        assertTrue(restExtensionFile.toFile().exists());
        Path restExtensionMetadataDir = restServicesDir.resolve("metadata");
        assertTrue(restExtensionMetadataDir.toFile().exists());
        Path restExtensionMetadataFile = restExtensionMetadataDir.resolve(extensionName + ".xml");
        assertTrue(restExtensionMetadataFile.toFile().exists());
    }

    @Test
    public void createSjsRestExtension() throws IOException {
        String entityName = "my-fun-test";
        String extensionName = "myExtension";
        FlowType flowType = FlowType.INPUT;
        CodeFormat pluginCodeFormat = CodeFormat.JAVASCRIPT;
        try {
            scaffolding.createRestExtension(entityName, extensionName, flowType, pluginCodeFormat);
        } catch (ScaffoldingValidationException e) {
            fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restServicesDir = restDir.resolve("services");
        assertTrue(restServicesDir.toFile().exists());
        Path restExtensionFile = restServicesDir.resolve(extensionName + "." + pluginCodeFormat);
        assertTrue(restExtensionFile.toFile().exists());
        Path restExtensionMetadataDir = restServicesDir.resolve("metadata");
        assertTrue(restExtensionMetadataDir.toFile().exists());
        Path restExtensionMetadataFile = restExtensionMetadataDir.resolve(extensionName + ".xml");
        assertTrue(restExtensionMetadataFile.toFile().exists());
    }

    @Test
    public void createXqyRestTransform() throws IOException {
        String entityName = "my-fun-test";
        String transformName = "myTransform";
        FlowType flowType = FlowType.HARMONIZE;
        CodeFormat pluginCodeFormat = CodeFormat.XQUERY;
        try {
            scaffolding.createRestTransform(entityName, transformName, flowType, pluginCodeFormat);
        } catch (ScaffoldingValidationException e) {
            fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restTransformDir = restDir.resolve("transforms");
        assertTrue(restTransformDir.toFile().exists());
        Path restTransformFile = restTransformDir.resolve(transformName + "." + pluginCodeFormat);
        assertTrue(restTransformFile.toFile().exists());
    }

    @Test
    public void createSjsRestTransform() throws IOException {
        String entityName = "my-fun-test";
        String transformName = "myTransform";
        FlowType flowType = FlowType.HARMONIZE;
        CodeFormat pluginCodeFormat = CodeFormat.JAVASCRIPT;
        try {
            scaffolding.createRestTransform(entityName, transformName, flowType, pluginCodeFormat);
        } catch (ScaffoldingValidationException e) {
            fail(e.getMessage());
        }
        Path restDir = Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), "REST").toAbsolutePath().normalize();
        assertTrue(restDir.toFile().exists());
        Path restTransformDir = restDir.resolve("transforms");
        assertTrue(restTransformDir.toFile().exists());
        Path restTransformFile = restTransformDir.resolve(transformName + "." + pluginCodeFormat);
        assertTrue(restTransformFile.toFile().exists());
    }

}

