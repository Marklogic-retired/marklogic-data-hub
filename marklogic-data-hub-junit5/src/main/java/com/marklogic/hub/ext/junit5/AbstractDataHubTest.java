package com.marklogic.hub.ext.junit5;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {HubTestConfig.class})
@TestExecutionListeners(
    mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS,
    listeners = {PrepareDatabasesTestExecutionListener.class}
)
public abstract class AbstractDataHubTest extends LoggingObject {

    @Autowired
    HubConfigManager hubConfigManager;

    protected FlowRunner newFlowRunner() {
        return new FlowRunnerImpl(getHubConfig(), new FlowManagerImpl(getHubConfig()));
    }

    protected RunFlowResponse runFlow(FlowInputs flowInputs) {
        FlowRunner flowRunner = newFlowRunner();
        RunFlowResponse response = flowRunner.runFlow(flowInputs);
        flowRunner.awaitCompletion();
        return response;
    }

    protected HubConfigManager getHubConfigManager() {
        return hubConfigManager;
    }

    protected HubConfigImpl getHubConfig() {
        return getHubConfigManager().getHubConfig();
    }

    protected HubClient getHubClient() {
        return getHubConfigManager().getHubClient();
    }

}

