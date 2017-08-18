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

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.collector.Collector;
import com.marklogic.hub.entity.Entity;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;

import static org.junit.Assert.assertEquals;

public class EntityManagerTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);
        FileUtils.deleteDirectory(new File(PROJECT_PATH));

        installHub();

        DataHub dataHub = getDataHub();
        dataHub.clearUserModules();
        dataHub.installUserModules(true);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installStagingDoc("/incoming/employee1.xml", meta, "flow-manager-test/input/employee1.xml");
        installStagingDoc("/incoming/employee2.xml", meta, "flow-manager-test/input/employee2.xml");

        Scaffolding scaffolding = new Scaffolding(PROJECT_PATH, stagingClient);
        scaffolding.createEntity("my-test-entity-1");
        scaffolding.createFlow("my-test-entity-1", "flow1", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        scaffolding.createEntity("my-test-entity-2");
        scaffolding.createFlow("my-test-entity-2", "flow1", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);
        scaffolding.createFlow("my-test-entity-2", "flow2", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML);

        dataHub.installUserModules();
    }

    @AfterClass
    public static void teardown() throws IOException {
        FileUtils.deleteDirectory(new File(PROJECT_PATH));
    }

    @Test
    public void testGetEntities() {
        EntityManager fm = new EntityManager(stagingClient);
        List<Entity> entities = fm.getEntities();
        assertEquals(2, entities.size());

        Entity entity = entities.get(0);

        assertEquals("my-test-entity-1", entity.getName());

        List<Flow> flows = entity.getFlows();
        assertEquals(1, flows.size());

        // flow 1
        Flow flow1 = flows.get(0);
        assertEquals("flow1", flow1.getName());

        Collector c = flow1.getCollector();
        assertEquals(CodeFormat.XQUERY, c.getCodeFormat());
        assertEquals("/entities/my-test-entity-1/harmonize/flow1/collector.xqy", c.getModule());

        // entity 2
        entity = entities.get(1);
        assertEquals("my-test-entity-2", entity.getName());

        flows = entity.getFlows();
        assertEquals(2, flows.size());

        // flow 1
        flow1 = flows.get(0);
        assertEquals("flow1", flow1.getName());

        c = flow1.getCollector();
        assertEquals(CodeFormat.JAVASCRIPT, c.getCodeFormat());
        assertEquals("/entities/my-test-entity-2/harmonize/flow1/collector.sjs", c.getModule());

        // flow 2
        Flow flow2 = flows.get(1);
        assertEquals("flow2", flow2.getName());

        c = flow2.getCollector();
        assertEquals(CodeFormat.XQUERY, c.getCodeFormat());
        assertEquals("/entities/my-test-entity-2/harmonize/flow2/collector.xqy", c.getModule());
    }

    @Test
    public void testGetEntity() {
        EntityManager fm = new EntityManager(stagingClient);
        Entity entity = fm.getEntity("my-test-entity-2");

        assertEquals("my-test-entity-2", entity.getName());

        List<Flow> flows = entity.getFlows();
        assertEquals(2, flows.size());

        // flow 1
        Flow flow1 = flows.get(0);
        assertEquals("flow1", flow1.getName());

        Collector c = flow1.getCollector();
        assertEquals(CodeFormat.JAVASCRIPT, c.getCodeFormat());
        assertEquals("/entities/my-test-entity-2/harmonize/flow1/collector.sjs", c.getModule());

        // flow 2
        Flow flow2 = flows.get(1);
        assertEquals("flow2", flow2.getName());

        c = flow2.getCollector();
        assertEquals(CodeFormat.XQUERY, c.getCodeFormat());
        assertEquals("/entities/my-test-entity-2/harmonize/flow2/collector.xqy", c.getModule());
    }

}
