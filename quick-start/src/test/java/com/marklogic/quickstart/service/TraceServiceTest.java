package com.marklogic.quickstart.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.hub.HubTestBase;
import com.marklogic.quickstart.model.TraceQuery;
import org.apache.commons.io.FileUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

public class TraceServiceTest extends HubTestBase {
    @BeforeClass
    public static void setup() throws IOException {
        FileUtils.deleteDirectory(new File(PROJECT_PATH));
        installHub();
    }

    @AfterClass
    public static void teardown() throws IOException {
    }

    @Test
    public void getTraces() throws Exception {
        DatabaseClient traceClient = DatabaseClientFactory.newClient("localhost", 8012, "admin", "admin", DatabaseClientFactory.Authentication.DIGEST);
        TraceService tm = new TraceService(traceClient);
        TraceQuery traceQuery = new TraceQuery();
        traceQuery.start = new Long(1);
        traceQuery.count = new Long(10);
        tm.getTraces(traceQuery);
    }
}
