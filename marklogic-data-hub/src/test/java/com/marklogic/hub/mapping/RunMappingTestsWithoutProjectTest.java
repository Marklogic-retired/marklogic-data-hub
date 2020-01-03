package com.marklogic.hub.mapping;

import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;

/**
 * Extends MappingTest so that each of its tests can be run via the runFlowWithoutProject method.
 */
public class RunMappingTestsWithoutProjectTest extends MappingTest {

    @Override
    protected RunFlowResponse runFlow(String flowName, String... stepIds) {
        makeInputFilePathsAbsoluteInFlow(flowName);
        FlowRunner flowRunner = new FlowRunnerImpl(host, flowRunnerUser, flowRunnerPassword);
        FlowInputs inputs = new FlowInputs(flowName, stepIds);
        RunFlowResponse response = flowRunner.runFlowWithoutProject(inputs);
        flowRunner.awaitCompletion();
        return response;
    }

}
