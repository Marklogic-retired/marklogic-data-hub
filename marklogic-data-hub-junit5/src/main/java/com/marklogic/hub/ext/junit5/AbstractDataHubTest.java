package com.marklogic.hub.ext.junit5;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.junit.jupiter.SpringExtension;

/**
 * Intended as a useful base class for DHF project-specific tests. Instantiates a Spring container via the
 * HubTestConfig class, and then makes use of an instance of DatabasePreparer via PrepareDatabasesTestExecutionListener.
 * Also provides a few convenience methods for running a flow and accessing common DHF objects.
 * <p>
 * If the functionality provided by this is not exactly what you want, try using this class as a starting point for
 * creating your own base test class.
 */
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
        HubConfig hubConfig = getHubConfigManager().getHubConfig();
        return new FlowRunnerImpl(hubConfig, new FlowManagerImpl(hubConfig));
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

    protected HubClient getHubClient() {
        return getHubConfigManager().getHubClient();
    }

    protected HubConfig getHubConfig() {
        return getHubConfigManager().getHubConfig();
    }

}

