package com.marklogic.hub.job;

import com.marklogic.bootstrap.Installer;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.job.impl.JobMonitorImpl;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.*;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
class JobMonitorTest extends HubTestBase {

    @Autowired
    private JobMonitorImpl jobMonitor;

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
        Set<String> actual = jobMonitor.getCurrentJobs().keySet();
        Assertions.assertEquals(2, actual.size());
        Set<String> expected = new HashSet<>();
        expected.add("1552529761390935680");
        expected.add("10584668255644629399");
        Assertions.assertTrue(actual.containsAll(expected));
    }

    @Test
    void getJobStatus() {
        Assertions.assertEquals("running step 1", jobMonitor.getJobStatus("10584668255644629399"));
    }

    @Test
    void getBatchStatus() {
        Assertions.assertEquals("started", jobMonitor.getBatchStatus("10584668255644629399", "11368953415268525918"));
    }
    @Test
    void getStepBatchStatus() {
        Map<String, String> resp = jobMonitor.getStepBatchStatus("10584668255644629399", "1");
        List<String> str = new ArrayList<>();
        str.addAll(resp.values());
        Collections.sort(str);
        List<String> expected = new ArrayList<>();
        //Adding in sorted order
        expected.add("failed");
        expected.add("started");

        Assertions.assertEquals(expected, str );

    }

    @Test
    void getBatchStatus1() {
        try{
            jobMonitor.getBatchStatus("10584668255644629399", "1136895341526852591");
        }
        catch (Exception e){
            Assertions.assertTrue(e.getMessage().contains("No batch document found"));
        }
    }

    @Test
    void getBatchResponse() {
        List<String> expected = new ArrayList<>();
        expected.add("/abc");
        expected.add("/def");
        Assertions.assertTrue(
            jobMonitor.getBatchResponse("10584668255644629399", "11368953415268525918").containsAll(expected));
    }

    //TODO after implementation of the corresponding method
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
        installJobDoc("/jobs/1552529761390935680.json", meta, "job-monitor-test/job3.json");


        DocumentMetadataHandle meta1 = new DocumentMetadataHandle();
        meta1.getCollections().add("Batch");
        meta1.getCollections().add("Jobs");
        meta1.getPermissions().add("hub-admin-role", READ, UPDATE, EXECUTE);
        installJobDoc("/jobs/batches/11368953415268525918.json", meta1, "job-monitor-test/batch1.json");
        installJobDoc("/jobs/batches/11345653515268525918.json", meta1, "job-monitor-test/batch2.json");

    }
}
