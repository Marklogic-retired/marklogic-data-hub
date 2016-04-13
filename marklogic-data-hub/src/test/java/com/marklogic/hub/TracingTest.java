package com.marklogic.hub;

import static org.junit.Assert.assertEquals;

import java.io.IOException;

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
    public static void setup() throws IOException {
        XMLUnit.setIgnoreWhitespace(true);

        installHub();

        enableDebugging();

        String path = TracingTest.class.getClassLoader().getResource("tracing-test").getPath();

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
    public void runFlowSansTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "traceme");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

        assertEquals(5, getFinalDocCount());
        assertEquals(0, getTracingDocCount());
    }

    @Test
    public void runFlowWithTracing() {
        assertEquals(0, getFinalDocCount());
        assertEquals(0, getTracingDocCount());

        Tracing t = new Tracing(stagingClient);
        assertFalse(t.isEnabled());

        t.enable();
        assertTrue(t.isEnabled());

        FlowManager fm = new FlowManager(stagingClient);
        Flow flow = fm.getFlow("trace-entity", "traceme");

        JobFinishedListener listener = new JobFinishedListener();
        fm.runFlow(flow, 10, listener);
        listener.waitForFinish();

        assertEquals(5, getFinalDocCount());
        assertEquals(21, getTracingDocCount());
    }


}
