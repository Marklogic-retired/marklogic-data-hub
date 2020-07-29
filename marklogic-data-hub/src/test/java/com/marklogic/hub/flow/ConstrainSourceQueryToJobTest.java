package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ConstrainSourceQueryToJobTest extends AbstractHubCoreTest {

    @Autowired
    FlowRunnerImpl flowRunner;

    @Test
    public void test() {
        installReferenceModelProject();
        runAsDataHubOperator();

        final String flowName = "ingestToFinal";

        RunFlowResponse flowResponse = flowRunner.runFlow(new FlowInputs(flowName, "1").withJobId("job1"));
        flowRunner.awaitCompletion();
        RunStepResponse stepResponse = flowResponse.getStepResponses().get("1");
        assertEquals("job1", stepResponse.getJobId());
        assertEquals(1, stepResponse.getSuccessfulBatches(), "The document should have been ingested successfully");

        final String mapXmlStep = "2";

        final Map<String, Object> options = new HashMap<>();
        options.put("constrainSourceQueryToJob", true);

        flowResponse = flowRunner.runFlow(new FlowInputs(flowName, mapXmlStep).withJobId("job2").withOptions(options));
        flowRunner.awaitCompletion();
        stepResponse = flowResponse.getStepResponses().get(mapXmlStep);
        assertEquals(0, stepResponse.getSuccessfulBatches(), "Since the sourceQuery was constrained to job2, and " +
            "no documents have that value for their datahubCreatedByJob metadata key, then nothing should have been processed");

        flowResponse = flowRunner.runFlow(new FlowInputs(flowName, mapXmlStep).withJobId("job1"));
        flowRunner.awaitCompletion();
        stepResponse = flowResponse.getStepResponses().get(mapXmlStep);
        assertEquals(1, stepResponse.getSuccessfulBatches(), "Since the sourceQuery was constrained to job1, and the " +
            "ingestion step was executed before with that jobId, then the ingested XML document should have been processed");
    }
}
