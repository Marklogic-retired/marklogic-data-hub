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
package com.marklogic.hub;

import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.impl.ScaffoldingImpl;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.Installer;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.platform.runner.JUnitPlatform;
import org.junit.runner.RunWith;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

@RunWith(JUnitPlatform.class)
public class ScaffoldingE2E extends HubTestBase {


    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();
    private static File pluginDir = projectPath.resolve("plugins").toFile();

    @BeforeAll
    public static void setupHub() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().installHubOnce();
    }

    @AfterAll
    public static void teardown() {
        new Installer().uninstallHub();
    }

    @BeforeEach
    public void setup() throws IOException {
        deleteProjectDir();

        createProjectDir();
    }

    private void createFlow(CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEsModel) {
        String entityName = "my-fun-test";
        String flowName = "test-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();

        ScaffoldingImpl scaffolding = new ScaffoldingImpl(projectDir.toString(), finalClient);

        Path entityDir = scaffolding.getEntityDir(entityName);
        assertFalse(entityDir.toFile().exists(), entityDir.toString() + " should not exist but does");

        Path employeeDir = scaffolding.getEntityDir("employee");
        assertFalse(employeeDir.toFile().exists());

        scaffolding.createEntity(entityName);
        scaffolding.createEntity("employee");
        assertTrue(projectDir.exists());
        assertTrue(entityDir.toFile().exists());
        assertTrue(employeeDir.toFile().exists());
        assertEquals(Paths.get(pluginDir.toString(), "entities", entityName), entityDir);

        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"), employeeDir.resolve("employee.entity.json").toFile());
        FileUtil.copy(getResourceStream("scaffolding-test/" + entityName + ".json"), entityDir.resolve(entityName + ".entity.json").toFile());

        installUserModules(getHubConfig(), true);

        scaffolding.createFlow(entityName, flowName, flowType, codeFormat, dataFormat, useEsModel);
        Path flowDir = scaffolding.getFlowDir(entityName, flowName, flowType);
        assertEquals(Paths.get(pluginDir.toString(), "entities", entityName, flowType.toString(), flowName), flowDir);
        assertTrue(flowDir.toFile().exists());

        Path flowDescriptor = flowDir.resolve(flowName + ".properties");
        assertTrue(flowDescriptor.toFile().exists());

        Properties properties = new Properties();
        try {
            FileInputStream fis = new FileInputStream(flowDescriptor.toFile());
            properties.load(fis);
            fis.close();
        } catch(IOException e) {
            throw new RuntimeException(e);
        }

        int expectedPropertiesCount = flowType.equals(FlowType.INPUT) ? 4 : 6;
        assertEquals(expectedPropertiesCount, properties.keySet().size());
        assertEquals(dataFormat.toString(), properties.get("dataFormat"));
        assertEquals(codeFormat.toString(), properties.get("codeFormat"));
        if (flowType.equals(FlowType.HARMONIZE)) {
            assertEquals(codeFormat.toString(), properties.get("collectorCodeFormat"));
            assertEquals("collector." + codeFormat.toString(), properties.get("collectorModule"));
        }
        assertEquals(codeFormat.toString(), properties.get("mainCodeFormat"));
        assertEquals("main." + codeFormat.toString(), properties.get("mainModule"));

        Path defaultCollector = flowDir.resolve("collector." + codeFormat.toString());
        if (flowType.equals(FlowType.INPUT)) {
            assertFalse(defaultCollector.toFile().exists());
        }
        else {
            assertTrue(defaultCollector.toFile().exists());
        }

        Path defaultContent = flowDir.resolve("content." + codeFormat.toString());
        assertTrue(defaultContent.toFile().exists());

        if (useEsModel) {
            try {
                assertEquals(
                    getResource("scaffolding-test/es-" + flowType.toString() + "-content." + codeFormat.toString())
                        .replaceAll("\\s+", " ")
                        .replaceAll("[\r\n]", ""),
                    FileUtils.readFileToString(defaultContent.toFile())
                        .replaceAll("\\s+", " ")
                        .replaceAll("[\r\n]", ""));
            }
            catch(IOException e) {
                throw new RuntimeException(e);
            }
        }

        Path defaultHeaders = flowDir.resolve("headers." + codeFormat.toString());
        assertTrue(defaultHeaders.toFile().exists());

        Path triplesContent = flowDir.resolve("triples." + codeFormat.toString());
        assertTrue(triplesContent.toFile().exists());

        Path writer = flowDir.resolve("writer." + codeFormat.toString());
        if (flowType.equals(FlowType.INPUT)) {
            assertFalse(writer.toFile().exists());
        }
        else {
            assertTrue(writer.toFile().exists());
        }

        Path main = flowDir.resolve("main." + codeFormat.toString());
        assertTrue(main.toFile().exists());
    }

    private void createInputFlow(CodeFormat codeFormat, DataFormat dataFormat, boolean useEsModel) throws IOException, SAXException {
        createFlow(codeFormat, dataFormat, FlowType.INPUT, useEsModel);
    }

    private void createHarmonizeFlow(CodeFormat codeFormat, DataFormat dataFormat, boolean useEsModel) throws IOException, SAXException {
        createFlow(codeFormat, dataFormat, FlowType.HARMONIZE, useEsModel);
    }

    @TestFactory
    public List<DynamicTest> generateFlowTests() {
        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String flowName = "test-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                FileUtils.deleteDirectory(projectDir);
                createFlow(codeFormat, dataFormat, flowType, true);
            }));
        });

        return tests;
    }

}
