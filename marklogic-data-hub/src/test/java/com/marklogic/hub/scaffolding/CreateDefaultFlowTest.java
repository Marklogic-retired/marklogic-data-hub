package com.marklogic.hub.scaffolding;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.ScaffoldingImpl;
import org.junit.jupiter.api.Test;

import java.io.File;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CreateDefaultFlowTest extends AbstractHubCoreTest {

    @Test
    void test() {
        File file = new ScaffoldingImpl(getHubConfig()).createDefaultFlow("defaultFlowTest");
        ObjectNode json = readJsonObject(file);
        JsonNode mappingStep = json.get("steps").get("2");
        
        assertEquals("mapping-step", mappingStep.get("name").asText());
        assertEquals(
            "Change this to a valid entity type name; e.g. Customer",
            mappingStep.get("options").get("targetEntity").asText(),
            "Though we are trying to standardize on targetEntityType as the property name on a step for determining " +
                "the entity type that it depends on, QuickStart still expects mapping steps to use targetEntity. " +
                "So when a user creates a default flow with inline steps, the mapping step must still use targetEntity " +
                "since inline steps must still work in QuickStart. Sigh.");
    }
}
