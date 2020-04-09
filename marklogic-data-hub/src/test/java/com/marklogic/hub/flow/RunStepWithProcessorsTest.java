package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubTest;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import org.junit.jupiter.api.Test;

public class RunStepWithProcessorsTest extends AbstractHubTest {

    @Test
    void test() {
        loadReferenceModelProject();

        // TODO newFlowRunner()?
//        FlowRunner flowRunner = new FlowRunnerImpl(host, adminHubConfig.getMlUsername(), adminHubConfig.getMlPassword());
//        RunFlowResponse response = flowRunner.runFlow(new FlowInputs("stepProcessors"));
//        flowRunner.awaitCompletion();
//
//        System.out.println(response.toJson());
    }
}
