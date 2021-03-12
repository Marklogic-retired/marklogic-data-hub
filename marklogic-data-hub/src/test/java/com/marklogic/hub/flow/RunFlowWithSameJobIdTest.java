package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.job.JobDocManager;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertTrue;

public class RunFlowWithSameJobIdTest extends AbstractHubCoreTest {

    @Test
    void test() {
        JobDocManager jobDocManager = new JobDocManager(getHubClient().getJobsClient());
        installProjectInFolder("test-projects/simple-customer-flow");

        runFlow(new FlowInputs("simpleCustomerFlow", "1").withJobId("abc123"));

        ObjectNode firstFlowResponse = (ObjectNode) jobDocManager.getLatestJobDocumentForFlow("simpleCustomerFlow");
        LocalDateTime timeStarted1 = parseDateTime(firstFlowResponse.get("job").get("timeStarted").asText());
        LocalDateTime timeEnded1 = parseDateTime(firstFlowResponse.get("job").get("timeEnded").asText());
        LocalDateTime stepStartTime1 = parseDateTime(firstFlowResponse.get("job").get("stepResponses").get("1").get("stepStartTime").asText());
        LocalDateTime stepEndTime1 = parseDateTime(firstFlowResponse.get("job").get("stepResponses").get("1").get("stepEndTime").asText());

        runFlow(new FlowInputs("simpleCustomerFlow", "1").withJobId("abc123"));

        ObjectNode secondFlowResponse = (ObjectNode) jobDocManager.getLatestJobDocumentForFlow("simpleCustomerFlow");
        LocalDateTime timeStarted2 = parseDateTime(secondFlowResponse.get("job").get("timeStarted").asText());
        LocalDateTime timeEnded2 = parseDateTime(secondFlowResponse.get("job").get("timeEnded").asText());
        LocalDateTime stepStartTime2 = parseDateTime(secondFlowResponse.get("job").get("stepResponses").get("1").get("stepStartTime").asText());
        LocalDateTime stepEndTime2 = parseDateTime(secondFlowResponse.get("job").get("stepResponses").get("1").get("stepEndTime").asText());

        assertTrue(timeEnded1.isAfter(timeStarted1));
        assertTrue(stepEndTime1.isAfter(stepStartTime1));

        assertTrue(timeStarted2.isAfter(timeEnded1));
        assertTrue(stepStartTime2.isAfter(timeEnded1));
        assertTrue(timeEnded2.isAfter(timeStarted1));
        assertTrue(stepEndTime2.isAfter(stepStartTime2));
    }
}
