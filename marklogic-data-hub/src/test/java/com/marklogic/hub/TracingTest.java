package com.marklogic.hub;

import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.*;

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

        clearDatabases(new String[]{HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME});

        URL url = TracingTest.class.getClassLoader().getResource("tracing-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();

        DataHub dataHub = new DataHub(getHubConfig(path));
        dataHub.installUserModules(true);
     }

    @Before
    public void beforeEach() {
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_FINAL_NAME);
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_TRACE_NAME);
        clearDb(HubConfig.DEFAULT_JOB_NAME);
        clearDb(HubConfig.DEFAULT_TRACE_NAME);
        new Tracing(stagingClient).disable();
    }

    @After
    public void afterEach() {
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_FINAL_NAME);
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_TRACE_NAME);
        clearDb(HubConfig.DEFAULT_JOB_NAME);
        clearDb(HubConfig.DEFAULT_TRACE_NAME);
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
    }
}
