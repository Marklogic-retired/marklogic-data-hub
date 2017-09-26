package com.marklogic.quickstart.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.model.TraceQuery;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.IOException;

public class TraceServiceTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException {
        deleteProjectDir();
        installHub();
    }

    @Test
    public void getTraces() {
        DatabaseClient traceClient = DatabaseClientFactory.newClient("localhost", 8012, "admin", "admin", DatabaseClientFactory.Authentication.DIGEST);
        TraceService tm = new TraceService(traceClient);
        TraceQuery traceQuery = new TraceQuery();
        traceQuery.start = new Long(1);
        traceQuery.count = new Long(10);
        tm.getTraces(traceQuery);
    }
}
