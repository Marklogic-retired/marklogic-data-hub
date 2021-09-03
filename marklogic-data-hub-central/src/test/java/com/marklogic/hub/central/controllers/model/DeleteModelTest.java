package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.controllers.ModelController;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.function.Consumer;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class DeleteModelTest extends AbstractHubCentralTest {

    @Autowired
    ModelController controller;

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testModelDeletionEndpoints() {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/delete-model-project");
        new EntityManagerImpl(getHubConfig()).deployQueryOptions();

        runAsTestUserWithRoles("hub-central-entity-model-writer");
        verifyEntity2BasedArtifactsExist();
        getModelReferences();
        deleteEntity2Model();
        publishDraftModel();
        verifyEntity2BasedArtifactsDontExist();
        verifyReferencesToEntity2DontExistInEntity1();

        deleteEntity1Model();
        publishDraftModel();
    }

    private void getModelReferences() {
        JsonNode jsonNode = controller.getModelReferences("Entity2", null).getBody();
        assertNotNull(jsonNode);
        assertEquals(2, jsonNode.get("stepNames").size());
        assertEquals(1, jsonNode.get("entityNames").size());
        Stream.of("testMap2", "matching-step")
                .forEach(s -> assertTrue(jsonNode.get("stepNames").toString().contains(s)));
        assertTrue(jsonNode.get("entityNames").toString().contains("Entity1"));
    }

    private void deleteEntity2Model() {
        assertThrows(FailedRequestException.class, () -> controller.deleteDraftModel("Entity2"), "Should throw an exception since the entity is referenced in steps.");

        runAsDataHubDeveloper();
        removeReferencesToEntity();
        runAsTestUserWithRoles("hub-central-entity-model-writer");

        assertTrue(controller.deleteDraftModel("Entity2").getStatusCode().is2xxSuccessful(), "Should be ok since we deleted the steps that refer to the entity.");

        // Needed because a post-commit trigger is executed after a model is deleted
        runAsDataHubDeveloper();
        waitForTasksToFinish();
        runAsTestUserWithRoles("hub-central-entity-model-writer");
    }

    private void publishDraftModel() {
        runAsDataHubDeveloper();
        assertDoesNotThrow(() -> controller.publishDraftModels(), "Should publish the deleted draft with no issues.");
    }

    private void removeReferencesToEntity() {
        removeDocuments("/steps/matching/matching-step.step.json", "/steps/mapping/testMap2.step.json");
    }

    private void verifyReferencesToEntity2DontExistInEntity1() {
        assertFalse(getFinalDoc("/entities/Entity1.entity.json").toString().contains("Entity2"), "Expected the properties that refer to Entity2 to be deleted from Entity1.");
        assertFalse(getStagingDoc("/entities/Entity1.entity.json").toString().contains("Entity2"), "Expected the properties that refer to Entity2 to be deleted from Entity1.");
    }

    private void verifyEntity2BasedArtifactsDontExist() {
        assertSchemasAndTDE(Assertions::assertNull);
    }

    private void verifyEntity2BasedArtifactsExist() {
        assertSchemasAndTDE(Assertions::assertNotNull);
    }

    private void assertSchemasAndTDE(Consumer<Object> assertion) {
        DatabaseClient stagingSchemaClient = getHubConfig().newStagingClient(getHubConfig().getDbName(DatabaseKind.STAGING_SCHEMAS));
        DatabaseClient finalSchemaClient = getHubConfig().newFinalClient(getHubConfig().getDbName(DatabaseKind.FINAL_SCHEMAS));
        Stream.of(stagingSchemaClient, finalSchemaClient).forEach(databaseClient -> {
            GenericDocumentManager documentManager = databaseClient.newDocumentManager();
            assertion.accept(documentManager.exists("/entities/Entity2.entity.schema.json"));
            assertion.accept(documentManager.exists("/entities/Entity2.entity.xsd"));
            assertion.accept(documentManager.exists("/tde/Entity2-1.0.0.tdex"));
        });
    }

    private void deleteEntity1Model() {
        runAsDataHubDeveloper();
        removeDocuments("/steps/mapping/testMap1.step.json", "/steps/merging/merging-step.step.json");
        runAsTestUserWithRoles("hub-central-entity-model-writer");

        assertDoesNotThrow(() -> controller.deleteDraftModel("Entity1"), "Should be ok since we deleted the references" +
                " to Entity1 and we generate and deploy search options even if there are no entities present.");
    }

    private void removeDocuments(String... uris) {
        DatabaseClient stagingDatabaseClient = getHubClient().getStagingClient();
        DatabaseClient finalDatabaseClient = getHubClient().getFinalClient();
        Stream.of(stagingDatabaseClient, finalDatabaseClient)
                .forEach(databaseClient -> databaseClient
                        .newDocumentManager()
                        .delete(uris));
    }
}
