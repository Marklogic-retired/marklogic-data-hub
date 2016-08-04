package com.marklogic.hub;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;

public class TraceManagerTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException {
        installHub();
    }

    @AfterClass
    public static void teardown() throws IOException {
        uninstallHub();
    }

    @Test
    public void getTraces() throws Exception {
        TraceManager tm = new TraceManager(traceClient);
        tm.getTraces(null, 1, 10);
    }

}
