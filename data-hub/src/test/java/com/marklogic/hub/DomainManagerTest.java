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

import java.io.IOException;
import java.util.List;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.domain.Domain;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.hub.plugin.ServerPlugin;
import com.marklogic.hub.writer.DefaultWriter;

import static org.custommonkey.xmlunit.XMLAssert.assertXMLEqual;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import org.custommonkey.xmlunit.XMLUnit;

public class DomainManagerTest extends HubTestBase {

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
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow1/collector/\")," +
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow1/headers/\")," +
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow1/triples/\")," +
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow1/content/\")," +
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow2/collector/\")," +
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow2/headers/\")," +
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow2/triples/\")," +
                "xdmp:directory-create(\"/ext/domains/test/conformance/my-test-flow2/content/\")");
        installModule("/ext/domains/test/conformance/my-test-flow1/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");
        installModule("/ext/domains/test/conformance/my-test-flow2/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");
    }

    @AfterClass
    public static void teardown() {
        runInModules("xdmp:directory-delete(\"/ext/\")");
        docMgr.delete("/incoming/employee1.xml");
        docMgr.delete("/incoming/employee2.xml");
    }

    @Test
    public void testGetDomains() {
        DomainManager fm = new DomainManager(client);
        List<Domain> domains = fm.getDomains();
        assertEquals(1, domains.size());

        Domain domain = domains.get(0);

        assertEquals("test", domain.getName());

        List<Flow> flows = domain.getFlows();
        assertEquals(2, flows.size());

        // flow 1
        SimpleFlow flow1 = (SimpleFlow)flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals("xquery", c.getType());
        assertEquals("/ext/domains/test/conformance/my-test-flow1/collector/collector.xqy", c.getModule());

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
        assertEquals("/ext/domains/test/conformance/my-test-flow1/collector/collector.xqy", c.getModule());

        t = (ServerPlugin)flow2.getContentPlugin();
        assertEquals("xquery", t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow2.getHeaderPlugin());

        w = (DefaultWriter)flow2.getWriter();
        assertNotNull(w);

    }

    @Test
    public void testGetDomain() {
        DomainManager fm = new DomainManager(client);
        Domain domain = fm.getDomain("test");

        assertEquals("test", domain.getName());

        List<Flow> flows = domain.getFlows();
        assertEquals(2, flows.size());

        // flow 1
        SimpleFlow flow1 = (SimpleFlow)flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());

        ServerCollector c = (ServerCollector)flow1.getCollector();
        assertEquals("xquery", c.getType());
        assertEquals("/ext/domains/test/conformance/my-test-flow1/collector/collector.xqy", c.getModule());

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
        assertEquals("/ext/domains/test/conformance/my-test-flow1/collector/collector.xqy", c.getModule());

        t = (ServerPlugin)flow2.getContentPlugin();
        assertEquals("xquery", t.getType());
        assertEquals("/com.marklogic.hub/plugins/raw.xqy", t.getModule());
        assertNull(flow2.getHeaderPlugin());

        w = (DefaultWriter)flow2.getWriter();
        assertNotNull(w);
    }

}
