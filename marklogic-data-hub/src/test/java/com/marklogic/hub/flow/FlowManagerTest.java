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
package com.marklogic.hub.flow;

import com.marklogic.bootstrap.Installer;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.main.MainPlugin;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.json.JSONException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;
import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.assertEquals;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class FlowManagerTest extends HubTestBase {

    @Autowired
    private FlowManager fm;

    @Autowired
    private Scaffolding scaffolding;
    
    @BeforeAll
    public static void runOnce() {
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setup() throws IOException {
        basicSetup();
        getDataHubAdminConfig();
        enableDebugging();

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);

        addStagingDocs();
        installModules();
    }

    private void installModules() {
        HashMap<String, String> modules = new HashMap<>();
        modules.put(
            "/entities/test/harmonize/my-test-flow1/collector.xqy",
            "flow-manager-test/my-test-flow1/collector.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow1/main.xqy",
            "flow-manager-test/my-test-flow1/main.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow1/content.xqy",
            "flow-manager-test/my-test-flow1/content.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow1/headers.xqy",
            "flow-manager-test/my-test-flow1/headers.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow1/triples.xqy",
            "flow-manager-test/my-test-flow1/triples.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow1/writer.xqy",
            "flow-manager-test/my-test-flow1/writer.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow1/my-test-flow1.xml",
            "flow-manager-test/my-test-flow1/my-test-flow1.xml");
        modules.put(
            "/entities/test/harmonize/my-test-flow2/collector.xqy",
            "flow-manager-test/my-test-flow1/collector.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow2/main.xqy",
            "flow-manager-test/my-test-flow1/main.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow2/content.xqy",
            "flow-manager-test/my-test-flow1/content.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow2/headers.xqy",
            "flow-manager-test/my-test-flow1/headers.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow2/triples.xqy",
            "flow-manager-test/my-test-flow1/triples.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow2/writer.xqy",
            "flow-manager-test/my-test-flow1/writer.xqy");
        modules.put(
            "/entities/test/harmonize/my-test-flow2/my-test-flow2.xml",
            "flow-manager-test/my-test-flow1/my-test-flow2.xml");
        installModules(modules);
    }

    private void addStagingDocs() {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        meta.getPermissions().add(getDataHubAdminConfig().getFlowOperatorRoleName(), READ, UPDATE, EXECUTE);
        installStagingDoc("/employee1.xml", meta, "flow-manager-test/input/employee1.xml");
        installStagingDoc("/employee2.xml", meta, "flow-manager-test/input/employee2.xml");
    }

    private void addFinalDocs() {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        meta.getPermissions().add(getDataHubAdminConfig().getFlowOperatorRoleName(), READ, UPDATE, EXECUTE);
        installFinalDoc("/employee1.xml", meta, "flow-manager-test/input/employee1.xml");
        installFinalDoc("/employee2.xml", meta, "flow-manager-test/input/employee2.xml");
    }

    @Test
    public void testFlowFromXml() {
        Document d = getXmlFromResource("flow-manager-test/simple-flow.xml");

        Flow flow = FlowManager.flowFromXml(d.getDocumentElement());
        assertEquals(flow.getName(), "my-test-flow");
        assertEquals(flow.getCollector().getCodeFormat(), CodeFormat.XQUERY);
        assertEquals(flow.getCollector().getModule(), "/entities/test/harmonize/my-test-flow/collector.xqy");
        assertEquals(flow.getMain().getCodeFormat(), CodeFormat.XQUERY);
        assertEquals(flow.getMain().getModule(), "/entities/test/harmonize/my-test-flow/main.xqy");
    }

    @Test
    public void testFlowToXml() throws IOException, ParserConfigurationException, SAXException {
        Flow flow = FlowBuilder.newFlow()
            .withEntityName("test")
            .withName("my-test-flow")
            .withType(FlowType.HARMONIZE)
            .withDataFormat(DataFormat.XML)
            .withCodeFormat(CodeFormat.XQUERY)
            .build();
        String expected = getResource("flow-manager-test/simple-flow.xml");
        String actual = flow.serialize();
        assertXMLEqual(expected, actual);
    }

    @Test
    public void testGetLocalFlows() throws IOException {
        createProjectDir(PROJECT_PATH);
        scaffolding.createEntity("my-entity");

        assertEquals(0, fm.getLocalFlows().size());

        CodeFormat[] codeFormats = new CodeFormat[] { CodeFormat.JAVASCRIPT, CodeFormat.XQUERY };
        DataFormat[] dataFormats = new DataFormat[] { DataFormat.JSON, DataFormat.XML };
        FlowType[] flowTypes = new FlowType[] { FlowType.INPUT, FlowType.HARMONIZE };
        for (CodeFormat codeFormat : codeFormats) {
            for (DataFormat dataFormat : dataFormats) {
                for (FlowType flowType : flowTypes) {
                    String flowName = flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
                    scaffolding.createFlow("my-entity", flowName, flowType, codeFormat, dataFormat, false);
                }
            }
        }

        List<Flow> flows = fm.getLocalFlows();
        assertEquals(8, flows.size());

        for (Flow flow : flows) {
            assertEquals("my-entity", flow.getEntityName());
        }

        FileUtils.deleteDirectory(Paths.get("./del-me-dir").toFile());
    }

    @Test
    public void testGetFlowFromProperties() throws IOException {
        scaffolding.createEntity("my-entity");

        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String flowName = flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
            scaffolding.createFlow("my-entity", flowName, flowType, codeFormat, dataFormat, false);
        });


        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String flowName = flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
            Path propertiesFile = Paths.get(PROJECT_PATH, "plugins", "entities", "my-entity", flowType.toString(), flowName, flowName + ".properties");
            Flow flow = fm.getFlowFromProperties(propertiesFile);
            assertEquals(flowName, flow.getName());
            assertEquals("my-entity", flow.getEntityName());
            assertEquals(codeFormat, flow.getCodeFormat());
            assertEquals(dataFormat, flow.getDataFormat());
            assertEquals(flowType, flow.getType());
        });

        deleteProjectDir();
    }

    @Test
    public void testGetFlows() {
        getDataHub().clearUserModules();

        installHubModules();

        installModule("/entities/test/harmonize/my-test-flow1/my-test-flow1.xml", "flow-manager-test/my-test-flow1/my-test-flow1.xml");
        installModule("/entities/test/harmonize/my-test-flow2/my-test-flow2.xml", "flow-manager-test/my-test-flow1/my-test-flow2.xml");

        List<Flow> flows = fm.getFlows("test");
        assertEquals(2, flows.size());

        // flow 1
        Flow flow1 = flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());
        assertEquals(CodeFormat.XQUERY, flow1.getCodeFormat());
        assertEquals(DataFormat.XML, flow1.getDataFormat());
        assertEquals("test", flow1.getEntityName());
        assertEquals(FlowType.HARMONIZE, flow1.getType());

        Collector c = flow1.getCollector();
        assertEquals(CodeFormat.XQUERY, c.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector.xqy", c.getModule());

        MainPlugin main = flow1.getMain();
        assertEquals(CodeFormat.XQUERY, main.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/main.xqy", main.getModule());

        // flow 2
        Flow flow2 = flows.get(1);
        assertEquals("my-test-flow2", flow2.getName());
        assertEquals(CodeFormat.XQUERY, flow2.getCodeFormat());
        assertEquals(DataFormat.XML, flow2.getDataFormat());
        assertEquals("test", flow2.getEntityName());
        assertEquals(FlowType.HARMONIZE, flow2.getType());

        c = flow2.getCollector();
        assertEquals(CodeFormat.XQUERY, c.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector.xqy", c.getModule());

        main = flow2.getMain();
        assertEquals(CodeFormat.XQUERY, main.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/main.xqy", main.getModule());
    }

    @Test
    public void getTestFlow() {
        installModule("/entities/test/harmonize/my-test-flow1/my-test-flow1.xml", "flow-manager-test/my-test-flow1/my-test-flow1-json.xml");

        Flow flow1 = fm.getFlow("test", "my-test-flow1");
        assertEquals("my-test-flow1", flow1.getName());
        assertEquals(CodeFormat.JAVASCRIPT, flow1.getCodeFormat());
        assertEquals(DataFormat.JSON, flow1.getDataFormat());
        assertEquals("test", flow1.getEntityName());
        assertEquals(FlowType.HARMONIZE, flow1.getType());

        Collector c = flow1.getCollector();
        assertEquals(CodeFormat.JAVASCRIPT, c.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector.sjs", c.getModule());

        MainPlugin main = flow1.getMain();
        assertEquals(CodeFormat.JAVASCRIPT, main.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/main.sjs", main.getModule());
    }

    @Test
    public void testRunFlow() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        addStagingDocs();
        installModules();
        assertEquals(2, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        getHubFlowRunnerConfig();
        Flow flow1 = fm.getFlow("test", "my-test-flow1");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();
        getDataHubAdminConfig();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());
        DocumentMetadataHandle metadata = finalDocMgr.readMetadata("/employee1.xml", new DocumentMetadataHandle());
        DocumentMetadataHandle.DocumentPermissions permissions = metadata.getPermissions();
        assertEquals( permissions.get("harmonized-reader").toString(),     "[READ]", "Default permissions on harmonized documents should contain harmonized-reader/read");
        assertEquals(permissions.get("harmonized-updater").toString(), "[UPDATE]", "Default permissions on harmonized documents should contain harmonized-updater/update");
    }

    @Test
    public void testRunFlowWithBackwards() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        addFinalDocs();
        installModules();
        assertEquals(0, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        getHubFlowRunnerConfig();
        Flow flow1 = fm.getFlow("test", "my-test-flow1");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1)
            .withSourceClient(getHubFlowRunnerConfig().newReverseFlowClient())
            .withDestinationDatabase(HubConfig.DEFAULT_STAGING_NAME);
        flowRunner.run();
        flowRunner.awaitCompletion();
        getDataHubAdminConfig();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized1.xml"), stagingDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized2.xml"), stagingDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());
        DocumentMetadataHandle metadata = stagingDocMgr.readMetadata("/employee1.xml", new DocumentMetadataHandle());
        DocumentMetadataHandle.DocumentPermissions permissions = metadata.getPermissions();
        assertEquals(permissions.get("harmonized-reader").toString(), "[READ]", "Default permissions on harmonized documents should contain harmonized-reader/read");
        assertEquals(permissions.get("harmonized-updater").toString(), "[UPDATE]", "Default permissions on harmonized documents should contain harmonized-updater/update");
    }

    @Test
    public void testRunFlowWithHeader() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        addStagingDocs();
        HashMap<String, String> modules = new HashMap<>();
        modules.put("/entities/test/harmonize/my-test-flow-with-header/flow.xml", "flow-manager-test/my-test-flow-with-header/flow.xml");
        modules.put("/entities/test/harmonize/my-test-flow-with-header/collector.xqy", "flow-manager-test/my-test-flow-with-header/collector.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-header/content.xqy", "flow-manager-test/my-test-flow-with-header/content.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-header/headers.xqy", "flow-manager-test/my-test-flow-with-header/headers.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-header/triples.xqy", "flow-manager-test/my-test-flow-with-header/triples.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-header/writer.xqy", "flow-manager-test/my-test-flow-with-header/writer.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-header/main.xqy", "flow-manager-test/my-test-flow-with-header/main.xqy");
        installModules(modules);

        assertEquals(2, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        getHubFlowRunnerConfig();
        Flow flow1 = fm.getFlow("test", "my-test-flow-with-header");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();
        getDataHubAdminConfig();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-header/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-header/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-with-header/\")");
    }

    @Test
    public void testRunFlowWithAll() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        addStagingDocs();
        HashMap<String, String> modules = new HashMap<>();
        modules.put("/entities/test/harmonize/my-test-flow-with-all/my-test-flow-with-all.xml", "flow-manager-test/my-test-flow-with-all/my-test-flow-with-all.xml");
        modules.put("/entities/test/harmonize/my-test-flow-with-all/collector.xqy", "flow-manager-test/my-test-flow-with-all/collector.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-all/headers.xqy", "flow-manager-test/my-test-flow-with-all/headers.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-all/content.xqy", "flow-manager-test/my-test-flow-with-all/content.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-all/triples.xqy", "flow-manager-test/my-test-flow-with-all/triples.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-all/writer.xqy", "flow-manager-test/my-test-flow-with-all/writer.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-with-all/main.xqy", "flow-manager-test/my-test-flow-with-all/main.xqy");
        installModules(modules);

        assertEquals(2, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        getHubFlowRunnerConfig();
        Flow flow1 = fm.getFlow("test", "my-test-flow-with-all");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();
        getDataHubAdminConfig();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-with-all/\")");
    }


    @Test
    public void testHasLegacyflows() throws IOException, InterruptedException, ParserConfigurationException, SAXException, JSONException {

        scaffolding.createEntity("new-entity");
        scaffolding.createFlow("new-entity", "new-flow", FlowType.HARMONIZE, CodeFormat.XQUERY, DataFormat.XML, false);
        assertEquals(0, fm.getLegacyFlows().size());

        Path projectPath = Paths.get(PROJECT_PATH);
        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            Path dir = projectPath.resolve("plugins/entities/my-fun-test/" + flowType.toString());
            String flowName = "legacy-" + codeFormat.toString() + "-" + dataFormat.toString() + "-" + flowType.toString() + "-flow";
            try {
                FileUtils.copyDirectory(getResourceFile("scaffolding-test/" + flowName), dir.resolve(flowName).toFile());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });

        List<String> legacyFlows = fm.getLegacyFlows();
        assertEquals(8, legacyFlows.size());
        legacyFlows.sort(String::compareToIgnoreCase);
        assertEquals("my-fun-test => legacy-sjs-json-harmonize-flow", legacyFlows.get(0));
        assertEquals("my-fun-test => legacy-sjs-json-input-flow", legacyFlows.get(1));
        assertEquals("my-fun-test => legacy-sjs-xml-harmonize-flow", legacyFlows.get(2));
        assertEquals("my-fun-test => legacy-sjs-xml-input-flow", legacyFlows.get(3));
        assertEquals("my-fun-test => legacy-xqy-json-harmonize-flow", legacyFlows.get(4));
        assertEquals("my-fun-test => legacy-xqy-json-input-flow", legacyFlows.get(5));
        assertEquals("my-fun-test => legacy-xqy-xml-harmonize-flow", legacyFlows.get(6));
        assertEquals("my-fun-test => legacy-xqy-xml-input-flow", legacyFlows.get(7));
    }
}
