package com.marklogic.quickstart.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.DatabaseClientFactory;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import org.apache.commons.io.FileUtils;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

public class TraceServiceTest {
    public static final String PROJECT_PATH = "ye-olde-project";

    @BeforeClass
    public static void setup() throws IOException {
        installHub();
    }

    @AfterClass
    public static void teardown() throws IOException {
    }

    @Test
    public void getTraces() throws Exception {
        DatabaseClient traceClient = DatabaseClientFactory.newClient("localhost", 8012, "admin", "admin", DatabaseClientFactory.Authentication.DIGEST);
        TraceService tm = new TraceService(traceClient);
        tm.getTraces(null, 1, 10);
    }

    protected static void installHub() throws IOException {
        new DataHub(getHubConfig()).install();
    }

    protected static void uninstallHub() throws IOException {
        new DataHub(getHubConfig()).uninstall();
        FileUtils.deleteDirectory(new File(PROJECT_PATH));
    }

    protected static HubConfig getHubConfig() {
        return getHubConfig(PROJECT_PATH);
    }

    protected static HubConfig getHubConfig(String projectDir) {
        HubConfig hubConfig = new HubConfig(projectDir);
        hubConfig.host = "localhost";
        hubConfig.stagingPort = 8010;
        hubConfig.finalPort = 8011;
        hubConfig.tracePort = 8012;
        hubConfig.jobPort = 8013;
        hubConfig.username = "admin";
        hubConfig.password = "admin";
        hubConfig.adminUsername = "admin";
        hubConfig.adminPassword = "admin";
        return hubConfig;
    }

}
