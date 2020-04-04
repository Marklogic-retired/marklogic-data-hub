package com.marklogic.hub.dataservices.entitysearch;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.dataservices.EntitySearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class EntitySearchServiceTest extends HubTestBase {

    private static JsonNode queryDoc;
    private EntitySearchService entitySearchService;

    @BeforeEach
    void before() throws IOException {
        entitySearchService = EntitySearchService.on(adminHubConfig.newFinalClient(null));
        String jsonString = "{\n" +
                "  \"savedQuery\": {\n" +
                "    \"id\": \"\",\n" +
                "    \"name\": \"some-query\",\n" +
                "    \"description\": \"some-query-description\",\n" +
                "    \"query\": {\n" +
                "      \"searchText\": \"some-string\",\n" +
                "      \"entityTypeIds\": [\n" +
                "        \"Entity1\"\n" +
                "      ],\n" +
                "      \"selectedFacets\": {\n" +
                "        \"Collection\": {\n" +
                "          \"dataType\": \"string\",\n" +
                "          \"stringValues\": [\n" +
                "            \"Entity1\",\n" +
                "            \"Collection1\"\n" +
                "          ]\n" +
                "        },\n" +
                "        \"facet1\": {\n" +
                "          \"dataType\": \"decimal\",\n" +
                "          \"rangeValues\": {\n" +
                "            \"lowerBound\": \"2.5\",\n" +
                "            \"upperBound\": \"15\"\n" +
                "          }\n" +
                "        },\n" +
                "        \"facet2\": {\n" +
                "          \"dataType\": \"dateTime\",\n" +
                "          \"rangeValues\": {\n" +
                "            \"lowerBound\": \"2020-01-01T13:06:17\",\n" +
                "            \"upperBound\": \"2020-01-22T13:06:17\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    },\n" +
                "    \"propertiesToDisplay\": [\"facet1\", \"EntityTypeProperty1\"]\n" +
                "  }\n" +
                "}";
        ObjectMapper mapper = new ObjectMapper();
        queryDoc = mapper.readTree(jsonString);
    }

    @Test
    void testSaveAndModifyQuery() {
        JsonNode firstResponse = entitySearchService.saveSavedQuery(queryDoc);
        String id = firstResponse.get("savedQuery").get("id").asText();

        assertNotNull(firstResponse);
        assertNotNull(firstResponse.get("savedQuery"));
        assertTrue(!id.isEmpty());
        assertNotNull(firstResponse.get("savedQuery").get("systemMetadata"));
        assertEquals("some-query", firstResponse.get("savedQuery").get("name").asText());
        assertEquals(4, firstResponse.get("savedQuery").get("systemMetadata").size());
        assertTrue(!firstResponse.get("savedQuery").get("owner").asText().isEmpty());
        assertTrue(!firstResponse.get("savedQuery").get("systemMetadata").get("createdBy").asText().isEmpty());
        assertPermissionsAndCollections(id);

        ObjectNode savedQueryNode = (ObjectNode) firstResponse.get("savedQuery");
        savedQueryNode.put("name", "modified-name");
        JsonNode modifiedResponse = entitySearchService.saveSavedQuery(firstResponse);

        assertNotNull(modifiedResponse);
        assertEquals(id, modifiedResponse.get("savedQuery").get("id").asText());
        assertTrue(!firstResponse.get("savedQuery").get("owner").asText().isEmpty());
        assertEquals("modified-name", modifiedResponse.get("savedQuery").get("name").asText());
        assertPermissionsAndCollections(id);
    }

    @Test
    void testModifyQueryWithNonExistentId() {
        JsonNode firstResponse = entitySearchService.saveSavedQuery(queryDoc);
        ObjectNode savedQueryNode = (ObjectNode) firstResponse.get("savedQuery");
        savedQueryNode.put("id", "some-non-existent-id");
        savedQueryNode.put("name", "modified-name");
        JsonNode modifiedResponse = entitySearchService.saveSavedQuery(firstResponse);
        assertNotNull(modifiedResponse.get("savedQuery").get("id"));
    }

    @Test
    void testSaveQueryWithNoName() {
        ObjectNode savedQueryNode = (ObjectNode) queryDoc.get("savedQuery");
        savedQueryNode.remove("name");
        assertThrows(FailedRequestException.class, () -> entitySearchService.saveSavedQuery(queryDoc));
    }

    @Test
    void testSaveQueryWithEmptyName() {
        ObjectNode savedQueryNode = (ObjectNode) queryDoc.get("savedQuery");
        savedQueryNode.put("name", "");
        assertThrows(FailedRequestException.class, () -> entitySearchService.saveSavedQuery(queryDoc));
    }

    @Test
    void testSaveQueryWithNoQuery() {
        ObjectNode savedQueryNode = (ObjectNode) queryDoc.get("savedQuery");
        savedQueryNode.remove("query");
        assertThrows(FailedRequestException.class, () -> entitySearchService.saveSavedQuery(queryDoc));
    }

    @Test
    void testSaveQueryWithEmptyQuery() {
        ObjectNode savedQueryNode = (ObjectNode) queryDoc.get("savedQuery");
        savedQueryNode.put("query", "");
        assertThrows(FailedRequestException.class, () -> entitySearchService.saveSavedQuery(queryDoc));
    }

    @Test
    void testSaveQueryWithNoPropertiesToDisplay() {
        ObjectNode savedQueryNode = (ObjectNode) queryDoc.get("savedQuery");
        savedQueryNode.remove("propertiesToDisplay");
        assertThrows(FailedRequestException.class, () -> entitySearchService.saveSavedQuery(queryDoc));
    }

    @Test
    void testSaveQueryWithEmptyPropertiesToDisplay() {
        ObjectNode savedQueryNode = (ObjectNode) queryDoc.get("savedQuery");
        savedQueryNode.put("propertiesToDisplay", "");
        assertThrows(FailedRequestException.class, () -> entitySearchService.saveSavedQuery(queryDoc));
    }

    @Test
    void testGetQueryDocuments() {
        entitySearchService.saveSavedQuery(queryDoc);
        JsonNode savedQueries = entitySearchService.getSavedQueries();
        assertTrue(savedQueries.size() > 0, "There should be at least one saved query document");
    }

    @Test
    void testGetQueryDocument() {
        JsonNode response = entitySearchService.saveSavedQuery(queryDoc);
        String id = response.get("savedQuery").get("id").asText();
        String expectedQuery = "{\"searchText\":\"some-string\",\"entityTypeIds\":[\"Entity1\"],\"selectedFacets\":{\"Collection\":{\"dataType\":\"string\",\"stringValues\":[\"Entity1\",\"Collection1\"]},\"facet1\":{\"dataType\":\"decimal\",\"rangeValues\":{\"lowerBound\":\"2.5\",\"upperBound\":\"15\"}},\"facet2\":{\"dataType\":\"dateTime\",\"rangeValues\":{\"lowerBound\":\"2020-01-01T13:06:17\",\"upperBound\":\"2020-01-22T13:06:17\"}}}}";
        JsonNode savedQuery = entitySearchService.getSavedQuery(id);
        assertEquals(id, savedQuery.get("savedQuery").get("id").asText());
        assertTrue(!savedQuery.get("savedQuery").get("owner").asText().isEmpty());
        assertEquals("some-query", savedQuery.get("savedQuery").get("name").asText());
        assertEquals(expectedQuery, savedQuery.get("savedQuery").get("query").toString());
        assertEquals(4, savedQuery.get("savedQuery").get("systemMetadata").size());
        assertPermissionsAndCollections(id);
    }

    @Test
    void testGetQueryDocumentWithNonExistentId() {
        String id = "some-random-id";
        JsonNode savedQuery = entitySearchService.getSavedQuery(id);
        assertEquals(0, savedQuery.size());
    }

    private void assertPermissionsAndCollections(String id) {
        String docUri = "/saved-queries/" + id + ".json";
        DocumentMetadataHandle metadataHandle = new DocumentMetadataHandle();
        finalDocMgr.readMetadata(docUri, metadataHandle);
        DocumentMetadataHandle.DocumentPermissions permissions = metadataHandle.getPermissions();
        DocumentMetadataHandle.DocumentCollections collections = metadataHandle.getCollections();
        Set<DocumentMetadataHandle.Capability> readQueryCap = new HashSet<>(Arrays.asList(DocumentMetadataHandle.Capability.READ));
        Set<DocumentMetadataHandle.Capability> writeQueryCap = new HashSet<>(Arrays.asList(DocumentMetadataHandle.Capability.UPDATE));
        Set<String> expectedCollections = new HashSet<>(Arrays.asList("http://marklogic.com/data-hub/saved-query"));

        assertNotNull(permissions.get("data-hub-saved-query-writer"));
        assertNotNull(permissions.get("data-hub-saved-query-reader"));
        assertTrue(readQueryCap.equals(permissions.get("data-hub-saved-query-reader")));
        assertTrue(writeQueryCap.equals(permissions.get("data-hub-saved-query-writer")));
        assertTrue(expectedCollections.equals(collections));
    }
}
