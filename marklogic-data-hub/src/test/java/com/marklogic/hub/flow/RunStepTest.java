package com.marklogic.hub.flow;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.SimpleHubConfig;
import com.marklogic.hub.step.MarkLogicStepDefinitionProvider;
import com.marklogic.hub.step.StepRunnerFactory;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class RunStepTest {

    /**
     * To use QueryStepRunner, we need a staging client (which can point to any "source" database), a job
     * client, and a destination database. So we add a constructor to QueryStepRunner to accept that so
     * we don't have to construct a HubConfig.
     *
     * @param args
     * @throws IOException
     */
    public static void main(String[] args) {
        final String host = "localhost";
        final String username = "admin";
        final String password = "admin";

        SimpleHubConfig hubConfig = new SimpleHubConfig();
        AppConfig config = new AppConfig();
        config.setHost(host);
        hubConfig.setHost(host);
        hubConfig.setAppConfig(new AppConfig());
        hubConfig.setMlUsername(username);
        hubConfig.setMlPassword(password);

        Map<String, Object> flowOptions = new HashMap<>();
        //flowOptions.put("disableJobOutput", true);

        Map<String, Object> stepConfig = new HashMap<>();
        Map<String, String> fileLocations = new HashMap<>();
        fileLocations.put("inputFilePath", "/Users/rrudin/dev/workspace/marklogic-data-hub/examples/json-mapping-example/data");
        stepConfig.put("fileLocations", fileLocations);

        StepRunnerFactory stepRunnerFactory = new StepRunnerFactory(hubConfig);
        stepRunnerFactory.setStepDefinitionProvider(new MarkLogicStepDefinitionProvider(hubConfig.newStagingClient()));
        FlowRunnerImpl flowRunner = new FlowRunnerImpl(hubConfig, stepRunnerFactory);
        RunFlowResponse response = flowRunner.runFlowDefinedInMarkLogic("jsonToJson", Arrays.asList("1", "2"), "run123", flowOptions, stepConfig);
        flowRunner.awaitCompletion();
        System.out.println(response);
    }
}
