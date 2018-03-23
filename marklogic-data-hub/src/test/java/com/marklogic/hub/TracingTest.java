/*
 * Copyright 2012-2018 MarkLogic Corporation
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
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.w3c.dom.Document;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.mgmt.ManageClient;

public class TracingTest extends HubTestBase {

    private static final String BINARY_HEX_ENCODED = "89504E470D0A1A0A0000000D494844520000000D0000001308060000004B378797000000017352474200AECE1CE900000006624B474400FF00FF00FFA0BDA793000000097048597300000B1300000B1301009A9C180000000774494D4507DA0811012332D018A204000002AF4944415428CF9592CB6E1C4500454F555757573FC6F3308E9F40AC286C909122082B36ACF317EC59B2E4A7F8098422A17889402436A3D8C61ECFABBBA7BBEBC502943D573AFB239D2BBEFFE1C7D7428849AA539565D9814A9298EA340A04CE39A15325807BEBBCCB8D591963BE534AABAF46D98CAA2C383898B13FDB23CD6054569455C5FE74C2D9C95159B73B16CB3521C673A9303C7966397AEEE9D47BFE5AFC815639C664E42623D50A21252A4970CED1B4BB4E4A34C5F192A75F248CCEEFF8FDFE35432BF13E60AD63182C2104AC7338EF8921A02C35B7BF1E53FF2610EA635E9C5E90950E44865209B9314829D15A93E7062913A9BC77D44D438C91E9788CD18675BDC5C788F39EC7E58AF5664BBBEB98DFDC320CB6550021044288586769BB0E1F5204026B2D006591635D40A72926334A299532998CD199444A49A14B9E1C8D1915157B7B15FBFB5366D329FD60B9B9BB67D7F7A954B1E2F0C50D2F5FC1F4E22DBF5CFF44B791F8E0E9074BDDB48410E8FB9EAEEFB1838DCAC78EF575C9ADD30CED8CD3598E5001008440FE479224A4A98288508E8E873FA7EC6E2DB3E909CF8FF791DA12A2012211E807CB765BF3F0B0A06E765E451FB1B1C14618A2E261E5C8BB9CB6ED596D362C168FBCBB9E7F501DAC8B4A2A8949A648AFC06AC6E50C530ACABCA42C4BAAAAE4ECF888C13996EB2D314425534A0E2F167CFEADA338FB9BABD51B525191E739459E331E555455894E53ACB5F4D646E93DE8D23239481145CD7CF1166F81183FDCE7DF8E81444A887150CBE68EAB9F3FE5FE32A0D353BEFEE44BCC28A0544296698A3C474A496E0C7BE3316F2E2FBF519F3D3B6F04B2CC32C5A82CF00CDC3F3CD2343BD6DB86F56643BBDBD1B41D8BE5AADF6EEB97EAE4A3C92BA1D2A70879E87C98EEFABE68BA906CB60D4A253ED5BABB9EBF5F393BDCD59BF595526A2E628CFCDFFD03C6146669F7B691AB0000000049454E44AE426082";
    private static final List<DatabaseClient> clients = new ArrayList<DatabaseClient>();
    @BeforeClass
    public static void setup() throws IOException, URISyntaxException {
        XMLUnit.setIgnoreWhitespace(true);

        installHub();

        enableDebugging();

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);

        URL url = TracingTest.class.getClassLoader().getResource("tracing-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();
        installUserModules(getHubConfig(path), true);
        
        ManageClient manageClient = ((HubConfigImpl)getHubConfig()).getManageClient();
        String resp = manageClient.getJson("/manage/v2/hosts?format=json");
        JsonNode actualObj = new ObjectMapper().readTree(resp);
		JsonNode nameNode = actualObj.path("host-default-list").path("list-items");
		List<String> hosts = nameNode.findValuesAsText("nameref");
		hosts.forEach(serverHost ->
		{	
			try {
				clients.add(getClient(serverHost, stagingPort, HubConfig.DEFAULT_STAGING_NAME, user, password, stagingAuthMethod));
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		});      
     }

    @Before
    public void beforeEach() {
        clearDatabases(HubConfig.DEFAULT_JOB_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_FINAL_NAME);
        Tracing.create(stagingClient).disable();
        clients.forEach(client ->
		{	
			client.newServerEval().xquery("xquery version \"1.0-ml\";\n" + 
					"import module namespace hul = \"http://marklogic.com/data-hub/hub-utils-lib\" at \"/MarkLogic/data-hub-framework/impl/hub-utils-lib.xqy\";\n" + 
					"hul:invalidate-field-cache(\"tracing-enabled\")").eval();
		});
    }

    @AfterClass
    public static void teardown() {
        clearDatabases(HubConfig.DEFAULT_JOB_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_FINAL_NAME);
        Tracing.create(stagingClient).disable();
        disableDebugging();
        uninstallHub();
    }

    @Test
    public void runXMLFlowSansTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeXML");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(0, getTracingDocCount());
    }

    @Test
    public void runJSONFlowSansTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeJSON");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(0, getTracingDocCount());
    }

    @Test
    public void runXMLFlowWithTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeXML");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(6, getTracingDocCount());
    }

    @Test
    public void runXqyXmlFlowWithBinaryContent() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeXqyXmlWithBinary");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(6, getTracingDocCount());


        DocumentRecord doc = finalDocMgr.read("/doc/1.xml").next();
        Document finalDoc = doc.getContent(new DOMHandle()).get();
        assertXMLEqual(getXmlFromResource("tracing-test/traces/finalSjsXmlDoc.xml"), finalDoc);

        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        Document node = traceDocMgr.search(sqd, 1).next().getContent(new DOMHandle()).get();
        Assert.assertEquals(4, node.getElementsByTagName("step").getLength());
        Assert.assertEquals("content", node.getElementsByTagName("label").item(0).getTextContent());
        Assert.assertEquals(BINARY_HEX_ENCODED, node.getElementsByTagName("output").item(0).getTextContent());
    }

    @Test
    public void runXqyJsonFlowWithBinaryContent() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeXqyJsonWithBinary");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(6, getTracingDocCount());

        DocumentRecord doc = finalDocMgr.read("/doc/1.json").next();
        String finalDoc= doc.getContent(new StringHandle()).get();
        assertJsonEqual(getResource("tracing-test/traces/finalXqyJsonDoc.json"), finalDoc, true);


        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        JsonNode node = traceDocMgr.search(sqd, 1).next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(4, node.get("trace").get("steps").size());
        Assert.assertEquals("content", node.get("trace").get("steps").get(0).get("label").asText());
        Assert.assertEquals(BINARY_HEX_ENCODED, node.get("trace").get("steps").get(0).get("output").asText());
    }

    @Test
    public void runJSONFlowWithTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeJSON");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(6, getTracingDocCount());
    }


    @Test
    public void runSjsJsonFlowWithBinaryContent() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeSjsJsonWithBinary");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(6, getTracingDocCount());

        DocumentRecord doc = finalDocMgr.read("1").next();
        String finalDoc= doc.getContent(new StringHandle()).get();
        assertJsonEqual(getResource("tracing-test/traces/finalSjsJsonDoc.json"), finalDoc, true);

        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        JsonNode node = traceDocMgr.search(sqd, 1).next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(4, node.get("trace").get("steps").size());
        Assert.assertEquals("content", node.get("trace").get("steps").get(0).get("label").asText());
        Assert.assertEquals(BINARY_HEX_ENCODED, node.get("trace").get("steps").get(0).get("output").asText());
    }

    @Test
    public void runSjsXmlFlowWithBinaryContent() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeSjsXmlWithBinary");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(5, getFinalDocCount());
        assertEquals(6, getTracingDocCount());

        DocumentRecord doc = finalDocMgr.read("1").next();
        Document finalDoc = doc.getContent(new DOMHandle()).get();
        assertXMLEqual(getXmlFromResource("tracing-test/traces/finalSjsXmlDoc.xml"), finalDoc);

        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        Document node = traceDocMgr.search(sqd, 1).next().getContent(new DOMHandle()).get();
        Assert.assertEquals(4, node.getElementsByTagName("step").getLength());
        Assert.assertEquals("content", node.getElementsByTagName("label").item(0).getTextContent());
        Assert.assertEquals(BINARY_HEX_ENCODED, node.getElementsByTagName("output").item(0).getTextContent());
    }


    @Test
    public void runXMLErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeXMLError");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(0, getFinalDocCount());
        assertEquals(5, getTracingDocCount());

        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        Document node = traceDocMgr.search(sqd, 1).next().getContent(new DOMHandle()).get();
        Assert.assertEquals(1, node.getElementsByTagName("step").getLength());
        Assert.assertEquals("content", node.getElementsByTagName("label").item(0).getTextContent());
    }

    @Test
    public void runXMLWriterErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeXMLWriterError");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(0, getFinalDocCount());
        assertEquals(5, getTracingDocCount());

        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        Document node = traceDocMgr.search(sqd, 1).next().getContent(new DOMHandle()).get();
        Assert.assertEquals(1, node.getElementsByTagName("step").getLength());
        Assert.assertEquals("writer", node.getElementsByTagName("label").item(0).getTextContent());
    }

    @Test
    public void runJSONErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeJSONError");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(0, getFinalDocCount());
        assertEquals(5, getTracingDocCount());

        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        JsonNode node = traceDocMgr.search(sqd, 1).next().getContent(new JacksonHandle()).get();
        System.out.println(node.asText());
        Assert.assertEquals(1, node.get("trace").get("steps").size());
        Assert.assertEquals("content", node.get("trace").get("steps").get(0).get("label").asText());
    }


    @Test
    public void runJSONWriterErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = Tracing.create(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = FlowManager.create(getHubConfig());
        Flow flow = fm.getFlow("trace-entity", "tracemeJSONWriterError");

        FlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(flow)
            .withBatchSize(10)
            .withThreadCount(1);
        flowRunner.run();
        flowRunner.awaitCompletion();

        assertEquals(0, getFinalDocCount());
        assertEquals(5, getTracingDocCount());

        StructuredQueryBuilder sqb = traceClient.newQueryManager().newStructuredQueryBuilder();
        RawStructuredQueryDefinition sqd = sqb.build(sqb.not(sqb.value(sqb.jsonProperty("label"), "collector")));
        JsonNode node = traceDocMgr.search(sqd, 1).next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(1, node.get("trace").get("steps").size());
        Assert.assertEquals("writer", node.get("trace").get("steps").get(0).get("label").asText());
    }
}
