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
import com.marklogic.client.io.Format;
import com.marklogic.hub.collector.QueryCollector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.hub.plugin.*;
import com.marklogic.hub.writer.DefaultWriter;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamException;
import java.io.IOException;
import java.util.List;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.*;

public class FlowManagerTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        clearDb(HubConfig.DEFAULT_STAGING_NAME);
        clearDb(HubConfig.DEFAULT_FINAL_NAME);
        clearDb(HubConfig.DEFAULT_MODULES_DB_NAME);

        installHub();

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installStagingDoc("/employee1.xml", meta, getResource("flow-manager-test/input/employee1.xml"));
        installStagingDoc("/employee2.xml", meta, getResource("flow-manager-test/input/employee2.xml"));
        runInModules("xdmp:directory-create(\"/entities/test/harmonize/my-test-flow1/collector/\"),"
                + "xdmp:directory-create(\"/entities/test/harmonize/my-test-flow1/headers/\"),"
                + "xdmp:directory-create(\"/entities/test/harmonize/my-test-flow1/triples/\"),"
                + "xdmp:directory-create(\"/entities/test/harmonize/my-test-flow1/content/\"),"
                + "xdmp:directory-create(\"/entities/test/harmonize/my-test-flow2/collector/\"),"
                + "xdmp:directory-create(\"/entities/test/harmonize/my-test-flow2/headers/\"),"
                + "xdmp:directory-create(\"/entities/test/harmonize/my-test-flow2/triples/\"),"
                + "xdmp:directory-create(\"/entities/test/harmonize/my-test-flow2/content/\")");
        installModule(
                "/entities/test/harmonize/my-test-flow1/collector/collector.xqy",
                "flow-manager-test/my-test-flow1/collector/collector.xqy");
        installModule(
                "/entities/test/harmonize/my-test-flow2/collector/collector.xqy",
                "flow-manager-test/my-test-flow1/collector/collector.xqy");
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
    }

    @After
    public void afterEach() {
        finalDocMgr.delete("/employee1.xml");
        finalDocMgr.delete("/employee2.xml");
    }

    @Test
    public void testSimpleFlowFromXml() throws IOException, ParserConfigurationException, SAXException {
        Document d = getXmlFromResource("flow-manager-test/simple-flow.xml");

        SimpleFlow flow = (SimpleFlow)FlowManager.flowFromXml(d.getDocumentElement());
        assertThat(flow, instanceOf(SimpleFlow.class));
        assertEquals(flow.getName(), "my-test-flow");
        assertNotNull(flow.getCollector());

        assertNotNull(flow.getContentPlugin());
        assertNotNull(flow.getHeaderPlugin());
        assertNotNull(flow.getTriplesPlugin());
    }

    @Test
    public void testEmptyFlow() throws IOException {
        runInModules("xdmp:directory-create(\"/entities/test/harmonize/empty-flow/\")");
        installModule("/entities/test/harmonize/empty-flow/empty-flow.xml", "flow-manager-test/my-test-flow1/my-test-flow1.xml");
        installModule("/entities/test/harmonize/empty-flow/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");

        FlowManager fm = new FlowManager(getHubConfig());
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "empty-flow");
        assertEquals("empty-flow", flow1.getName());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals(PluginType.XQUERY, c.getType());
        assertEquals("/entities/test/harmonize/empty-flow/collector/collector.xqy", c.getModule());

        ServerPlugin t = (ServerPlugin)flow1.getContentPlugin();
        assertEquals(PluginType.XQUERY, t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());

        assertNull(flow1.getHeaderPlugin());
        assertNull(flow1.getTriplesPlugin());

        DefaultWriter w = (DefaultWriter)flow1.getWriter();
        assertNotNull(w);

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/empty-flow/\")");
    }

    @Test
    public void testSimpleFlowToXml() throws IOException, ParserConfigurationException, SAXException {
        SimpleFlow flow = new SimpleFlow("test", "my-test-flow", FlowType.HARMONIZE, Format.XML);
        flow.setCollector(new QueryCollector());
        flow.setContentPlugin(new ContentPlugin());
        flow.setHeaderPlugin(new HeadersPlugin());
        flow.setTriplesPlugin(new TriplesPlugin());
        String expected = getResource("flow-manager-test/simple-flow.xml");
        String actual = flow.serialize(true);
        System.out.println(actual);
        assertXMLEqual(expected, actual);
    }

    @Test
    public void testGetFlows() {
        installModule("/entities/test/harmonize/my-test-flow1/my-test-flow1.xml", "flow-manager-test/my-test-flow1/my-test-flow1.xml");

        FlowManager fm = new FlowManager(getHubConfig());
        List<Flow> flows = fm.getFlows("test");
        assertEquals(2, flows.size());

        // flow 1
        SimpleFlow flow1 = (SimpleFlow)flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());
        assertEquals(Format.XML, flow1.getDataFormat());
        assertEquals("test", flow1.getEntityName());
        assertEquals(FlowType.HARMONIZE, flow1.getType());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals(PluginType.XQUERY, c.getType());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector/collector.xqy", c.getModule());

        ServerPlugin t = (ServerPlugin)flow1.getContentPlugin();
        assertEquals(PluginType.XQUERY, t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow1.getHeaderPlugin());
        assertNull(flow1.getTriplesPlugin());

        DefaultWriter w = (DefaultWriter)flow1.getWriter();
        assertNotNull(w);

        // flow 2
        SimpleFlow flow2 = (SimpleFlow)flows.get(1);
        assertEquals("my-test-flow2", flow2.getName());

        c = (ServerCollector)flow1.getCollector();
        assertEquals(PluginType.XQUERY, c.getType());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector/collector.xqy", c.getModule());

        t = (ServerPlugin)flow2.getContentPlugin();
        assertEquals(PluginType.XQUERY, t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow2.getHeaderPlugin());

        w = (DefaultWriter)flow2.getWriter();
        assertNotNull(w);

    }

    @Test
    public void getTestFlow() {
        installModule("/entities/test/harmonize/my-test-flow1/my-test-flow1.xml", "flow-manager-test/my-test-flow1/my-test-flow1-json.xml");

        FlowManager fm = new FlowManager(getHubConfig());
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow1");

        assertEquals("my-test-flow1", flow1.getName());
        assertEquals(Format.JSON, flow1.getDataFormat());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals(PluginType.XQUERY, c.getType());
        assertEquals("/entities/test/harmonize/my-test-flow1/collector/collector.xqy", c.getModule());

        ServerPlugin t = (ServerPlugin)flow1.getContentPlugin();
        assertEquals(PluginType.XQUERY, t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow1.getHeaderPlugin());
        assertNull(flow1.getTriplesPlugin());

        DefaultWriter w = (DefaultWriter)flow1.getWriter();
        assertNotNull(w);
    }

    @Test
    public void testRunFlow() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        installModule("/entities/test/harmonize/my-test-flow1/my-test-flow1.xml", "flow-manager-test/my-test-flow1/my-test-flow1.xml");
        assertEquals(2, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        JobFinishedListener listener = new JobFinishedListener();
        FlowManager fm = new FlowManager(getHubConfig());
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow1");
        fm.runFlow(flow1, 10, 1, listener);
        listener.waitForFinish();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());
    }

    @Test
    public void testRunFlowWithHeader() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        installModule("/entities/test/harmonize/my-test-flow-with-header/collector/collector.xqy", "flow-manager-test/my-test-flow-with-header/collector/collector.xqy");
        installModule("/entities/test/harmonize/my-test-flow-with-header/headers/headers.xqy", "flow-manager-test/my-test-flow-with-header/headers/headers.xqy");

        assertEquals(2, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        JobFinishedListener listener = new JobFinishedListener();
        FlowManager fm = new FlowManager(getHubConfig());
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow-with-header");
        fm.runFlow(flow1, 10, 1, listener);
        listener.waitForFinish();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-header/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-header/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-with-header/\")");
    }

    @Test
    public void testRunFlowWithAll() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        installModule("/entities/test/harmonize/my-test-flow-with-all/my-test-flow-with-all.xml", "flow-manager-test/my-test-flow-with-all/my-test-flow-with-all.xml");
        installModule("/entities/test/harmonize/my-test-flow-with-all/collector/collector.xqy", "flow-manager-test/my-test-flow-with-all/collector/collector.xqy");
        installModule("/entities/test/harmonize/my-test-flow-with-all/headers/headers.xqy", "flow-manager-test/my-test-flow-with-all/headers/headers.xqy");
        installModule("/entities/test/harmonize/my-test-flow-with-all/content/content.xqy", "flow-manager-test/my-test-flow-with-all/content/content.xqy");
        installModule("/entities/test/harmonize/my-test-flow-with-all/triples/triples.xqy", "flow-manager-test/my-test-flow-with-all/triples/triples.xqy");

        JobFinishedListener listener = new JobFinishedListener();
        assertEquals(2, getStagingDocCount());
        assertEquals(0, getFinalDocCount());
        FlowManager fm = new FlowManager(getHubConfig());
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow-with-all");
        fm.runFlow(flow1, 10, 1, listener);
        listener.waitForFinish();
        assertEquals(2, getStagingDocCount());
        assertEquals(2, getFinalDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized1.xml"), finalDocMgr.read("/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/harmonized-with-all/harmonized2.xml"), finalDocMgr.read("/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/entities/test/harmonize/my-test-flow-with-all/\")");
    }
}
