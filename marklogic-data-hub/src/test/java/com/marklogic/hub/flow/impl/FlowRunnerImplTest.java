package com.marklogic.hub.flow.impl;

import com.marklogic.hub.flow.RunFlowResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class FlowRunnerImplTest {

    @Test
    void copyJobDataToResponse() {
        RunFlowResponse jobDocument = new RunFlowResponse();
        jobDocument.setStartTime("2019-01-01T00:00:00");
        jobDocument.setEndTime("2019-01-01T01:00:00");
        jobDocument.setUser("someone");
        jobDocument.setLastAttemptedStep("3");
        jobDocument.setLastCompletedStep("2");

        RunFlowResponse response = new RunFlowResponse();
        new FlowRunnerImpl().copyJobDataToResponse(response, jobDocument);
        assertEquals("2019-01-01T00:00:00", response.getStartTime());
        assertEquals("2019-01-01T01:00:00", response.getEndTime());
        assertEquals("someone", response.getUser());
        assertEquals("3", response.getLastAttemptedStep());
        assertEquals("2", response.getLastCompletedStep());
    }
}
