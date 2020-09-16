package com.marklogic.hub.job;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.Collections;

import static com.marklogic.client.io.DocumentMetadataHandle.Capability.*;

public class JobDocManagerTest extends AbstractHubCoreTest {

    @Test
    public void testGetLatestJobDocumentForFlows() {
        addJobDocs();
        JobDocManager jobDocManager = new JobDocManager(getHubClient().getJobsClient());

        ArrayNode latestJobsForFlows = (ArrayNode) jobDocManager.getLatestJobDocumentForFlows(Collections.emptyList());
        Assertions.assertEquals(3, latestJobsForFlows.size(), "There should be a latest job for the 3 flows when an empty collection is passed.");
        JsonNode latestJobsForFlowsJson = jobDocManager.getLatestJobDocumentForFlows(Arrays.asList("hub1", "hub2"));
        latestJobsForFlows = (ArrayNode) latestJobsForFlowsJson;
        Assertions.assertEquals(2, latestJobsForFlows.size(), "There should be a latest job for the 2 flows we passed.");
        jobDocManager.createJob("newestJob", "hub");
        ObjectNode latestJobsForFlow = (ObjectNode) jobDocManager.getLatestJobDocumentForFlows(Arrays.asList("hub"));
        Assertions.assertEquals("newestJob", latestJobsForFlow.get("job").get("jobId").asText(), "The latest JobId for 'hub' should be 'newestJob'");
        latestJobsForFlow = (ObjectNode) jobDocManager.getLatestJobDocumentForFlow("hub");
        Assertions.assertEquals("newestJob", latestJobsForFlow.get("job").get("jobId").asText(), "The latest JobId for 'hub' should be 'newestJob'");
    }

    private void addJobDocs() {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add("Jobs");
        meta.getCollections().add("Job");
        meta.getPermissions().add("flow-developer-role", READ, UPDATE, EXECUTE);
        installJobDoc("/jobs/1442529761390935690.json", meta, "job-monitor-test/job1.json");
        installJobDoc("/jobs/10584668255644629399.json", meta, "job-monitor-test/job2.json");
        installJobDoc("/jobs/1552529761390935680.json", meta, "job-monitor-test/job3.json");
    }
}
