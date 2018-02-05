package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DOMHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.query.RawStructuredQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.*;
import org.w3c.dom.Document;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;

import static org.junit.Assert.*;

public class TracingTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException, URISyntaxException {
        XMLUnit.setIgnoreWhitespace(true);

        installHub();

        enableDebugging();

        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME);

        URL url = TracingTest.class.getClassLoader().getResource("tracing-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();

        installUserModules(getHubConfig(path), true);
     }

    @Before
    public void beforeEach() {
        clearDatabases(HubConfig.DEFAULT_JOB_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_FINAL_NAME);
        new Tracing(stagingClient).disable();
    }

    @AfterClass
    public static void teardown() {
        clearDatabases(HubConfig.DEFAULT_JOB_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_FINAL_NAME);
        new Tracing(stagingClient).disable();
    }

    @Test
    public void runXMLFlowSansTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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
    public void runJSONFlowWithTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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
    public void runXMLErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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
        RawStructuredQueryDefinition sqd = sqb.build(sqb.and());
        Document node = traceDocMgr.search(sqd, 1).next().getContent(new DOMHandle()).get();
        Assert.assertEquals(1, node.getElementsByTagName("step").getLength());
        Assert.assertEquals("content", node.getElementsByTagName("label").item(0).getTextContent());
    }

    @Test
    public void runXMLWriterErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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
        RawStructuredQueryDefinition sqd = sqb.build(sqb.and());
        Document node = traceDocMgr.search(sqd, 1).next().getContent(new DOMHandle()).get();
        Assert.assertEquals(1, node.getElementsByTagName("step").getLength());
        Assert.assertEquals("writer", node.getElementsByTagName("label").item(0).getTextContent());
    }

    @Test
    public void runJSONErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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
        RawStructuredQueryDefinition sqd = sqb.build(sqb.and());
        JsonNode node = traceDocMgr.search(sqd, 1).next().getContent(new JacksonHandle()).get();
        System.out.println(node.asText());
        Assert.assertEquals(1, node.get("trace").get("steps").size());
        Assert.assertEquals("content", node.get("trace").get("steps").get(0).get("label").asText());
    }


    @Test
    public void runJSONWriterErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(getHubConfig());
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
        RawStructuredQueryDefinition sqd = sqb.build(sqb.and());
        JsonNode node = traceDocMgr.search(sqd, 1).next().getContent(new JacksonHandle()).get();
        Assert.assertEquals(1, node.get("trace").get("steps").size());
        Assert.assertEquals("writer", node.get("trace").get("steps").get(0).get("label").asText());

    }
}
