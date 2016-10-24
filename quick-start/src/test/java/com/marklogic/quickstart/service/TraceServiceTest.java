package com.marklogic.quickstart.service;

import com.marklogic.hub.HubTestBase;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;

public class TraceServiceTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException {
        HubTestBase.installHub();
    }

    @AfterClass
    public static void teardown() throws IOException {
        HubTestBase.uninstallHub();
    }

    @Test
    public void getTraces() throws Exception {
        TraceService tm = new TraceService(HubTestBase.traceClient);
        tm.getTraces(null, 1, 10);
    }

}
