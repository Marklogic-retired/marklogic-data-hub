package com.marklogic.hub.job;

import com.marklogic.bootstrap.Installer;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
class JobMonitorTest extends HubTestBase {

    @Autowired
    private JobMonitor jobMonitor;

    @BeforeAll
    public static void runOnce() {
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setup() throws IOException {
        basicSetup();
        adminHubConfig.initHubProject();
        clearDatabases(HubConfig.DEFAULT_JOB_NAME);
        addJobDocs();
    }

    @AfterAll
    public static void removeProjectDir() {
        new Installer().deleteProjectDir();
    }

    @Test
    void getCurrentJobs() {
        Assertions.assertEquals("10584668255644629399", jobMonitor.getCurrentJobs().keySet().stream().findFirst().get());
    }

    @Test
    void getJobStatus() {
        Assertions.assertEquals("running step 1", jobMonitor.getJobStatus("10584668255644629399"));
    }

    @Test
    void getBatchStatus() {
        Assertions.assertEquals("started", jobMonitor.getBatchStatus("10584668255644629399", "11368953415268525918", "1"));
    }

    @Test
    void getBatchResponse() {
        List<String> expected = new ArrayList<>();
        expected.add("/abc");
        expected.add("/def");
        Assertions.assertTrue(
            jobMonitor.getBatchResponse("10584668255644629399", "11368953415268525918").containsAll(expected));
    }

    @Test
    void getNextStep() {
    }

    private void addJobDocs() {
        clearDatabases(HubConfig.DEFAULT_JOB_NAME);
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("Jobs");
        meta.getCollections().add("Job");
        meta.getPermissions().add("hub-admin-role", READ, UPDATE, EXECUTE);
        installJobDoc("/jobs/1442529761390935690.json", meta, "job-monitor-test/job1.json");
        installJobDoc("/jobs/10584668255644629399.json", meta, "job-monitor-test/job2.json");

        DocumentMetadataHandle meta1 = new DocumentMetadataHandle();
        meta1.getCollections().add("Batch");
        meta1.getCollections().add("Jobs");
        meta1.getPermissions().add("hub-admin-role", READ, UPDATE, EXECUTE);
        installJobDoc("/jobs/batches/11368953415268525918.json", meta1, "job-monitor-test/batch1.json");
    }
}
