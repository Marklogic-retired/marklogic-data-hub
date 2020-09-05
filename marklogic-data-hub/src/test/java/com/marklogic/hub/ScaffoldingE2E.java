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
package com.marklogic.hub;

import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;
import org.junit.jupiter.api.parallel.Execution;
import org.junit.jupiter.api.parallel.ExecutionMode;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;

// TestFactory doesn't play nice with support for parallel tests yet, so forcing same thread execution
@Execution(ExecutionMode.SAME_THREAD)
public class ScaffoldingE2E extends AbstractHubCoreTest {

    @Autowired
    Scaffolding scaffolding;

    private void installEntity() {
        String entityName = "my-fun-test";

        Path entityDir = getHubProject().getHubEntitiesDir();

        scaffolding.createEntity(entityName);
        scaffolding.createEntity("employee");
        assertTrue(entityDir.toFile().exists());

        FileUtil.copy(getResourceStream("scaffolding-test/employee.entity.json"), entityDir.resolve("employee.entity.json").toFile());
        FileUtil.copy(getResourceStream("scaffolding-test/" + entityName + ".json"), entityDir.resolve(entityName + ".entity.json").toFile());

        installUserModules(runAsFlowDeveloper(), true);

    }
    private void createFlow(CodeFormat codeFormat, DataFormat dataFormat, FlowType flowType, boolean useEsModel) {
        String entityName = "my-fun-test";
        String flowName = "test-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();

        scaffolding.createLegacyFlow(entityName, flowName, flowType, codeFormat, dataFormat, useEsModel);
        Path flowDir = scaffolding.getLegacyFlowDir(entityName, flowName, flowType);
        assertEquals(Paths.get(getHubProject().getProjectDir().resolve("plugins").toString(), "entities", entityName, flowType.toString(), flowName), flowDir);
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
                // FIXME every time the codegen changes these assertions break.  is that what we really want?
                assertEquals(
                    getResource("scaffolding-test/es-" + flowType.toString() + "-content." + codeFormat.toString())
                        .replaceAll("\\s+", " ")
                        .replaceAll("[\r\n]", "").trim(),
                    FileUtils.readFileToString(defaultContent.toFile())
                        .replaceAll("\\s+", " ")
                        .replaceAll("[\r\n]", "").trim());
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

    @TestFactory
    public List<DynamicTest> generateFlowTests() {
        installEntity();
        List<DynamicTest> tests = new ArrayList<>();
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String flowName = "test-" + flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
            tests.add(DynamicTest.dynamicTest(flowName, () -> {
                FileUtils.deleteDirectory(getHubProject().getProjectDir().toFile());
                createFlow(codeFormat, dataFormat, flowType, true);
            }));
        });

        return tests;
    }

}
