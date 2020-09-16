package com.marklogic.hub.impl;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.step.StepDefinition;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class FlowManagerImplTest extends AbstractHubCoreTest {

    @Autowired
    FlowManagerImpl flowManager;

    @Test
    public void mappingIsReferencedByAFlow() throws IOException {
        FileUtils.copyFileToDirectory(
            getResourceFile("flow-manager-test/test-flow.flow.json"),
            getHubProject().getFlowsDir().toFile()
        );

        assertEquals(1, flowManager.getFlows().size());
        assertTrue(flowManager.stepIsReferencedByAFlow("person-mapping1.json", StepDefinition.StepDefinitionType.MAPPING));
        assertFalse(flowManager.stepIsReferencedByAFlow("mapping-that-doesnt-exist", StepDefinition.StepDefinitionType.MAPPING));
    }
}
