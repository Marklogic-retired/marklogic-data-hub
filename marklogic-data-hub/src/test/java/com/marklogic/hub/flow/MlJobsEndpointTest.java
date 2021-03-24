package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * As of DHFPROD-6526 for 5.5.0, the mlJobs endpoint is no longer needed. But the GET part of the endpoint is still
 * publically documented, so we need test coverage of that.
 */
public class MlJobsEndpointTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/simple-custom-step");
        runFlow(new FlowInputs("simpleCustomStepFlow").withJobId("job123"));
        runFlow(new FlowInputs("simpleCustomStepFlow").withJobId("job456"));

        MlJobsManager mgr = new MlJobsManager(getHubClient().getJobsClient());

        assertNotNull(mgr.getJob("job123"));
        assertNotNull(mgr.getJob("job456"));
        assertNull(mgr.getJob("job789"));

        ArrayNode jobs = mgr.getJobsWithStatus("finished");
        assertEquals(2, jobs.size());

        jobs = mgr.getJobsForFlow("simpleCustomStepFlow");
        assertEquals(2, jobs.size());

        jobs = mgr.getJobsForFlow("unknown");
        assertEquals(0, jobs.size());

        ObjectNode jobMap = mgr.getJobInfoForFlows("simpleCustomStepFlow");
        ObjectNode jobFlowData = (ObjectNode) jobMap.get("simpleCustomStepFlow");
        ArrayNode jobIds = (ArrayNode) jobFlowData.get("jobIds");
        assertEquals(2, jobIds.size());
        assertEquals("job123", jobIds.get(0).asText());
        assertEquals("job456", jobIds.get(1).asText());
    }
}

class MlJobsManager extends ResourceManager {
    public MlJobsManager(DatabaseClient client) {
        client.init("mlJobs", this);
    }

    public JsonNode getJob(String jobId) {
        RequestParameters params = new RequestParameters();
        params.add("jobid", jobId);
        return getServices().get(params, new JacksonHandle()).get();
    }

    public ArrayNode getJobsWithStatus(String status) {
        RequestParameters params = new RequestParameters();
        params.add("status", status);
        return (ArrayNode) getServices().get(params, new JacksonHandle()).get();
    }

    public ArrayNode getJobsForFlow(String flowName) {
        RequestParameters params = new RequestParameters();
        params.add("flow-name", flowName);
        return (ArrayNode) getServices().get(params, new JacksonHandle()).get();
    }

    public ObjectNode getJobInfoForFlows(String... flowNames) {
        RequestParameters params = new RequestParameters();
        for (String flowName : flowNames) {
            params.add("flowNames", flowName);
        }
        return (ObjectNode) getServices().get(params, new JacksonHandle()).get();
    }
}
