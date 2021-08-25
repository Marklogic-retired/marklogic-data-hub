package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ModelsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CreateAndUpdateModelTest extends AbstractHubCoreTest {

    private final static String CUSTOMER_MODEL_NAME = "CreateModelTestEntity";
    private final static String ORDER_MODEL_NAME = "OrderModelTestEntity";
    private final static String EXPECTED_CUSTOMER_MODEL_URI = "/entities/" + CUSTOMER_MODEL_NAME + ".draft.entity.json";
    private final static String EXPECTED_ORDER_MODEL_URI = "/entities/" + ORDER_MODEL_NAME + ".draft.entity.json";

    private ModelsService service;

    @BeforeEach
    void beforeEach() {
        service = ModelsService.on(getHubClient().getFinalClient());
    }

    @Test
    void createAndUpdateInfoThenUpdateEntityTypes() {
        ObjectNode customerNode = newModel(CUSTOMER_MODEL_NAME);
        customerNode.put("description", "Initial description");
        JsonNode model = service.createDraftModel(customerNode);
        service.createDraftModel(newModel(ORDER_MODEL_NAME));

        verifyModelContents(model, "Initial description");
        verifyPersistedModels("Initial description");

        customerNode.put("description", "Modified description");
        service.updateDraftModelInfo(CUSTOMER_MODEL_NAME, customerNode);
        verifyPersistedModels("Modified description");

        updateEntityTypes();
        updateEntityTypesWithInvalidData();
    }

    /**
     * validateModelDefinitions.sjs covers all validation rules.
     */
    @Test
    void invalidEntityName() {
        try {
            service.createDraftModel(newModel("Spaces are not allowed"));
            fail("Expected error because spaces are not allowed in an entity name");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
            assertTrue(ex.getMessage().contains("must start with a letter"));
        }
    }

    @Test
    void entityNameIsAlreadyUsed() {
        service.createDraftModel(newModel("TestName"));
        try {
            service.createDraftModel(newModel("TestName"));
            fail("Expected a failure because a model already exists with the same name");
        } catch (FailedRequestException ex) {
            assertEquals(400, ex.getServerStatusCode());
            assertEquals("An entity type already exists with a name of TestName", ex.getServerStatus());
        }
    }

    @Test
    void entityNameMissing() {
        try {
            service.createDraftModel(objectMapper.createObjectNode());
            fail("Expected a failure because no name was provided");
        } catch (FailedRequestException ex) {
            assertEquals(400, ex.getServerStatusCode());
            assertEquals("The model must have an info object with a title property", ex.getServerStatus());
        }
    }

    private ObjectNode newModel(String name) {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", name);
        return input;
    }

    private void verifyModelContents(JsonNode model, String expectedDescription) {
        assertEquals(CUSTOMER_MODEL_NAME, model.get("info").get("title").asText());
        assertEquals("1.0.0", model.get("info").get("version").asText());
        assertEquals("http://example.org/", model.get("info").get("baseUri").asText(),
            "Until a user can enter a baseUri via the GUI, the service will use a default value");

        assertEquals(expectedDescription, model.get("definitions").get(CUSTOMER_MODEL_NAME).get("description").asText());
    }

    /**
     * Verify the model in the ML databases and in the project filesystem.
     *
     * @param expectedDescription
     */
    private void verifyPersistedModels(String expectedDescription) {
        JSONDocumentManager stagingMgr = getHubClient().getStagingClient().newJSONDocumentManager();
        JSONDocumentManager finalMgr = getHubClient().getFinalClient().newJSONDocumentManager();

        verifyModelContents(stagingMgr.read(EXPECTED_CUSTOMER_MODEL_URI, new JacksonHandle()).get(), expectedDescription);
        verifyModelContents(finalMgr.read(EXPECTED_CUSTOMER_MODEL_URI, new JacksonHandle()).get(), expectedDescription);

        verifyModelMetadata(stagingMgr.readMetadata(EXPECTED_CUSTOMER_MODEL_URI, new DocumentMetadataHandle()));
        verifyModelMetadata(finalMgr.readMetadata(EXPECTED_CUSTOMER_MODEL_URI, new DocumentMetadataHandle()));
    }

    private void verifyModelMetadata(DocumentMetadataHandle metadata) {
        assertEquals("http://marklogic.com/entity-services/models/draft", metadata.getCollections().iterator().next());
        DocumentMetadataHandle.DocumentPermissions perms = metadata.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-entity-model-reader").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-entity-model-writer").iterator().next());
    }

    private void updateEntityTypes() {
        String entityTypes = "[{\"entityName\":\"" + CUSTOMER_MODEL_NAME + "\",\"modelDefinition\":{\"" + CUSTOMER_MODEL_NAME + "\" : {\n" +
                "      \"required\" : [ ],\n" +
                "      \"properties\" : {\n" +
                "        \"someProperty\" : {\n" +
                "          \"datatype\" : \"string\",\n" +
                "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
                "        }\n" +
                "      }\n" +
                "    }}}," +
                "{\"entityName\":\"" + ORDER_MODEL_NAME + "\",\"modelDefinition\":{\"" + ORDER_MODEL_NAME + "\" : {\n" +
                "      \"required\" : [ ],\n" +
                "      \"properties\" : {\n" +
                "        \"someOtherProperty\" : {\n" +
                "          \"datatype\" : \"string\",\n" +
                "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
                "        }\n" +
                "      }\n" +
                "    }}}]";
        service.updateDraftModelEntityTypes(readJsonArray(entityTypes));

        JSONDocumentManager stagingMgr = getHubClient().getStagingClient().newJSONDocumentManager();
        JSONDocumentManager finalMgr = getHubClient().getFinalClient().newJSONDocumentManager();

        JsonNode model = stagingMgr.read(EXPECTED_CUSTOMER_MODEL_URI, new JacksonHandle()).get();
        assertEquals("string", model.get("definitions").get(CUSTOMER_MODEL_NAME).get("properties").get("someProperty").get("datatype").asText());
        model = finalMgr.read(EXPECTED_CUSTOMER_MODEL_URI, new JacksonHandle()).get();
        assertEquals("string", model.get("definitions").get(CUSTOMER_MODEL_NAME).get("properties").get("someProperty").get("datatype").asText());

        verifyModelMetadata(stagingMgr.readMetadata(EXPECTED_CUSTOMER_MODEL_URI, new DocumentMetadataHandle()));
        verifyModelMetadata(finalMgr.readMetadata(EXPECTED_CUSTOMER_MODEL_URI, new DocumentMetadataHandle()));

        model = stagingMgr.read(EXPECTED_ORDER_MODEL_URI, new JacksonHandle()).get();
        assertEquals("string", model.get("definitions").get(ORDER_MODEL_NAME).get("properties").get("someOtherProperty").get("datatype").asText());
        model = finalMgr.read(EXPECTED_ORDER_MODEL_URI, new JacksonHandle()).get();
        assertEquals("string", model.get("definitions").get(ORDER_MODEL_NAME).get("properties").get("someOtherProperty").get("datatype").asText());

        verifyModelMetadata(stagingMgr.readMetadata(EXPECTED_ORDER_MODEL_URI, new DocumentMetadataHandle()));
        verifyModelMetadata(finalMgr.readMetadata(EXPECTED_ORDER_MODEL_URI, new DocumentMetadataHandle()));
    }

    private void updateEntityTypesWithInvalidData() {
        String entityTypes = "[{\"entityName\":\""+ CUSTOMER_MODEL_NAME +"\",\"modelDefinition\":{\"" + CUSTOMER_MODEL_NAME + "\" : {\n" +
            "      \"required\" : [ ],\n" +
            "      \"properties\" : {\n" +
            "        \"1cantStartWithANumber\" : {\n" +
            "          \"datatype\" : \"string\"\n" +
            "        }\n" +
            "      }\n" +
            "    }}}]";
        JsonNode input = readJsonArray(entityTypes);

        try {
            service.updateDraftModelEntityTypes(input);
            fail("Expected an error because of an invalid property name");
        } catch (Exception ex) {
            logger.info("Caught expected error: " + ex.getMessage());
            assertTrue(ex.getMessage().contains("it must be a valid NCName"));
        }
    }
}
