package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.AbstractMvcTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class CreateModelMvcTest extends AbstractMvcTest {

    /**
     * Verifies that CustomExceptionHandler is correctly processing a FailedRequestException from a DS endpoint.
     *
     * @throws Exception
     */
    @Test
    void missingName() throws Exception {
        postJson("/api/models", "{}")
            .andExpect(status().isBadRequest())
            .andDo(result -> {
                ObjectNode error = readJsonObject(result.getResponse().getContentAsString());
                assertEquals(400, error.get("code").asInt());
                assertEquals("The model must have an info object with a title property", error.get("message").asText());
            });
    }
}
