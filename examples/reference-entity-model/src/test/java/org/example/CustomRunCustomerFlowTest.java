package org.example;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.ext.junit5.HubConfigManager;
import com.marklogic.hub.ext.junit5.PrepareDatabasesTestExecutionListener;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * This test demonstrates how to reuse the test support provided by marklogic-data-hub-junit5 without being forced to
 * extend the AbstractDataHubTest class. By not depending on any base class, you can use this as a reference for how to
 * integrate marklogic-data-hub-junit5 into your own test project.
 * <p>
 * This still depends on JUnit5 and the spring-test library; it just provides an example of how to wire up the Spring
 * and marklogic-data-hub-junit5 support yourself, which you are then free to customize as you see fit.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {CustomTestConfig.class})
@TestExecutionListeners(
    // This tells spring-test to apply all of its default test execution listeners, in addition to the ones specified below
    mergeMode = TestExecutionListeners.MergeMode.MERGE_WITH_DEFAULTS,
    // This listener depends on an instance of DatabasePreparer in the Spring container
    listeners = {PrepareDatabasesTestExecutionListener.class}
)
public class CustomRunCustomerFlowTest {

    @Autowired
    HubConfigManager hubConfigManager;

    @Test
    void test() {
        HubConfig hubConfig = hubConfigManager.getHubConfig();
        FlowRunner flowRunner = new FlowRunnerImpl(hubConfig, new FlowManagerImpl(hubConfig));

        RunFlowResponse response = flowRunner.runFlow(new FlowInputs("CurateCustomerJSON", "1", "2"));
        flowRunner.awaitCompletion();
        assertEquals("finished", response.getJobStatus());
    }
}
