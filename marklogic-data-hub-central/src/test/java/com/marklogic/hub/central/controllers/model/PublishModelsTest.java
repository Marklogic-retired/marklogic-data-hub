package com.marklogic.hub.central.controllers.model;

import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PublishModelsTest extends ModelTest {
    String entityCollection = "http://marklogic.com/entity-services/models";
    String draftEntityCollection = entityCollection + "/draft";
    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testPublishingModels() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        updateModelInfo();
        assertEquals(1, getFinalDocCount(draftEntityCollection), "There should be one entity in draft");
        assertEquals(0, getFinalDocCount(entityCollection), "There should be no entities published yet");
        controller.publishDraftModels();
        assertEquals(1, getFinalDocCount(entityCollection), "There should be one entity published");
        assertEquals(0, getFinalDocCount(draftEntityCollection), "There should be no entities in draft after publishing");
    }

}
