package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.AbstractMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.http.server.reactive.MockServerHttpResponse;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class ModelMvcTest extends AbstractMvcTest {

    /**
     * DeleteModelTest and CreateAndUpdateModelTest verify that a user can write and delete entity models, just need to verify the inverse here.
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
        verifyRequestIsForbidden(buildJsonPut("/api/models/entityTypes", "{}"));
        delete("/api/models/doesntMatter").andExpect(status().isForbidden());
    }

    /**
     * This test the hubCentralConfig endpoint.
     *
     * @throws Exception
     */
    @Test
    void testHubCentralConfig() throws Exception {
        loginAsTestUserWithRoles("hub-central-entity-model-writer");
        putJson("/api/models/hubCentralConfig", "{ \"modeling\": { \"scale\": 1.2, \"entities\": {\"Customer\":{\"x\":1}} }}").andExpect(status().isOk());
        putJson("/api/models/hubCentralConfig", "{ \"modeling\": { \"entities\": {\"Order\":{}, \"Customer\":{\"y\":2}} }}").andExpect(status().isOk());

        loginAsTestUserWithRoles("hub-central-entity-model-reader");

        getJson("/api/models/hubCentralConfig").andExpect(status().isOk()).andExpect((result -> {
            JsonNode resp = parseJsonResponse(result);
            assertTrue(resp.path("modeling").path("entities").hasNonNull("Customer"));
            assertTrue(resp.path("modeling").path("entities").path("Customer").hasNonNull("x"));
            assertTrue(resp.path("modeling").path("entities").path("Customer").hasNonNull("y"));
            assertTrue(resp.path("modeling").path("entities").hasNonNull("Order"));
            assertTrue(resp.path("modeling").hasNonNull("scale"));
        }));
        loginAsTestUserWithRoles("hub-central-entity-model-writer");
        delete("/api/models/hubCentralConfig").andExpect(status().isOk());
        getJson("/api/models/hubCentralConfig").andExpect(status().isOk()).andExpect((result -> {
            JsonNode resp = parseJsonResponse(result);
            assertTrue(resp.isEmpty());
        }));
    }
}
