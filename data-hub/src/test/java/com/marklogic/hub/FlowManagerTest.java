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

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertThat;

import java.io.IOException;
import java.util.List;

import javax.xml.parsers.ParserConfigurationException;
import javax.xml.stream.XMLStreamException;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.collector.QueryCollector;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.hub.plugin.ContentPlugin;
import com.marklogic.hub.plugin.HeadersPlugin;
import com.marklogic.hub.plugin.TriplesPlugin;
import com.marklogic.hub.plugin.ServerPlugin;
import com.marklogic.hub.writer.DefaultWriter;

public class FlowManagerTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        DataHub dh = new DataHub(host, port, user, password);
        if (false == dh.isInstalled()) {
            dh.install();
        }

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installDoc("/incoming/employee1.xml", meta, getResource("flow-manager-test/input/employee1.xml"));
        installDoc("/incoming/employee2.xml", meta, getResource("flow-manager-test/input/employee2.xml"));
        runInModules(
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow1/collector/\")," +
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow1/headers/\")," +
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow1/triples/\")," +
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow1/content/\")," +
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow2/collector/\")," +
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow2/headers/\")," +
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow2/triples/\")," +
                "xdmp:directory-create(\"/ext/domains/test/canonical/my-test-flow2/content/\")");
        installModule("/ext/domains/test/canonical/my-test-flow1/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");
        installModule("/ext/domains/test/canonical/my-test-flow2/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");
    }

    @AfterClass
    public static void teardown() {
        runInModules("xdmp:directory-delete(\"/ext/\")");
        docMgr.delete("/incoming/employee1.xml");
        docMgr.delete("/incoming/employee2.xml");
    }

    @After
    public void afterEach() {
        docMgr.delete("/conformed/incoming/employee1.xml");
        docMgr.delete("/conformed/incoming/employee2.xml");
    }

    @Test
    public void testSimpleFlowFromXml() throws IOException, ParserConfigurationException, SAXException {
        Document d = getXmlFromResource("flow-manager-test/simple-flow.xml");

        FlowManager fm = new FlowManager(client);
        SimpleFlow flow = (SimpleFlow)fm.flowFromXml(d.getDocumentElement());
        assertThat(flow, instanceOf(SimpleFlow.class));
        assertEquals(flow.getName(), "my-test-flow");
        assertNotNull(flow.getCollector());

        assertNotNull(flow.getContentPlugin());
        assertNotNull(flow.getHeaderPlugin());
        assertNotNull(flow.getTriplesPlugin());
    }

    @Test
    public void testEmptyFlow() throws IOException {
        runInModules("xdmp:directory-create(\"/ext/domains/test/canonical/empty-flow/\")");
        installModule("/ext/domains/test/canonical/empty-flow/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");

        FlowManager fm = new FlowManager(client);
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "empty-flow");
        assertEquals("empty-flow", flow1.getName());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals("xquery", c.getType());
        assertEquals("/ext/domains/test/canonical/empty-flow/collector/collector.xqy", c.getModule());

        ServerPlugin t = (ServerPlugin)flow1.getContentPlugin();
        assertEquals("xquery", t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());

        assertNull(flow1.getHeaderPlugin());
        assertNull(flow1.getTriplesPlugin());

        DefaultWriter w = (DefaultWriter)flow1.getWriter();
        assertNotNull(w);

        runInModules("xdmp:directory-delete(\"/ext/domains/test/canonical/empty-flow/\")");
    }

    @Test
    public void testSimpleFlowToXml() throws IOException, ParserConfigurationException, SAXException {
        SimpleFlow flow = new SimpleFlow("test", "my-test-flow", "canonical");
        flow.setCollector(new QueryCollector());
        flow.setContentPlugin(new ContentPlugin());
        flow.setHeaderPlugin(new HeadersPlugin());
        flow.setTriplesPlugin(new TriplesPlugin());
        String expected = getResource("flow-manager-test/simple-flow.xml");
        String actual = flow.serialize();
        System.out.println(actual);
        assertXMLEqual(expected, actual);
    }

    @Test
    public void testGetFlows() {
        FlowManager fm = new FlowManager(client);
        List<Flow> flows = fm.getFlows("test");
        assertEquals(2, flows.size());

        // flow 1
        SimpleFlow flow1 = (SimpleFlow)flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals("xquery", c.getType());
        assertEquals("/ext/domains/test/canonical/my-test-flow1/collector/collector.xqy", c.getModule());

        ServerPlugin t = (ServerPlugin)flow1.getContentPlugin();
        assertEquals("xquery", t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow1.getHeaderPlugin());
        assertNull(flow1.getTriplesPlugin());

        DefaultWriter w = (DefaultWriter)flow1.getWriter();
        assertNotNull(w);

        // flow 2
        SimpleFlow flow2 = (SimpleFlow)flows.get(1);
        assertEquals("my-test-flow2", flow2.getName());

        c = (ServerCollector)flow1.getCollector();
        assertEquals("xquery", c.getType());
        assertEquals("/ext/domains/test/canonical/my-test-flow1/collector/collector.xqy", c.getModule());

        t = (ServerPlugin)flow2.getContentPlugin();
        assertEquals("xquery", t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow2.getHeaderPlugin());

        w = (DefaultWriter)flow2.getWriter();
        assertNotNull(w);

    }

    @Test
    public void getTestFlow() {
        FlowManager fm = new FlowManager(client);
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow1");

        assertEquals("my-test-flow1", flow1.getName());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals("xquery", c.getType());
        assertEquals("/ext/domains/test/canonical/my-test-flow1/collector/collector.xqy", c.getModule());

        ServerPlugin t = (ServerPlugin)flow1.getContentPlugin();
        assertEquals("xquery", t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow1.getHeaderPlugin());
        assertNull(flow1.getTriplesPlugin());

        DefaultWriter w = (DefaultWriter)flow1.getWriter();
        assertNotNull(w);
    }

    @Test
    public void testRunFlow() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        assertEquals(2, getDocCount());
        FlowManager fm = new FlowManager(client);
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow1");
        fm.runFlow(flow1, 10);
        assertEquals(4, getDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/conformed/conformed1.xml"), docMgr.read("/conformed/incoming/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/conformed/conformed2.xml"), docMgr.read("/conformed/incoming/employee2.xml").next().getContent(new DOMHandle()).get());
    }

    @Test
    public void testRunFlowWithHeader() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        installModule("/ext/domains/test/canonical/my-test-flow-with-header/collector/collector.xqy", "flow-manager-test/my-test-flow-with-header/collector/collector.xqy");
        installModule("/ext/domains/test/canonical/my-test-flow-with-header/headers/headers.xqy", "flow-manager-test/my-test-flow-with-header/headers/headers.xqy");

        assertEquals(2, getDocCount());
        FlowManager fm = new FlowManager(client);
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow-with-header");
        fm.runFlow(flow1, 10);
        assertEquals(4, getDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/conformed-with-header/conformed1.xml"), docMgr.read("/conformed/incoming/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/conformed-with-header/conformed2.xml"), docMgr.read("/conformed/incoming/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/ext/domains/test/canonical/my-test-flow-with-header/\")");
    }

    @Test
    public void testRunFlowWithAll() throws SAXException, IOException, ParserConfigurationException, XMLStreamException {
        installModule("/ext/domains/test/canonical/my-test-flow-with-all/collector/collector.xqy", "flow-manager-test/my-test-flow-with-all/collector/collector.xqy");
        installModule("/ext/domains/test/canonical/my-test-flow-with-all/headers/headers.xqy", "flow-manager-test/my-test-flow-with-all/headers/headers.xqy");
        installModule("/ext/domains/test/canonical/my-test-flow-with-all/content/content.xqy", "flow-manager-test/my-test-flow-with-all/content/content.xqy");
        installModule("/ext/domains/test/canonical/my-test-flow-with-all/triples/triples.xqy", "flow-manager-test/my-test-flow-with-all/triples/triples.xqy");

        assertEquals(2, getDocCount());
        FlowManager fm = new FlowManager(client);
        SimpleFlow flow1 = (SimpleFlow)fm.getFlow("test", "my-test-flow-with-all");
        fm.runFlow(flow1, 10);
        assertEquals(4, getDocCount());
        assertXMLEqual(getXmlFromResource("flow-manager-test/conformed-with-all/conformed1.xml"), docMgr.read("/conformed/incoming/employee1.xml").next().getContent(new DOMHandle()).get() );
        assertXMLEqual(getXmlFromResource("flow-manager-test/conformed-with-all/conformed2.xml"), docMgr.read("/conformed/incoming/employee2.xml").next().getContent(new DOMHandle()).get());

        runInModules("xdmp:directory-delete(\"/ext/domains/test/canonical/my-test-flow-with-all/\")");
    }
}
