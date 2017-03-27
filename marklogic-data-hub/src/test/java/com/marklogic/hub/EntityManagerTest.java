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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

import java.io.IOException;
import java.util.List;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.collector.ServerCollector;
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.SimpleFlow;
import com.marklogic.hub.plugin.PluginType;
import com.marklogic.hub.plugin.ServerPlugin;
import com.marklogic.hub.writer.DefaultWriter;

public class EntityManagerTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        clearDb(HubConfig.DEFAULT_STAGING_NAME);
        clearDb(HubConfig.DEFAULT_FINAL_NAME);
        clearDb(HubConfig.DEFAULT_MODULES_DB_NAME);

        installHub();

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installStagingDoc("/incoming/employee1.xml", meta, getResource("flow-manager-test/input/employee1.xml"));
        installStagingDoc("/incoming/employee2.xml", meta, getResource("flow-manager-test/input/employee2.xml"));
        installModule("/entities/test/harmonize/my-test-flow1/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");
        installModule("/entities/test/harmonize/my-test-flow2/collector/collector.xqy", "flow-manager-test/my-test-flow1/collector/collector.xqy");
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
    }

    @Test
    public void testGetEntities() {
        EntityManager fm = new EntityManager(stagingClient);
        List<Entity> entities = fm.getEntities();
        assertEquals(1, entities.size());

        Entity entity = entities.get(0);

        assertEquals("test", entity.getName());

        List<Flow> flows = entity.getFlows();
        assertEquals(2, flows.size());

        // flow 1
        SimpleFlow flow1 = (SimpleFlow)flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());

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
    public void testGetEntity() {
        EntityManager fm = new EntityManager(stagingClient);
        Entity entity = fm.getEntity("test");

        assertEquals("test", entity.getName());

        List<Flow> flows = entity.getFlows();
        assertEquals(2, flows.size());

        // flow 1
        SimpleFlow flow1 = (SimpleFlow)flows.get(0);
        assertEquals("my-test-flow1", flow1.getName());

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

}
