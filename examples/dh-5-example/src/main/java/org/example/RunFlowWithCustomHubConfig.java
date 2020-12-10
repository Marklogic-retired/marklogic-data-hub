package org.example;

import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;

/**
 * This example is functionally identical to RunFlowWithoutProject, but it demonstrates how a HubConfigImpl instance
 * can be manually created and then used to instantiate a FlowRunnerImpl when it's not sufficient to simply pass in
 * host/username/password.
 */
public class RunFlowWithCustomHubConfig {

    public static void main(String[] args) {
        final String host = args[0];
        final String username = args[1];
        final String password = args[2];
        final String inputFilePath = args[3];

        HubConfigImpl hubConfig = HubConfigImpl.withDefaultProperties();
        hubConfig.setHost(host);
        hubConfig.setMlUsername(username);
        hubConfig.setMlPassword(password);
        // Can further customize hubConfig as needed

        FlowRunner flowRunner = new FlowRunnerImpl(hubConfig);

        RunFlowWithoutProject.runFlow(flowRunner, inputFilePath);
    }
}
