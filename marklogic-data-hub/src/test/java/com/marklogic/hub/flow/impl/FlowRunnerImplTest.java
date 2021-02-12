package com.marklogic.hub.flow.impl;

import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

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

    @Test
    void configureStopOnError() {
        FlowRunnerImpl flowRunner = new FlowRunnerImpl();
        Flow flow = new FlowImpl();

        Map<String, Object> options = new HashMap<>();
        options.put("stopOnError", true);
        flowRunner.configureStopOnError(flow, options);
        assertTrue(flow.isStopOnError());

        flow = new FlowImpl();
        options.put("stopOnError", "true");
        flowRunner.configureStopOnError(flow, options);
        assertTrue(flow.isStopOnError());

        flow = new FlowImpl();
        options.put("stopOnError", "true");
        flowRunner.configureStopOnError(flow, options);
        assertTrue(flow.isStopOnError());

        flow = new FlowImpl();
        options.put("stopOnError", "false");
        flowRunner.configureStopOnError(flow, options);
        assertFalse(flow.isStopOnError());

        flow = new FlowImpl();
        flowRunner.configureStopOnError(flow, new HashMap<>());
        assertFalse(flow.isStopOnError());
    }
}
