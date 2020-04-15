package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubTest;
import com.marklogic.hub.dataservices.ModelsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class CreateAndUpdateModelTest extends AbstractHubTest {

    private final static String MODEL_NAME = "CreateModelTestEntity";
    private final static String EXPECTED_URI = "/entities/" + MODEL_NAME + ".entity.json";

    private ModelsService service;
    private ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void beforeEach() {
        service = ModelsService.on(adminHubConfig.newFinalClient(null));
    }

    @Test
    void createAndUpdateInfoThenUpdateEntityTypes() throws IOException {
        ObjectNode input = mapper.createObjectNode();
        input.put("name", MODEL_NAME);
        input.put("description", "Initial description");
        JsonNode model = service.createModel(input);
        verifyModelContents(model, "Initial description");
        verifyPersistedModels("Initial description");

        service.updateModelInfo(MODEL_NAME, "Modified description");
        verifyPersistedModels("Modified description");

        updateEntityTypes();
        updateEntityTypesWithInvalidData();
    }

    /**
     * validateModelDefinitions.sjs covers all validation rules.
     */
    @Test
    void invalidEntityName() {
        ObjectNode input = mapper.createObjectNode();
        input.put("name", "Spaces not allowed");
        try {
            service.createModel(input);
            fail("Expected error because spaces are not allowed in an entity name");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
            assertTrue(ex.getMessage().contains("must start with a letter"));
        }
    }

    private void verifyModelContents(JsonNode model, String expectedDescription) {
        assertEquals(MODEL_NAME, model.get("info").get("title").asText());
        assertEquals("1.0.0", model.get("info").get("version").asText());
        assertEquals("http://example.org/", model.get("info").get("baseUri").asText(),
            "Until a user can enter a baseUri via the GUI, the service will use a default value");

        assertEquals(expectedDescription, model.get("definitions").get(MODEL_NAME).get("description").asText());
    }

    /**
     * Verify the model in the ML databases and in the project filesystem.
     *
     * @param expectedDescription
     * @throws IOException
     */
    private void verifyPersistedModels(String expectedDescription) throws IOException {
        JSONDocumentManager stagingMgr = adminHubConfig.newStagingClient().newJSONDocumentManager();
        JSONDocumentManager finalMgr = adminHubConfig.newFinalClient().newJSONDocumentManager();

        verifyModelContents(stagingMgr.read(EXPECTED_URI, new JacksonHandle()).get(), expectedDescription);
        verifyModelContents(finalMgr.read(EXPECTED_URI, new JacksonHandle()).get(), expectedDescription);

        verifyModelMetadata(stagingMgr.readMetadata(EXPECTED_URI, new DocumentMetadataHandle()));
        verifyModelMetadata(finalMgr.readMetadata(EXPECTED_URI, new DocumentMetadataHandle()));
    }

    private void verifyModelMetadata(DocumentMetadataHandle metadata) {
        assertEquals("http://marklogic.com/entity-services/models", metadata.getCollections().iterator().next());
        DocumentMetadataHandle.DocumentPermissions perms = metadata.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-entity-model-reader").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-entity-model-writer").iterator().next());
    }

    private void updateEntityTypes() throws IOException {
        String entityTypes = "{\"" + MODEL_NAME + "\" : {\n" +
            "      \"required\" : [ ],\n" +
            "      \"properties\" : {\n" +
            "        \"someProperty\" : {\n" +
            "          \"datatype\" : \"string\",\n" +
            "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
            "        }\n" +
            "      }\n" +
            "    }}";
        service.updateModelEntityTypes(MODEL_NAME, mapper.readTree(entityTypes));

        JSONDocumentManager stagingMgr = adminHubConfig.newStagingClient().newJSONDocumentManager();
        JSONDocumentManager finalMgr = adminHubConfig.newFinalClient().newJSONDocumentManager();

        JsonNode model = stagingMgr.read(EXPECTED_URI, new JacksonHandle()).get();
        assertEquals("string", model.get("definitions").get(MODEL_NAME).get("properties").get("someProperty").get("datatype").asText());
        model = finalMgr.read(EXPECTED_URI, new JacksonHandle()).get();
        assertEquals("string", model.get("definitions").get(MODEL_NAME).get("properties").get("someProperty").get("datatype").asText());

        verifyModelMetadata(stagingMgr.readMetadata(EXPECTED_URI, new DocumentMetadataHandle()));
        verifyModelMetadata(finalMgr.readMetadata(EXPECTED_URI, new DocumentMetadataHandle()));
    }

    private void updateEntityTypesWithInvalidData() throws IOException {
        String entityTypes = "{\"" + MODEL_NAME + "\" : {\n" +
            "      \"required\" : [ ],\n" +
            "      \"properties\" : {\n" +
            "        \"1cantStartWithANumber\" : {\n" +
            "          \"datatype\" : \"string\"\n" +
            "        }\n" +
            "      }\n" +
            "    }}";
        JsonNode input = mapper.readTree(entityTypes);

        try {
            service.updateModelEntityTypes(MODEL_NAME, input);
            fail("Expected an error because of an invalid property name");
        } catch (Exception ex) {
            logger.info("Caught expected error: " + ex.getMessage());
            assertTrue(ex.getMessage().contains("must start with a letter"));
        }
    }
}
