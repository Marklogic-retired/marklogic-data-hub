package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.ModelController;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ModelControllerTest extends AbstractHubCentralTest {

    private final static String MODEL_NAME = "Customer";

    @Autowired
    ModelController controller;

    @Test
    @WithMockUser(roles = {"readEntityModel", "writeEntityModel"})
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

        // Create a customer in final so we have a way to verify the entity instance count
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"));
        ArrayNode entityTypes = (ArrayNode) controller.getPrimaryEntityTypes().getBody();
        assertEquals(1, entityTypes.size(), "A new model should have been created " +
            "and thus there should be one primary entity type");

        JsonNode customerType = entityTypes.get(0);
        assertEquals("Customer", customerType.get("entityName").asText());
        assertEquals(1, customerType.get("entityInstanceCount").asInt(),
            "Should have a count of one because there's one document in the 'Customer' collection");

    }

    private void updateModelInfo() {
        ModelController.UpdateModelInfoInput info = new ModelController.UpdateModelInfoInput();
        info.description = "Updated description";
        controller.updateModelInfo(MODEL_NAME, info);

        assertEquals("Updated description", loadModel(getHubClient().getFinalClient()).get("definitions").get(MODEL_NAME).get("description").asText());
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
            controller.updateModelEntityTypes(objectMapper.readTree(entityTypes), MODEL_NAME);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }

        assertEquals("string", loadModel(getHubClient().getFinalClient()).get("definitions").get(MODEL_NAME).get("properties").get("someProperty").get("datatype").asText());
    }

    private JsonNode loadModel(DatabaseClient client) {
        return client.newJSONDocumentManager().read("/entities/" + MODEL_NAME + ".entity.json", new JacksonHandle()).get();
    }
}
