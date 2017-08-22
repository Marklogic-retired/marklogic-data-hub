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
package com.marklogic.hub;

import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.main.MainPlugin;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.*;

public class FlowManagerTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        installHub();
        enableDebugging();

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installStagingDoc("/employee1.xml", meta, "flow-manager-test/input/employee1.xml");
        installStagingDoc("/employee2.xml", meta, "flow-manager-test/input/employee2.xml");

        installModules();
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
    }

    private static void installModules() {
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

    private static void addStagingDocs() throws IOException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installStagingDoc("/employee1.xml", meta, "flow-manager-test/input/employee1.xml");
        installStagingDoc("/employee2.xml", meta, "flow-manager-test/input/employee2.xml");
    }

    private static void addFinalDocs() throws IOException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installFinalDoc("/employee1.xml", meta, getResource("flow-manager-test/input/employee1.xml"));
        installFinalDoc("/employee2.xml", meta, getResource("flow-manager-test/input/employee2.xml"));
    }

    @Test
    public void testFlowFromXml() throws IOException, ParserConfigurationException, SAXException {
        Document d = getXmlFromResource("flow-manager-test/simple-flow.xml");

        Flow flow = FlowManager.flowFromXml(d.getDocumentElement());
        assertThat(flow, instanceOf(Flow.class));
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
    public void testGetFlows() {
        clearDatabases(HubConfig.DEFAULT_MODULES_DB_NAME);

        getDataHub().installHubModules();

        installModule("/entities/test/harmonize/my-test-flow1/my-test-flow1.xml", "flow-manager-test/my-test-flow1/my-test-flow1.xml");
        installModule("/entities/test/harmonize/my-test-flow2/my-test-flow2.xml", "flow-manager-test/my-test-flow1/my-test-flow2.xml");

        FlowManager fm = new FlowManager(getHubConfig());
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

        FlowManager fm = new FlowManager(getHubConfig());
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
        FlowManager fm = new FlowManager(getHubConfig());
        Flow flow1 = fm.getFlow("test", "my-test-flow1");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());
    }

    @Test
    public void testRunFlowWithBackwards() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        addFinalDocs();
        installModules();
        assertEquals(0, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        FlowManager fm = new FlowManager(getHubConfig());
        Flow flow1 = fm.getFlow("test", "my-test-flow1");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1)
            .withSourceClient(getHubConfig().newFinalClient())
            .withDestinationDatabase(HubConfig.DEFAULT_STAGING_NAME);
        flowRunner.run();
        flowRunner.awaitCompletion();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized1.xml"), stagingDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized2.xml"), stagingDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());
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
        FlowManager fm = new FlowManager(getHubConfig());
        Flow flow1 = fm.getFlow("test", "my-test-flow-with-header");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();
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
        FlowManager fm = new FlowManager(getHubConfig());
        Flow flow1 = fm.getFlow("test", "my-test-flow-with-all");
        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-with-all/\")");
    }


    @Test
    public void testHasLegacyflows() throws IOException {
        FlowManager fm = new FlowManager(getHubConfig());

        Scaffolding scaffolding = new Scaffolding(getHubConfig().projectDir, stagingClient);
        scaffolding.createEntity("new-entity");
        scaffolding.createFlow("new-entity", "new-flow", FlowType.HARMONIZE, CodeFormat.XQUERY, DataFormat.XML);
        assertEquals(0, fm.getLegacyFlows().size());

        Path projectPath = Paths.get(PROJECT_PATH);
        Path inputDir = projectPath.resolve("plugins/entities/my-fun-test/input");
        Path harmonizeDir = projectPath.resolve("plugins/entities/my-fun-test/harmonize");
        FileUtils.copyDirectory(getResourceFile("scaffolding-test/legacy-input-flow"), inputDir.resolve("legacy-input-flow").toFile());
        FileUtils.copyDirectory(getResourceFile("scaffolding-test/legacy-harmonize-flow"), harmonizeDir.resolve("legacy-harmonize-flow").toFile());

        List<String> legacyFlows = fm.getLegacyFlows();
        assertEquals(2, legacyFlows.size());
        assertEquals("my-fun-test => legacy-input-flow", legacyFlows.get(0));
        assertEquals("my-fun-test => legacy-harmonize-flow", legacyFlows.get(1));
    }
}
