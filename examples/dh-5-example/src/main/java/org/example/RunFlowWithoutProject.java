package org.example;

import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;

/**
 * This demonstrates a simple approach for instantiating a FlowRunnerImpl via a host/username/password and then running
 * all the steps in the ingestion_mapping_mastering-flow flow. Because the ingestion step in that flow defaults to
 * having a relative file path, this example must override "inputFilePath" with an absolute file path in order for the
 * ingestion step to work (a HubProject would normally be used to do that, but this is demonstrating how to run a flow
 * without a HubProject).
 * <p>
 * This example can be run via the "runFlowWithoutProject" Gradle task in this project.
 */
public class RunFlowWithoutProject {

    public static void main(String[] args) {
        final String host = args[0];
        final String username = args[1];
        final String password = args[2];
        final String inputFilePath = args[3];

        FlowRunner flowRunner = new FlowRunnerImpl(host, username, password);
        runFlow(flowRunner, inputFilePath);
    }

    static void runFlow(FlowRunner flowRunner, String inputFilePath) {
        final String flowName = "ingestion_mapping_mastering-flow";
        FlowInputs inputs = new FlowInputs(flowName);
        // This is needed so that an absolute file path is used
        inputs.setInputFilePath(inputFilePath);

        System.out.println("Running flow: " + flowName);
        RunFlowResponse response = flowRunner.runFlowWithoutProject(inputs);
        flowRunner.awaitCompletion();
        System.out.println("Response: " + response);
    }
}
