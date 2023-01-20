package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ConceptService;
import com.marklogic.hub.dataservices.ModelsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ConceptTest extends AbstractHubCoreTest {

    private final static String CUSTOMER_MODEL_NAME = "CreateModelTestConcept";
    private final static String ORDER_MODEL_NAME = "OrderModelTestConcept";
    private final static String EXPECTED_CUSTOMER_MODEL_URI = "/concepts/" + CUSTOMER_MODEL_NAME + ".draft.concept.json";
    private final static String EXPECTED_ORDER_MODEL_URI = "/concepts/" + ORDER_MODEL_NAME + ".draft.concept.json";

    private ConceptService service;
    private ModelsService modelService;

    @BeforeEach
    void beforeEach() {
        service = ConceptService.on(getHubClient().getFinalClient());
        modelService = ModelsService.on(getHubClient().getFinalClient());
    }

    @Test
    void createAndUpdateInfoThenUpdateConceptTypes() {
        ObjectNode customerNode = newModel(CUSTOMER_MODEL_NAME);
        customerNode.put("description", "Initial description");
        JsonNode model = service.createDraftModel(customerNode);
        service.createDraftModel(newModel(ORDER_MODEL_NAME));

        verifyModelContents(model, "Initial description");
        verifyPersistedModels("Initial description");

        customerNode.put("description", "Modified description");
        service.updateDraftModelInfo(CUSTOMER_MODEL_NAME, customerNode);
        verifyPersistedModels("Modified description");

        modelService.publishDraftModels();
        //this document should not be on draft anymore
        try{
            JsonNode modelDraft = getModel(CUSTOMER_MODEL_NAME, getHubClient().getFinalClient(), true);
        } catch (Exception ex) {
        logger.info("Caught expected exception: " + ex.getMessage());
        assertTrue(ex.getMessage().contains("document does not exist"));
        }
        //this document should exists since we publish before
        JsonNode modelPublished = getModel(CUSTOMER_MODEL_NAME, getHubClient().getFinalClient(), false);
        assertEquals(modelPublished.get("info").get("draft").asText(), "false");
    }

    /**
     * validateModelDefinitions.sjs covers all validation rules.
     */
    @Test
    void invalidConceptName() {
        try {
            service.createDraftModel(newModel("' Spaces are not allowed"));
            fail("Expected error because spaces are not allowed in an concept name");
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
            assertTrue(ex.getMessage().contains("must start with a letter"));
        }
    }

    @Test
    void conceptNameIsAlreadyUsed() {
        service.createDraftModel(newModel("TestName"));
        try {
            service.createDraftModel(newModel("TestName"));
            fail("Expected a failure because a model already exists with the same name");
        } catch (FailedRequestException ex) {
            assertEquals(400, ex.getServerStatusCode());
            assertEquals("Concept class is already using the name TestName. Concept class cannot use the same name as an existing concept class.", ex.getServerStatus());
        }
    }

    @Test
    void conceptNameMissing() {
        try {
            service.createDraftModel(objectMapper.createObjectNode());
            fail("Expected a failure because no name was provided");
        } catch (FailedRequestException ex) {
            assertEquals(400, ex.getServerStatusCode());
            assertEquals("The model must have an info object with a name property", ex.getServerStatus());
        }
    }

    @Test
    void deleteConcept() {
        service.createDraftModel(newModel("TestNameForDelete"));
        service.deleteDraftModel("TestNameForDelete");
        JsonNode model = getModel("TestNameForDelete", getHubClient().getFinalClient(), true);
        assertTrue(model.get("info").get("draft").asBoolean());

        modelService.publishDraftModels();
        //this document should not exists anymore
        try{
            JsonNode modelDraft = getModel("TestNameForDelete", getHubClient().getFinalClient(), true);
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
            assertTrue(ex.getMessage().contains("document does not exist"));
        }
        try{
            getModel("TestNameForDelete", getHubClient().getFinalClient(), false);
        } catch (Exception ex) {
            logger.info("Caught expected exception: " + ex.getMessage());
            assertTrue(ex.getMessage().contains("document does not exist"));
        }
        //this document should exists since we publish before
    }

    @Test
     void verifyConceptsClassPrimaryEntityTypes() {
        service.createDraftModel(newModel("newConceptName"));
        JsonNode json = ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes(Boolean.TRUE);
        assertEquals(1, json.size(), "Expecting an array with the single newConceptName concept type in it: " + json.toPrettyString());
        JsonNode conceptType = json.get(0);
        assertEquals("newConceptName", conceptType.get("conceptName").asText(), "Expected concept: " + conceptType.toPrettyString());

    }

    @Test
    protected void publishDraftModels() {
        modelService = ModelsService.on(getHubClient().getFinalClient());
        if (isVersionCompatibleWith520Roles()) {
            runAsDataHubDeveloper();
        } else {
            runAsAdmin();
        }
        assertDoesNotThrow(() -> modelService.publishDraftModels(), "Should publish draft with no issues.");
    }

    protected JsonNode getModel(String conceptName, DatabaseClient client, boolean isDraft) {
        return client.newJSONDocumentManager().read("/concepts/" + conceptName + (isDraft ? ".draft":"")  + ".concept.json", new JacksonHandle()).get();
    }

    private ObjectNode newModel(String name) {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", name);
        return input;
    }

    private void verifyModelContents(JsonNode model, String expectedDescription) {
        assertEquals(CUSTOMER_MODEL_NAME, model.get("info").get("name").asText());
        assertEquals(expectedDescription, model.get("info").get("description").asText());
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
        assertEquals("http://marklogic.com/data-hub/concept/draft", metadata.getCollections().iterator().next());
        DocumentMetadataHandle.DocumentPermissions perms = metadata.getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-entity-model-reader").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-entity-model-writer").iterator().next());
    }


}
