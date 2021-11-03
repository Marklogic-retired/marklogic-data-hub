package com.marklogic.hub.flow;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class DisableJobOutputTest extends AbstractHubCoreTest {

    private final static String FLOW_NAME = "simpleCustomStepFlow";

    @BeforeEach
    void beforeEach() {
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"), "staging");
    }

    @Test
    void jobOutputDisabled() {
        runSuccessfulFlow(new FlowInputs(FLOW_NAME).withOption("disableJobOutput", "true"));

        assertEquals(0, getJobDocCount());
        assertEquals(0, getBatchDocCount());
    }

    @Test
    void jobOutputDisabledViaFlowOptions() {
        setDisableJobOutputInFlowOptions(true);
        runSuccessfulFlow(new FlowInputs(FLOW_NAME));

        assertEquals(0, getJobDocCount(), "Per DHFPROD-7210, disableJobOutput is now honored when defined in flow options");
        assertEquals(0, getBatchDocCount());
    }

    @Test
    void jobOutputIsEnabledViaFlowOptions() {
        setDisableJobOutputInFlowOptions(true);

        runSuccessfulFlow(new FlowInputs(FLOW_NAME).withOption("disableJobOutput", "false"));

        assertEquals(1, getJobDocCount(), "The runtime option is expected to take precedence over the flow option");
        assertEquals(1, getBatchDocCount());
    }

    private void setDisableJobOutputInFlowOptions(boolean value) {
        ObjectNode flow = (ObjectNode)getStagingDoc(format("/flows/%s.flow.json", FLOW_NAME));
        flow.putObject("options").put("disableJobOutput", value);
        ArtifactService.on(getHubClient().getStagingClient()).setArtifact("flow", FLOW_NAME, flow, "");
    }
}
