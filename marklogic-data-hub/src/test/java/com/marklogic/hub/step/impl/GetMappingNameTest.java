package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class GetMappingNameTest {

    Step step;
    ObjectNode mapping;

    @BeforeEach
    public void setup() {
        step = new Step();
        step.setStepDefinitionType(StepDefinition.StepDefinitionType.MAPPING);
        step.setOptions(new HashMap<>());
        mapping = ObjectMapperFactory.getObjectMapper().createObjectNode();
    }

    @Test
    public void nullOptions() {
        step.setOptions(null);
        assertNull(step.getMappingName());
    }

    @Test
    public void noMapping() {
        assertNull(step.getMappingName());
    }

    @Test
    public void mappingIsntObjectNode() {
        step.getOptions().put("mapping", "not an object node");
        assertNull(step.getMappingName());
    }

    @Test
    public void hasObjectNodeWithNoName() {
        step.getOptions().put("mapping", mapping);
        assertNull(step.getMappingName());
    }

    @Test
    public void hasMappingName() {
        step.getOptions().put("mapping", mapping);
        mapping.put("name", "my name");
        assertEquals("my name", step.getMappingName());
    }
}
