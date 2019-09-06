package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ScaffoldingImplTest {

    @Test
    public void buildFlowFromDefaultFlow() throws Exception {
        Map<String, String> customTokens = new HashMap<>();
        customTokens.put("%%mlStagingDbName%%", "my-staging");
        customTokens.put("%%mlFinalDbName%%", "my-final");
        customTokens.put("%%mlFlowName%%", "my-flow");

        String flow = new ScaffoldingImpl().buildFlowFromDefaultFlow(customTokens);
        JsonNode json = new ObjectMapper().readTree(flow);

        assertEquals("my-flow", json.get("name").asText());

        JsonNode mappingOptions = json.get("steps").get("2").get("options");
        assertEquals("my-staging", mappingOptions.get("sourceDatabase").asText());
        assertEquals("my-final", mappingOptions.get("targetDatabase").asText());
        assertEquals(false, mappingOptions.get("validateEntity").asBoolean(),
            "Per DHFPROD-2811, we now want to scaffold out a mapping step with " +
                "validateEntity:false. That way, entity validation is not turned on, but a " +
                "user can see that the feature is available.");
    }
}
