package com.marklogic.hub;

import static org.junit.Assert.assertEquals;

import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Paths;

import org.custommonkey.xmlunit.XMLUnit;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.*;

import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.hub.flow.Flow;

public class TracingTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException, URISyntaxException {
        XMLUnit.setIgnoreWhitespace(true);

        installHub();

        enableDebugging();

        URL url = DataHubInstallTest.class.getClassLoader().getResource("tracing-test");
        String path = Paths.get(url.toURI()).toFile().getAbsolutePath();

        PropertiesModuleManager modulesManager = new PropertiesModuleManager();
        modulesManager.deletePropertiesFile();

        DataHub dataHub = new DataHub(getHubConfig());
        dataHub.installUserModules(path);
     }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
    }

    @Before
    public void beforeEach() {
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_FINAL_NAME);
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_TRACING_NAME);
        new Tracing(stagingClient).disable();
    }

    @After
    public void afterEach() {
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_FINAL_NAME);
        runInDatabase("cts:uris() ! xdmp:document-delete(.)", HubConfig.DEFAULT_TRACING_NAME);
        new Tracing(stagingClient).disable();
    }

    @Test
    public void runXMLFlowSansTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "tracemeXML");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

        assertEquals(5, getFinalDocCount());
        assertEquals(0, getTracingDocCount());
    }

    @Test
    public void runJSONFlowSansTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "tracemeJSON");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

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

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "tracemeXML");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

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

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "tracemeJSON");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

        assertEquals(5, getFinalDocCount());
        assertEquals(6, getTracingDocCount());
    }


    @Test
    public void runXMLErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "tracemeXMLError");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

        assertEquals(0, getFinalDocCount());
        assertEquals(1, getTracingDocCount());
    }

    @Test
    public void runJSONErrorFlowWithoutTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "tracemeJSONError");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

        assertEquals(0, getFinalDocCount());
        assertEquals(1, getTracingDocCount());
    }


}
