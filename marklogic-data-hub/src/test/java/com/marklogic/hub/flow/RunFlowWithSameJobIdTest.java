package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.job.JobDocManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RunFlowWithSameJobIdTest extends AbstractHubCoreTest {

    @Test
    void test() {
        JobDocManager jobDocManager = new JobDocManager(getHubClient().getJobsClient());
        installProjectInFolder("test-projects/simple-customer-flow");
        FlowRunnerImpl flowRunner = new FlowRunnerImpl(getHubConfig(), new FlowManagerImpl(getHubConfig()));

        flowRunner.runFlow(new FlowInputs("simpleCustomerFlow", "1").withJobId("abc123"));
        flowRunner.awaitCompletion();

        ObjectNode firstFlowResponse = (ObjectNode) jobDocManager.getLatestJobDocumentForFlow("simpleCustomerFlow");
        String timeStarted1= firstFlowResponse.get("job").get("timeStarted").asText();
        String timeEnded1= firstFlowResponse.get("job").get("timeEnded").asText();
        String stepsStartTime1= firstFlowResponse.get("job").get("stepResponses").get("1").get("stepStartTime").asText();
        String stepsEndTime1= firstFlowResponse.get("job").get("stepResponses").get("1").get("stepEndTime").asText();

        flowRunner.runFlow(new FlowInputs("simpleCustomerFlow", "1").withJobId("abc123"));
        flowRunner.awaitCompletion();

        ObjectNode secondFlowResponse = (ObjectNode) jobDocManager.getLatestJobDocumentForFlow("simpleCustomerFlow");
        String timeStarted2= secondFlowResponse.get("job").get("timeStarted").asText();
        String timeEnded2= secondFlowResponse.get("job").get("timeEnded").asText();
        String stepsStartTime2= secondFlowResponse.get("job").get("stepResponses").get("1").get("stepStartTime").asText();
        String stepsEndTime2= secondFlowResponse.get("job").get("stepResponses").get("1").get("stepEndTime").asText();

        Boolean result = timeStarted1.equals(timeStarted2) || timeEnded1.equals(timeEnded2) || stepsStartTime1.equals(stepsStartTime2) || stepsEndTime1.equals(stepsEndTime2);
        assertEquals(false,result);
    }
}
