package com.marklogic.hub.step.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class SourceModuleCollectorTest extends AbstractHubCoreTest {
    @BeforeEach
    public void setUpProject() {
        installProjectInFolder("test-projects/source-module-collector");
    }

    @Test
    public void testMappingStep() {
        FlowInputs flowInputs = new FlowInputs();
        flowInputs.setFlowName("sourceModuleTestFlow");
        flowInputs.setSteps(Arrays.asList("1", "2"));
        addAbsoluteInputFilePath(flowInputs, "data/customers");
        runFlow(flowInputs);
        assertEquals(1, getDocCount("data-hub-STAGING", "loadCustomersJSON"));
        assertNotNull(getStagingDoc("customer1.json"));
        assertEquals(1, getDocCount("data-hub-FINAL", "Customer"));
        assertNotNull(getFinalDoc("customer1.json"));
    }

    @Test
    public void testCustomStep() {
        FlowInputs flowInputs = new FlowInputs();
        flowInputs.setFlowName("sourceModuleTestFlow");
        flowInputs.setSteps(Arrays.asList("1", "3"));
        addAbsoluteInputFilePath(flowInputs, "data/customers");
        runFlow(flowInputs);
        assertEquals(1, getDocCount("data-hub-STAGING", "loadCustomersJSON"));
        assertNotNull(getStagingDoc("customer1.json"));
        assertEquals(1, getDocCount("data-hub-FINAL", "Customer"));
        assertNotNull(getFinalDoc("customer1.json"));
    }

    @Test
    public void testSourceModuleConfigNotDefined() {
        FlowInputs flowInputs = new FlowInputs();
        flowInputs.setFlowName("sourceModuleTestFlow");
        flowInputs.setSteps(Arrays.asList("1", "4"));
        addAbsoluteInputFilePath(flowInputs, "data/customers");
        RunFlowResponse response = runFlow(flowInputs);
        assertFalse(response.getStepResponses().get("4").isSuccess());
    }
}
