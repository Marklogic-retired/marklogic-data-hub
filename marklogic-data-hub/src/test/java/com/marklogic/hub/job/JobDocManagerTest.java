package com.marklogic.hub.job;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Arrays;
import java.util.Collections;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.EXECUTE;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.READ;
import static com.marklogic.client.io.DocumentMetadataHandle.Capability.UPDATE;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class JobDocManagerTest extends HubTestBase {
    private JobDocManager jobDocManager;

    @BeforeAll
    public static void runOnce() {
        new Installer().deleteProjectDir();
    }

    @BeforeEach
    public void setup() {
        basicSetup();
        adminHubConfig.initHubProject();
        clearDatabases(HubConfig.DEFAULT_JOB_NAME);
        addJobDocs();
        jobDocManager = new JobDocManager(adminHubConfig.newJobDbClient());
    }

    @Test
    public void testGetLatestJobDocumentForFlows() {
        ArrayNode latestJobsForFlows = (ArrayNode) jobDocManager.getLatestJobDocumentForFlows(Collections.emptyList());
        Assertions.assertEquals(3, latestJobsForFlows.size(), "There should be a latest job for the 3 flows when an empty collection is passed.");
        JsonNode latestJobsForFlowsJson = jobDocManager.getLatestJobDocumentForFlows(Arrays.asList("hub1","hub2"));
        latestJobsForFlows = (ArrayNode) latestJobsForFlowsJson;
        Assertions.assertEquals(2, latestJobsForFlows.size(), "There should be a latest job for the 2 flows we passed.");
        jobDocManager.createJob("newestJob", "hub");
        ObjectNode latestJobsForFlow = (ObjectNode) jobDocManager.getLatestJobDocumentForFlows(Arrays.asList("hub"));
        Assertions.assertEquals("newestJob", latestJobsForFlow.get("job").get("jobId").asText(), "The latest JobId for 'hub' should be 'newestJob'");
        latestJobsForFlow = (ObjectNode) jobDocManager.getLatestJobDocumentForFlow("hub");
        Assertions.assertEquals("newestJob", latestJobsForFlow.get("job").get("jobId").asText(), "The latest JobId for 'hub' should be 'newestJob'");
    }

    private void addJobDocs() {
        clearDatabases(HubConfig.DEFAULT_JOB_NAME);
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("Jobs");
        meta.getCollections().add("Job");
        meta.getPermissions().add("flow-developer-role", READ, UPDATE, EXECUTE);
        installJobDoc("/jobs/1442529761390935690.json", meta, "job-monitor-test/job1.json");
        installJobDoc("/jobs/10584668255644629399.json", meta, "job-monitor-test/job2.json");
        installJobDoc("/jobs/1552529761390935680.json", meta, "job-monitor-test/job3.json");
    }

    private void addFlowDoc() {
        DocumentMetadataHandle flowMeta = new DocumentMetadataHandle();
        flowMeta.getCollections().add("http://marklogic.com/data-hub/flow");
        flowMeta.getPermissions().add("flow-developer-role", READ, UPDATE, EXECUTE);
        installStagingDoc("/flows/hub.flow.json", flowMeta, "job-manager-test/hub.flow.json");
        installFinalDoc("/flows/hub.flow.json", flowMeta, "job-manager-test/hub.flow.json");
    }
}
