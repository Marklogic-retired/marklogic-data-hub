package com.marklogic.hub.oneui.controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.oneui.AbstractMvcTest;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class EntitySearchControllerTest extends AbstractMvcTest {

    private final static String SAVED_QUERIES_PATH = "/api/entitySearch/savedQueries";

    private ObjectNode savedQueryResponse;

    @Test
    void createThenUpdateSavedQuery() throws Exception {
        String json = "{\n" +
            "  \"savedQuery\": {\n" +
            "    \"name\": \"some-query\",\n" +
            "    \"description\": \"some-query-description\",\n" +
            "    \"query\": {\n" +
            "      \"searchText\": \"some-string\",\n" +
            "      \"entityTypeIds\": [\n" +
            "        \"Entity1\"\n" +
            "      ]\n" +
            "    },\n" +
            "    \"propertiesToDisplay\": [\"facet1\", \"EntityTypeProperty1\"]\n" +
            "  }\n" +
            "}";

        postJson(SAVED_QUERIES_PATH, json)
            .andExpect(status().isCreated())
            .andDo(result -> {
                savedQueryResponse = readJsonObject(result.getResponse().getContentAsString());
                assertTrue(savedQueryResponse.get("savedQuery").has("id"), "The ID property should have been set so that the UI " +
                    "can e.g. display a link to the saved query");
            });

        ObjectNode query = (ObjectNode) savedQueryResponse.get("savedQuery");
        query.put("description", "Updated description");

        putJson(SAVED_QUERIES_PATH, savedQueryResponse.toString())
            .andExpect(status().isOk())
            .andDo(result -> {
                ObjectNode response = readJsonObject(result.getResponse().getContentAsString());
                assertEquals("Updated description", response.get("savedQuery").get("description").asText());
            });
    }
}
