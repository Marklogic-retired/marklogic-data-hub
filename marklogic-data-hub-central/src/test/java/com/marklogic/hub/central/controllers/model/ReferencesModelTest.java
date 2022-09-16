package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.controllers.ModelController;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.function.Consumer;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class ReferencesModelTest extends ModelTest {

    @Autowired
    ModelController controller;

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testModelDeletionEndpoints() {
        runAsDataHubDeveloper();
        installProjectInFolder("test-projects/delete-model-project");
        new EntityManagerImpl(getHubConfig()).deployQueryOptions();

        runAsTestUserWithRoles("hub-central-entity-model-writer");
        verifyModelReferencesByEntityAndProperty();
        publishDraftModels();
        verifyModelReferencesByEntityAndProperty();
        removeStep();
        verifyWithoutReferencesByEntityAndProperty();

    }

    private void verifyModelReferencesByEntityAndProperty() {
        JsonNode jsonNode = controller.getModelReferences("Entity2", "property1").getBody();
        assertNotNull(jsonNode);
        assertEquals(1, jsonNode.get("stepNames").size());
        assertEquals(null, jsonNode.get("entityNames"));
        Stream.of("testMap2")
                .forEach(s -> assertTrue(jsonNode.get("stepNames").toString().contains(s)));
    }

    private void verifyWithoutReferencesByEntityAndProperty() {
        JsonNode jsonNode = controller.getModelReferences("Entity2", "property1").getBody();
        assertNotNull(jsonNode);
        assertEquals(0, jsonNode.get("stepNames").size());
        assertEquals(null, jsonNode.get("entityNames"));
    }


    private void removeStep() {
        removeDocuments("/steps/mapping/testMap2.step.json");
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
