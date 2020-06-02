/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.central.entities.search;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.hub.central.entities.search.models.SearchQuery;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EntitySearchManagerTest extends AbstractHubCentralTest {

    static String ACTUAL_QUERY_OPTIONS = EntitySearchManager.QUERY_OPTIONS;
    EntitySearchManager entitySearchManager;

    @BeforeEach
    public void setUpDocs() {
        entitySearchManager = new EntitySearchManager(getHubClient());
    }

    @AfterEach
    public void resetData() {
        EntitySearchManager.QUERY_OPTIONS = ACTUAL_QUERY_OPTIONS;
    }

    /**
     * Smoke test for entityProperties being added. We expect the marklogic-unit-test tests to verify this
     * exhaustively, so just checking a few things here.
     */
    @Test
    void searchWithTransform() {
        ReferenceModelProject project = installReferenceModelProject(true);
        project.createCustomerInstance(new Customer(1, "Jane"));
        project.createCustomerInstance(new Customer(2, "Sally"));

        SearchQuery query = new SearchQuery();
        DocSearchQueryInfo info = new DocSearchQueryInfo();
        info.setEntityTypeIds(Arrays.asList("Customer"));
        query.setQuery(info);

        StringHandle results = entitySearchManager.search(query);
        ObjectNode node = readJsonObject(results.get());
        assertTrue(node.has("selectedPropertyDefinitions"), "Including this makes life easy on the UI so it knows what " +
            "columns to display");
        assertTrue(node.has("entityPropertyDefinitions"), "Including this means the UI doesn't need to make a separate call " +
            "to /api/models to get the property names and also traverse the entity definition itself");
        assertTrue(node.get("results").get(0).has("entityProperties"), "Each result is expected to have " +
            "entityProperties so that the UI knows what structured values to show for each entity instance");
        assertTrue(node.get("results").get(1).has("entityProperties"));
    }

    @Test
    void noEntityTypesSelected() {
        // Need at least one entity model to exist for this scenario
        installReferenceModelProject(true);

        SearchQuery query = new SearchQuery();
        DocSearchQueryInfo info = new DocSearchQueryInfo();
        info.setEntityTypeIds(Arrays.asList(" "));
        query.setQuery(info);

        String results = entitySearchManager.search(query).get();
        ObjectNode node = readJsonObject(results);
        assertEquals(0, node.get("total").asInt(), "When entityTypeIds has values, but they're all empty strings, the " +
                "backend should return no results, and not throw an error");
    }

    @Test
    public void testSearchResultsOnNoData() {
        EntitySearchManager.QUERY_OPTIONS = "non-existent-options";
        String collectionDeleteQuery = "declareUpdate(); xdmp.collectionDelete(\"http://marklogic.com/entity-services/models\")";
        getHubClient().getFinalClient().newServerEval().javascript(collectionDeleteQuery).evalAs(String.class);
        assertTrue(entitySearchManager.search(new SearchQuery()).get().isEmpty());

        SearchQuery query = new SearchQuery();
        query.getQuery().setEntityTypeIds(Arrays.asList("Some-entityType"));
        assertTrue(entitySearchManager.search(query).get().isEmpty());
    }

    @Test
    void testBuildSearchOptionsWithSortOptions() {
        SearchQuery searchQuery = new SearchQuery();

        String query = "<query><collection-query><uri>collection1</uri></collection-query></query>";
        List<SearchQuery.SortOrder> sortOrderList = new ArrayList<>();
        SearchQuery.SortOrder sortOrder = new SearchQuery.SortOrder();

        sortOrder.setName("entityTypeProperty1");
        sortOrder.setDataType("string");
        sortOrder.setAscending(true);
        sortOrderList.add(sortOrder);

        sortOrder = new SearchQuery.SortOrder();
        sortOrder.setName("datahubCreatedOn");
        sortOrder.setDataType("string");
        sortOrder.setAscending(false);

        sortOrderList.add(sortOrder);
        searchQuery.setSortOrder(sortOrderList);
        String expectedResult = "<search xmlns=\"http://marklogic.com/appservices/search\">\n<options><sort-order type=\"xs:string\" direction=\"ascending\"><element ns=\"\" name=\"entityTypeProperty1\"/>\n" +
                "</sort-order><sort-order direction=\"descending\"><field name=\"datahubCreatedOn\"/>\n</sort-order></options><query><collection-query><uri>collection1</uri></collection-query></query></search>";
        assertTrue(entitySearchManager.buildSearchOptions(query, searchQuery).equals(expectedResult));
    }

    @Test
    void testXmlEscapeUtils() {
        String query = "<query><collection-query><uri>collection1</uri></collection-query></query>";
        SearchQuery searchQuery = new SearchQuery();
        searchQuery.getQuery().setSearchText("&<>'\"");

        String expectedResult = "<search xmlns=\"http://marklogic.com/appservices/search\">\n<qtext>&amp;&lt;&gt;&apos;&quot;</qtext><query><collection-query><uri>collection1</uri></collection-query></query></search>";
        assertTrue(entitySearchManager.buildSearchOptions(query, searchQuery).equals(expectedResult));
    }

    @Test
    void testGetColumnNamesForRowExport() throws JsonProcessingException {
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
        JsonNode queryDocument = new ObjectMapper().readTree(json);
        List<String> expectedCols = Arrays.asList("facet1", "EntityTypeProperty1");

        List<String> actualCols = entitySearchManager.getColumnNamesForRowExport(queryDocument);

        assertEquals(expectedCols, actualCols);
    }

    @Test
    void testGetQueryName() throws JsonProcessingException {
        String expectedQueryName = "query123";
        String json = "{\n" +
                "  \"savedQuery\": {\n" +
                "    \"name\": \"" + expectedQueryName + "\",\n" +
                "    \"description\": \"some-query-description\",\n" +
                "    \"query\": {\n" +
                "      \"searchText\": \"some-string\",\n" +
                "      \"entityTypeIds\": [\n" +
                "        \"Entity1\"\n" +
                "      ]\n" +
                "    },\n" +
                "    \"propertiesToDisplay\": [\"facet1\", \"EntityTypeProperty1\", \"facet1.facet\", \"EntityTypeProperty1.property\", \"EntityType-Property\"]\n" +
                "  }\n" +
                "}";
        JsonNode queryDocument = new ObjectMapper().readTree(json);

        String actualQueryName = entitySearchManager.getQueryName(queryDocument);

        assertEquals(expectedQueryName, actualQueryName);
    }

    @Test
    void testGetEntityTypeForRowExport() throws JsonProcessingException {
        String json = "{\n" +
                "  \"savedQuery\": {\n" +
                "    \"name\": \"some-query\",\n" +
                "    \"description\": \"some-query-description\",\n" +
                "    \"query\": {\n" +
                "      \"searchText\": \"some-string\",\n" +
                "      \"entityTypeIds\": [\n" +
                "        \"Entity-1\"\n" +
                "      ]\n" +
                "    },\n" +
                "    \"propertiesToDisplay\": [\"facet1\", \"EntityTypeProperty1\", \"facet1.facet\", \"EntityTypeProperty1.property\", \"EntityType-Property\"]\n" +
                "  }\n" +
                "}";
        String expectedEntityTypeId = "Entity-1";
        JsonNode queryDocument = new ObjectMapper().readTree(json);

        String actualEntityTypeId = entitySearchManager.getEntityTypeIdForRowExport(queryDocument);

        assertEquals(expectedEntityTypeId, actualEntityTypeId);
    }

    @Test
    void testGetQueryOptions() {
        assertThrows(DataHubException.class, () -> entitySearchManager.getQueryOptions("non-existent-options"));
    }
}
