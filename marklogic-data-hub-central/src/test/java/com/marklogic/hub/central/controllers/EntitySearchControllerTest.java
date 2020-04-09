package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.AbstractMvcTest;
import org.junit.jupiter.api.Test;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

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

    @Test
    void getSavedQueries() throws Exception {
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
                .andDo(result -> savedQueryResponse = readJsonObject(result.getResponse().getContentAsString()));

        getJson(SAVED_QUERIES_PATH, new LinkedMultiValueMap<>())
                .andExpect(status().isOk())
                .andDo(result -> {
                    ArrayNode response = readJsonArray(result.getResponse().getContentAsString());
                    assertTrue(response.size() > 0, "There should be at least one saved query document");
                });
    }

    @Test
    void getSavedQuery() throws Exception {
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
                .andDo(result -> savedQueryResponse = readJsonObject(result.getResponse().getContentAsString()));

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("id", savedQueryResponse.get("savedQuery").get("id").asText());

        getJson(SAVED_QUERIES_PATH+"/query", params)
                .andExpect(status().isOk())
                .andDo(result -> {
                    ObjectNode response = readJsonObject(result.getResponse().getContentAsString());
                    assertEquals(savedQueryResponse.get("savedQuery").get("id").asText(), response.get("savedQuery").get("id").asText());
                });
    }
}
