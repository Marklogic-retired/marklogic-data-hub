package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ScaffoldingImplTest {

    private Map<String, String> customTokens;

    @BeforeEach
    public void setup() {
        customTokens = new HashMap<>();
        customTokens.put("%%mlStagingDbName%%", "my-staging");
        customTokens.put("%%mlFinalDbName%%", "my-final");
        customTokens.put("%%mlFlowName%%", "my-flow");
    }

    @Test
    public void buildFlowFromDefaultFlow() throws Exception {
        String flow = new ScaffoldingImpl().buildFlowFromDefaultFlow(customTokens, true);
        JsonNode json = new ObjectMapper().readTree(flow);

        assertEquals("my-flow", json.get("name").asText());

        JsonNode stepTwo = json.get("steps").get("2");
        assertEquals("entity-services-mapping", stepTwo.get("stepDefinitionName").asText());

        JsonNode mappingOptions = stepTwo.get("options");
        assertEquals("my-staging", mappingOptions.get("sourceDatabase").asText());
        assertEquals("my-final", mappingOptions.get("targetDatabase").asText());
        assertEquals(false, mappingOptions.get("validateEntity").asBoolean(),
            "Per DHFPROD-2811, we now want to scaffold out a mapping step with " +
                "validateEntity:false. That way, entity validation is not turned on, but a " +
                "user can see that the feature is available.");
    }

    @Test
    public void buildFlowWhenNotSupportingEntityServicesMapping() throws Exception {
        String flow = new ScaffoldingImpl().buildFlowFromDefaultFlow(customTokens, false);
        JsonNode json = new ObjectMapper().readTree(flow);

        JsonNode stepTwo = json.get("steps").get("2");
        assertEquals("default-mapping", stepTwo.get("stepDefinitionName").asText(),
            "When ES mapping is not supported, the mapping step should use the 'default-mapping' step definition");
    }
}
