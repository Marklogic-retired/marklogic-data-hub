package com.marklogic.hub.flow;

import com.marklogic.client.ext.datamovement.job.DeleteCollectionsJob;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ConstrainSourceQueryToJobTest extends AbstractHubCoreTest {

    @Test
    public void test() {
        installReferenceModelProject();
        final String flowName = "ingestToFinal";
        makeInputFilePathsAbsoluteInFlow(flowName);

        runAsDataHubOperator();
        RunFlowResponse flowResponse = runFlow(new FlowInputs(flowName, "1").withJobId("job1"));
        RunStepResponse stepResponse = flowResponse.getStepResponses().get("1");
        assertEquals("job1", stepResponse.getJobId());
        assertEquals(1, stepResponse.getSuccessfulBatches(), "The document should have been ingested successfully");

        final String mapXmlStep = "2";

        final Map<String, Object> options = new HashMap<>();
        options.put("constrainSourceQueryToJob", true);

        flowResponse = runFlow(new FlowInputs(flowName, mapXmlStep).withJobId("job2").withOptions(options));
        stepResponse = flowResponse.getStepResponses().get(mapXmlStep);
        assertEquals(0, stepResponse.getSuccessfulBatches(), "Since the sourceQuery was constrained to job2, and " +
            "no documents have that value for their datahubCreatedByJob metadata key, then nothing should have been processed");

        flowResponse = runFlow(new FlowInputs(flowName, mapXmlStep).withJobId("job1"));
        stepResponse = flowResponse.getStepResponses().get(mapXmlStep);
        assertEquals(1, stepResponse.getSuccessfulBatches(), "Since the sourceQuery was constrained to job1, and the " +
            "ingestion step was executed before with that jobId, then the ingested XML document should have been processed");

        verifyJobsCanBeDeletedViaDMSDK();
    }

    private void verifyJobsCanBeDeletedViaDMSDK() {
        final String collection = "Jobs";

        // Use a user that has permission to delete these docs
        runAsAdmin();

        assertEquals(3, getDocCount(HubConfig.DEFAULT_JOB_NAME, collection),
            "Expecting 2 Job docs and 1 Batch doc");

        new DeleteCollectionsJob(collection).setConsistentSnapshot(true).run(getHubClient().getJobsClient());

        assertEquals(0, getDocCount(HubConfig.DEFAULT_JOB_NAME, collection),
            "DeleteCollectionsJob uses DMSDK under the hood to find documents to delete; prior to " +
                "DHFPROD-7256, the custom jobs rewriter that DHF used did not support this due to " +
                "some errors in the rewriter. This is then a simple test to verify that the custom " +
                "rewriter is correct, or at least not exhibiting the bug shown in 7256");
    }
}
