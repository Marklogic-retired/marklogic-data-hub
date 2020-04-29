package com.marklogic.hub.impl;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.step.StepDefinition;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class FlowManagerImplTest extends HubTestBase {

    @Autowired
    FlowManagerImpl flowManager;

    @Test
    public void mappingIsReferencedByAFlow() throws IOException {
        resetHubProject();

        FileUtils.copyFileToDirectory(
            getResourceFile("flow-manager-test/test-flow.flow.json"),
            adminHubConfig.getFlowsDir().toFile()
        );

        assertEquals(1, flowManager.getFlows().size());
        assertTrue(flowManager.stepIsReferencedByAFlow("person-mapping1.json", StepDefinition.StepDefinitionType.MAPPING));
        assertFalse(flowManager.stepIsReferencedByAFlow("mapping-that-doesnt-exist", StepDefinition.StepDefinitionType.MAPPING));
    }
}
