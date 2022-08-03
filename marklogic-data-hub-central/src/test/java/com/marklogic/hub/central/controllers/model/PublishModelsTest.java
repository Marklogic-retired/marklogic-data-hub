package com.marklogic.hub.central.controllers.model;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.DatabaseKind;
import org.junit.jupiter.api.Assertions;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.controllers.ConceptController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.function.Consumer;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class PublishModelsTest extends ModelTest {
    String entityCollection = "http://marklogic.com/entity-services/models";
    String draftEntityCollection = entityCollection + "/draft";
    String conceptCollection = "http://marklogic.com/data-hub/concept";
    String draftConceptCollection = conceptCollection + "/draft";

    @Autowired
    ConceptController conceptController;

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testPublishingModels() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        updateModelInfo();
        assertEquals(1, getFinalDocCount(draftEntityCollection), "There should be one entity in draft");
        assertEquals(0, getFinalDocCount(entityCollection), "There should be no entities published yet");
        publishDraftModels();
        assertEquals(1, getFinalDocCount(entityCollection), "There should be one entity published");
        assertEquals(0, getFinalDocCount(draftEntityCollection), "There should be no entities in draft after publishing");
    }

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testPublishingDeletedModel() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        deleteModel();
        assertEquals(1, getFinalDocCount(draftEntityCollection), "There should be one entity in draft");
        assertEquals(0, getFinalDocCount(entityCollection), "There should be no entities published yet");
        publishDraftModels();
        assertEquals(0, getFinalDocCount(entityCollection), "There should be no entities published");
        assertEquals(0, getFinalDocCount(draftEntityCollection), "There should be no entities in draft after publishing");
    }

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testClearModels() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        updateModelInfo();
        assertEquals(1, getStagingDocCount(draftEntityCollection), "There should be one entity in draft for staging database");
        assertEquals(1, getFinalDocCount(draftEntityCollection), "There should be one entity in draft for final database");
        clearDraftModels();
        assertEquals(0, getStagingDocCount(draftEntityCollection), "There should be no entities in draft for staging database");
        assertEquals(0, getFinalDocCount(draftEntityCollection), "There should be no entities in draft for final database");
    }

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testUpdateModelVersion() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        publishDraftModels();
        verifySchemaHasCorrectTDEVersion("3.0.1");
        updateModelVersion();
        publishDraftModels();
        assertEquals(1, getFinalDocCount(entityCollection), "There should be no entities published");
        assertEquals(0, getFinalDocCount(draftEntityCollection), "There should be no entities in draft after publishing");
        verifySchemaHasCorrectTDEVersion("3.1.0");
    }

    private void verifySchemaHasCorrectTDEVersion(String version) {
        assertSchemasAndTDE(Assertions::assertNotNull, version);
    }

    private void assertSchemasAndTDE(Consumer<Object> assertion, String version) {
        DatabaseClient finalSchemaClient = getHubConfig().newFinalClient(getHubConfig().getDbName(DatabaseKind.FINAL_SCHEMAS));
        Stream.of(finalSchemaClient).forEach(databaseClient -> {
            GenericDocumentManager documentManager = databaseClient.newDocumentManager();
            assertion.accept(documentManager.exists("/entities/Customer.entity.schema.json"));
            assertion.accept(documentManager.exists("/entities/Customer.entity.xsd"));
            assertion.accept(documentManager.exists("/tde/Customer-" + version + ".tdex"));
        });
    }

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    private void testClearConceptModels() {

        runAsTestUserWithRoles("hub-central-entity-model-writer");
        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", "ShoeType");
        JsonNode model = conceptController.createDraftModel(input).getBody();
        assertEquals(1, getStagingDocCount(draftConceptCollection), "There should be one concept in draft for staging database");
        assertEquals(1, getFinalDocCount(draftConceptCollection), "There should be one concept in draft for final database");
        clearDraftModels();
        assertEquals(0, getStagingDocCount(draftConceptCollection), "There should be no concepts in draft for staging database");
        assertEquals(0, getFinalDocCount(draftConceptCollection), "There should be no concepts in draft for final database");
    }

}
