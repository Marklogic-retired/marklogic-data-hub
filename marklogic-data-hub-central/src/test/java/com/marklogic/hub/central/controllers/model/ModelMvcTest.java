package com.marklogic.hub.central.controllers.model;

import com.marklogic.hub.central.AbstractMvcTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ModelMvcTest extends AbstractMvcTest {

    /**
     * ModelControllerTest verifies that a user can write entity models, just need to verify the inverse here.
     *
     * @throws Exception
     */
    @Test
    void canReadButNotWriteModels() throws Exception {
        loginAsTestUserWithRoles("hub-central-entity-model-reader");

        getJson("/api/models/primaryEntityTypes").andExpect(status().isOk());
        getJson("/api/models").andExpect(status().isOk());
        getJson("/api/models/job-info").andExpect(status().isOk());

        verifyRequestIsForbidden(buildJsonPost("/api/models", "{}"));
        verifyRequestIsForbidden(buildJsonPut("/api/models/doesntMatter/info", "{}"));
        verifyRequestIsForbidden(buildJsonPut("/api/models/doesntMatter/entityTypes", "{}"));
    }

    @Test
    void cannotReadModels() throws Exception {
        loginAsTestUserWithRoles("hub-central-user");

        verifyRequestIsForbidden(get("/api/models/primaryEntityTypes"));
        verifyRequestIsForbidden(get("/api/models"));
        verifyRequestIsForbidden(get("/api/models/job-info"));
    }
}
