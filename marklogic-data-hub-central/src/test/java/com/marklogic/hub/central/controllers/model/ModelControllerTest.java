package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.ModelController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.File;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class ModelControllerTest extends AbstractHubCentralTest {

    private final static String MODEL_NAME = "UiTestEntity";

    @Autowired
    ModelController controller;

    @Test
    void testModelsServicesEndpoints() {
        createModel();
        updateModelInfo();
        updateModelEntityTypes();
    }

    private void createModel() {
        ArrayNode existingEntityTypes = (ArrayNode) controller.getPrimaryEntityTypes().getBody();
        assertEquals(0, existingEntityTypes.size(), "Any existing models should have been deleted when this test started");

        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", MODEL_NAME);
        JsonNode model = controller.createModel(input).getBody();
        assertEquals(MODEL_NAME, model.get("info").get("title").asText());

        ArrayNode entityTypes = (ArrayNode) controller.getPrimaryEntityTypes().getBody();
        assertEquals(1, entityTypes.size(), "A new model should have been created " +
            "and thus there should be one primary entity type");
    }

    private void updateModelInfo() {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("description", "Updated description");
        controller.updateModelInfo(MODEL_NAME, input);

        assertEquals("Updated description", loadModel(getHubConfig().newFinalClient()).get("definitions").get(MODEL_NAME).get("description").asText());
    }

    private void updateModelEntityTypes() {
        String entityTypes = "{\"" + MODEL_NAME + "\" : {\n" +
            "      \"required\" : [ ],\n" +
            "      \"properties\" : {\n" +
            "        \"someProperty\" : {\n" +
            "          \"datatype\" : \"string\",\n" +
            "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
            "        }\n" +
            "      }\n" +
            "    }}";

        try {
            controller.updateModelEntityTypes(MODEL_NAME, objectMapper.readTree(entityTypes));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        assertEquals("string", loadModel(getHubConfig().newFinalClient()).get("definitions").get(MODEL_NAME).get("properties").get("someProperty").get("datatype").asText());
    }

    private JsonNode loadModel(DatabaseClient client) {
        return client.newJSONDocumentManager().read("/entities/" + MODEL_NAME + ".entity.json", new JacksonHandle()).get();
    }
}
