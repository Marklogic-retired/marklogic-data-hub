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
package com.marklogic.hub.legacy.flow;

import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.collector.LegacyCollector;
import com.marklogic.hub.main.MainPlugin;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;
import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class LegacyFlowManagerTest extends AbstractHubCoreTest {

    @Autowired
    LegacyFlowManager fm;

    @Autowired
    Scaffolding scaffolding;

    @BeforeEach
    public void beforeEach() {
        runAsFlowDeveloper();
        enableDebugging();

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
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        meta.getPermissions().add(getHubConfig().getFlowOperatorRoleName(), READ, UPDATE, EXECUTE);
        installStagingDoc("/employee1.xml", meta, "flow-manager-test/input/employee1.xml");
        installStagingDoc("/employee2.xml", meta, "flow-manager-test/input/employee2.xml");
    }

    private void addFinalDocs() {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        meta.getPermissions().add(getHubConfig().getFlowOperatorRoleName(), READ, UPDATE, EXECUTE);
        installFinalDoc("/employee1.xml", meta, "flow-manager-test/input/employee1.xml");
        installFinalDoc("/employee2.xml", meta, "flow-manager-test/input/employee2.xml");
    }

    @Test
    public void testFlowFromXml() {
        Document d = getXmlFromResource("flow-manager-test/simple-flow.xml");

        LegacyFlow flow = LegacyFlowManager.flowFromXml(d.getDocumentElement());
        assertEquals(flow.getName(), "my-test-flow");
        assertEquals(flow.getCollector().getCodeFormat(), CodeFormat.XQUERY);
        assertEquals(flow.getCollector().getModule(), "/entities/test/harmonize/my-test-flow/collector.xqy");
        assertEquals(flow.getMain().getCodeFormat(), CodeFormat.XQUERY);
        assertEquals(flow.getMain().getModule(), "/entities/test/harmonize/my-test-flow/main.xqy");
    }

    @Test
    public void testFlowToXml() throws IOException, SAXException {
        LegacyFlow flow = LegacyFlowBuilder.newFlow()
            .withEntityName("test")
            .withName("my-test-flow")
            .withType(FlowType.HARMONIZE)
            .withDataFormat(DataFormat.XML)
            .withCodeFormat(CodeFormat.XQUERY)
            .build();
        String expected = getResource("flow-manager-test/simple-flow.xml");
        String actual = flow.serialize();
        assertTrue(actual.contains("<flow xmlns=\"http://marklogic.com/data-hub\">"),
            "Verifying that the default namespace was written before comparing the entire XML document");
        assertXMLEqual(expected, actual);
    }

    @Test
    public void testGetLocalFlows() throws IOException {
        try {
            scaffolding.createEntity("my-entity");
        } catch (DataHubProjectException e) {
            // Entity is already present
        }

        assertEquals(0, fm.getLocalFlows().size());

        CodeFormat[] codeFormats = new CodeFormat[]{CodeFormat.JAVASCRIPT, CodeFormat.XQUERY};
        DataFormat[] dataFormats = new DataFormat[]{DataFormat.JSON, DataFormat.XML};
        FlowType[] flowTypes = new FlowType[]{FlowType.INPUT, FlowType.HARMONIZE};
        for (CodeFormat codeFormat : codeFormats) {
            for (DataFormat dataFormat : dataFormats) {
                for (FlowType flowType : flowTypes) {
                    String flowName = flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
                    scaffolding.createLegacyFlow("my-entity", flowName, flowType, codeFormat, dataFormat, false);
                }
            }
        }

        List<LegacyFlow> flows = fm.getLocalFlows();
        assertEquals(8, flows.size());

        for (LegacyFlow flow : flows) {
            assertEquals("my-entity", flow.getEntityName());
        }

        FileUtils.deleteDirectory(Paths.get("./del-me-dir").toFile());
    }

    @Test
    public void testGetFlowFromProperties() {
        try {
            scaffolding.createEntity("my-entity");
        } catch (DataHubProjectException e) {
            // Entity is already present
        }

        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String flowName = flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
            scaffolding.createLegacyFlow("my-entity", flowName, flowType, codeFormat, dataFormat, false);
        });


        allCombos((codeFormat, dataFormat, flowType, useEs) -> {
            String flowName = flowType.toString() + "-" + codeFormat.toString() + "-" + dataFormat.toString();
            Path propertiesFile = Paths.get(getHubProject().getProjectDirString(),
                "plugins", "entities", "my-entity", flowType.toString(), flowName, flowName + ".properties");
            LegacyFlow flow = fm.getFlowFromProperties(propertiesFile);
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
        // The test flows for entityName "test" are deployed to ML via the installModules method called as part of JUnit's BeforeEach block

        List<LegacyFlow> flows = fm.getFlows("test");
        assertEquals(2, flows.size());

        // flow 1
        LegacyFlow flow1 = flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());
        assertEquals(CodeFormat.XQUERY, flow1.getCodeFormat());
        assertEquals(DataFormat.XML, flow1.getDataFormat());
        assertEquals("test", flow1.getEntityName());
        assertEquals(FlowType.HARMONIZE, flow1.getType());

        LegacyCollector c = flow1.getCollector();
        Assertions.assertEquals(CodeFormat.XQUERY, c.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector.xqy", c.getModule());

        MainPlugin main = flow1.getMain();
        Assertions.assertEquals(CodeFormat.XQUERY, main.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/main.xqy", main.getModule());

        // flow 2
        LegacyFlow flow2 = flows.get(1);
        assertEquals("my-test-flow2", flow2.getName());
        assertEquals(CodeFormat.XQUERY, flow2.getCodeFormat());
        assertEquals(DataFormat.XML, flow2.getDataFormat());
        assertEquals("test", flow2.getEntityName());
        assertEquals(FlowType.HARMONIZE, flow2.getType());

        c = flow2.getCollector();
        Assertions.assertEquals(CodeFormat.XQUERY, c.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector.xqy", c.getModule());

        main = flow2.getMain();
        Assertions.assertEquals(CodeFormat.XQUERY, main.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/main.xqy", main.getModule());
    }

    @Test
    public void getTestFlow() {
        installModule("/entities/test/harmonize/my-test-flow1/my-test-flow1.xml", "flow-manager-test/my-test-flow1/my-test-flow1-json.xml");

        LegacyFlow flow1 = fm.getFlow("test", "my-test-flow1");
        assertEquals("my-test-flow1", flow1.getName());
        assertEquals(CodeFormat.JAVASCRIPT, flow1.getCodeFormat());
        assertEquals(DataFormat.JSON, flow1.getDataFormat());
        assertEquals("test", flow1.getEntityName());
        assertEquals(FlowType.HARMONIZE, flow1.getType());

        LegacyCollector c = flow1.getCollector();
        Assertions.assertEquals(CodeFormat.JAVASCRIPT, c.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector.sjs", c.getModule());

        MainPlugin main = flow1.getMain();
        Assertions.assertEquals(CodeFormat.JAVASCRIPT, main.getCodeFormat());
        assertEquals("/entities/test/harmonize/my-test-flow1/main.sjs", main.getModule());
    }

    @Test
    public void testRunFlow() {
        addStagingDocs();
        installModules();
        runAsFlowOperator();
        LegacyFlow flow1 = fm.getFlow("test", "my-test-flow1");
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        runAsFlowDeveloper();
        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());
        DocumentMetadataHandle metadata = finalDocMgr.readMetadata("/employee1.xml", new DocumentMetadataHandle());
        DocumentMetadataHandle.DocumentPermissions permissions = metadata.getPermissions();
        assertEquals(permissions.get("harmonized-reader").toString(), "[READ]", "Default permissions on harmonized documents should contain harmonized-reader/read");
        assertEquals(permissions.get("harmonized-updater").toString(), "[UPDATE]", "Default permissions on harmonized documents should contain harmonized-updater/update");
    }

    @Test
    public void testRunFlowWithBackwards() {
        addFinalDocs();
        installModules();
        runAsFlowOperator();
        LegacyFlow flow1 = fm.getFlow("test", "my-test-flow1");
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1)
            .withSourceClient(getHubConfig().newReverseFlowClient())
            .withDestinationDatabase(HubConfig.DEFAULT_STAGING_NAME);
        flowRunner.run();
        flowRunner.awaitCompletion();

        runAsFlowDeveloper();
        GenericDocumentManager stagingDocMgr = getHubClient().getStagingClient().newDocumentManager();
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized1.xml"), stagingDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized2.xml"), stagingDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());
        DocumentMetadataHandle metadata = stagingDocMgr.readMetadata("/employee1.xml", new DocumentMetadataHandle());
        DocumentMetadataHandle.DocumentPermissions permissions = metadata.getPermissions();
        assertEquals(permissions.get("harmonized-reader").toString(), "[READ]", "Default permissions on harmonized documents should contain harmonized-reader/read");
        assertEquals(permissions.get("harmonized-updater").toString(), "[UPDATE]", "Default permissions on harmonized documents should contain harmonized-updater/update");
    }

    @Test
    public void testRunFlowWithHeader() {
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

        runAsFlowOperator();
        LegacyFlow flow1 = fm.getFlow("test", "my-test-flow-with-header");
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        runAsFlowDeveloper();
        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-header/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-header/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-with-header/\")");
    }

    @Test
    public void testRunFlowWithAll() {
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

        final int stagingCount = getStagingDocCount();
        final int finalCount = getFinalDocCount();
        runAsFlowOperator();
        LegacyFlow flow1 = fm.getFlow("test", "my-test-flow-with-all");
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        runAsFlowDeveloper();
        assertEquals(stagingCount, getStagingDocCount());
        assertEquals(2 + finalCount, getFinalDocCount());
        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-with-all/\")");
    }

    @Test
    public void testRunFlowNamespaceXMLSJS() {
        addStagingDocs();
        HashMap<String, String> modules = new HashMap<>();
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-sjs/flow.xml", "flow-manager-test/my-test-flow-ns-xml-sjs/flow.xml");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-sjs/collector.sjs", "flow-manager-test/my-test-flow-ns-xml-sjs/collector.sjs");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-sjs/headers.sjs", "flow-manager-test/my-test-flow-ns-xml-sjs/headers.sjs");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-sjs/content.sjs", "flow-manager-test/my-test-flow-ns-xml-sjs/content.sjs");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-sjs/triples.sjs", "flow-manager-test/my-test-flow-ns-xml-sjs/triples.sjs");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-sjs/writer.sjs", "flow-manager-test/my-test-flow-ns-xml-sjs/writer.sjs");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-sjs/main.sjs", "flow-manager-test/my-test-flow-ns-xml-sjs/main.sjs");
        installModules(modules);

        runAsFlowOperator();
        LegacyFlow flow1 = fm.getFlow("test", "my-test-flow-ns-xml-sjs");
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        runAsFlowDeveloper();
        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-ns-xml/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-ns-xml/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-ns-xml-sjs/\")");
    }

    @Test
    public void testRunFlowNamespaceXMLXQY() {
        addStagingDocs();
        HashMap<String, String> modules = new HashMap<>();
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-xqy/flow.xml", "flow-manager-test/my-test-flow-ns-xml-xqy/flow.xml");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-xqy/collector.xqy", "flow-manager-test/my-test-flow-ns-xml-xqy/collector.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-xqy/headers.xqy", "flow-manager-test/my-test-flow-ns-xml-xqy/headers.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-xqy/content.xqy", "flow-manager-test/my-test-flow-ns-xml-xqy/content.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-xqy/triples.xqy", "flow-manager-test/my-test-flow-ns-xml-xqy/triples.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-xqy/writer.xqy", "flow-manager-test/my-test-flow-ns-xml-xqy/writer.xqy");
        modules.put("/entities/test/harmonize/my-test-flow-ns-xml-xqy/main.xqy", "flow-manager-test/my-test-flow-ns-xml-xqy/main.xqy");
        installModules(modules);

        runAsFlowOperator();
        LegacyFlow flow1 = fm.getFlow("test", "my-test-flow-ns-xml-xqy");
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow1)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        runAsFlowDeveloper();
        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-ns-xml/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-ns-xml/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-ns-xml-xqy/\")");
    }

    private void installModules(Map<String, String> modules) {
        GenericDocumentManager modMgr = getHubClient().getModulesClient().newDocumentManager();
        DocumentWriteSet writeSet = modMgr.newWriteSet();
        modules.forEach((String path, String localPath) -> {
            InputStreamHandle handle = new InputStreamHandle(HubTestBase.class.getClassLoader().getResourceAsStream(localPath));
            String ext = FilenameUtils.getExtension(path);
            switch (ext) {
                case "xml":
                    handle.setFormat(Format.XML);
                    break;
                case "json":
                    handle.setFormat(Format.JSON);
                    break;
                default:
                    handle.setFormat(Format.TEXT);
            }

            writeSet.add(path, buildMetadataWithModulePermissions(), handle);
        });
        modMgr.write(writeSet);
        writeSet.parallelStream().forEach((writeOp) -> {
            IOUtils.closeQuietly((InputStreamHandle) writeOp.getContent());
        });
        clearFlowCache();
    }
}
