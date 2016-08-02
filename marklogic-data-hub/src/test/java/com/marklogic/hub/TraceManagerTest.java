package com.marklogic.hub;

import org.junit.Test;

public class TraceManagerTest extends HubTestBase {
    @Test
    public void getTraces() throws Exception {
        TraceManager tm = new TraceManager(traceClient);
        tm.getTraces(null, 1, 10);
    }

}
