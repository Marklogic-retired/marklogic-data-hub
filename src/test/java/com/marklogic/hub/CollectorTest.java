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
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.util.ArrayList;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.hub.collectors.QueryCollector;
import com.marklogic.hub.runners.CollectorRunner;

public class CollectorTest extends HubTestBase {

    @BeforeClass
    public static void setup() throws IOException {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("tester");
        installDoc("/test-dir/doc-with-collection.xml", meta, getResource("collector-test/doc-with-collection.xml"));
        installDoc("/test-dir/doc-sans-collection.xml", getResource("collector-test/doc-sans-collection.xml"));
        installDoc("/test-dir/another-dir/yad/doc-in-deeply-nested-dir.xml", getResource("collector-test/doc-in-deeply-nested-dir.xml"));
        installModule("/flows/flow-with-collection.xml", getResource("collector-test/flow-with-collection.xml"));
    }

    @AfterClass
    public static void cleanup() {
        docMgr.delete("/test-dir/doc-with-collection.xml");
        docMgr.delete("/test-dir/doc-sans-collection.xml");
        docMgr.delete("/test-dir/another-dir/yad/doc-in-deeply-nested-dir.xml");
        uninstallModule("/flows/flow-with-collection.xml");
    }

    @Test
    public void testEstimate() {
        CollectorRunner c = new CollectorRunner(client, "query");
        StructuredQueryBuilder sqb = client.newQueryManager().newStructuredQueryBuilder();
        QueryCollector.QueryCollectorOptions options = new QueryCollector.QueryCollectorOptions(sqb.collection("tester"));
        int estimate = c.getEstimate(options);
        assertEquals(1, estimate);
    }


    @Test
    public void testByCollection() {
        CollectorRunner c = new CollectorRunner(client, "query");
        StructuredQueryBuilder sqb = client.newQueryManager().newStructuredQueryBuilder();
        QueryCollector.QueryCollectorOptions options = new QueryCollector.QueryCollectorOptions(sqb.collection("tester"));

        ArrayList<String> actual = new ArrayList<String>();
        c.run(10, options,
                uris -> actual.addAll(uris));
        assertEquals(1, actual.size());
        assertEquals("/test-dir/doc-with-collection.xml", actual.get(0));
    }

    @Test
    public void testByDirShallow() {
        CollectorRunner c = new CollectorRunner(client, "query");
        StructuredQueryBuilder sqb = client.newQueryManager().newStructuredQueryBuilder();
        QueryCollector.QueryCollectorOptions options = new QueryCollector.QueryCollectorOptions(sqb.directory(false, "/test-dir/"));

        ArrayList<String> actual = new ArrayList<String>();
        c.run(10, options,
                uris -> actual.addAll(uris));
        assertEquals(2, actual.size());
        ArrayList<String> expected = new ArrayList<String>();
        expected.add("/test-dir/doc-with-collection.xml");
        expected.add("/test-dir/doc-sans-collection.xml");
        assertTrue(expected.containsAll(actual) && actual.containsAll(expected));
    }

//
//    @Test
//    public void testByFlowWithCollection() {
//        CollectorRunner c = new CollectorRunner(client);
//        ArrayList<String> output = c.run("flow-with-collection.xml");
//        assertEquals(1, output.size());
//        assertEquals("/test-dir/doc-with-collection.xml", output.get(0));
//    }
}
