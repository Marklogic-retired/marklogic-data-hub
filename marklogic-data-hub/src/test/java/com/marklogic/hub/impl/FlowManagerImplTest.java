package com.marklogic.hub.impl;

import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class FlowManagerImplTest extends HubTestBase {

    @Autowired
    FlowManagerImpl flowManager;

    @Test
    public void mappingIsReferencedByAFlow() {
        copyTestFlowIntoProject();

        assertEquals(1, flowManager.getFlows().size());
        assertTrue(flowManager.stepIsReferencedByAFlow("person-mapping1.json", StepDefinition.StepDefinitionType.MAPPING));
        assertFalse(flowManager.stepIsReferencedByAFlow("mapping-that-doesnt-exist", StepDefinition.StepDefinitionType.MAPPING));
    }
}
