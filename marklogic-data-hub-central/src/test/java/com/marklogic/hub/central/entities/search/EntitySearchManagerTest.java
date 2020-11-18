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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.hub.central.entities.search.models.SearchQuery;
import com.marklogic.hub.dhs.DhsDeployer;
import com.marklogic.hub.impl.EntityManagerImpl;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EntitySearchManagerTest extends AbstractHubCentralTest {

    static String ACTUAL_QUERY_OPTIONS = EntitySearchManager.QUERY_OPTIONS;

    @AfterEach
    public void resetData() {
        EntitySearchManager.QUERY_OPTIONS = ACTUAL_QUERY_OPTIONS;
        if (isVersionCompatibleWith520Roles()) {
            runAsDataHubDeveloper();
        } else {
            logger.warn("ML version is not compatible with 5.2.0 roles, so will run as flow-developer instead of data-hub-developer");
            runAsUser("flow-developer", "password");
        }
        applyDatabasePropertiesForTests(getHubConfig());
    }

    /**
     * Smoke test for entityProperties being added. We expect the marklogic-unit-test tests to verify this
     * exhaustively, so just checking a few things here.
     */
    @Test
    void searchWithTransformInFinalDatabase() {
        validateSearchWithTransform("final");
    }

    @Test
    void searchWithTransformInStagingDatabase() {
        validateSearchWithTransform("staging");
    }

    @Test
    void searchAllDataInStagingDatabase() {
        validateAllDataSearch("staging");
    }

    @Test
    void searchAllDataInFinalDatabase() {
        validateAllDataSearch("final");
    }

    @Test
    public void testSearchResultsOnNonExistentEntityModel() {
        runAsDataHubDeveloper();
        String collectionDeleteQuery = "declareUpdate(); xdmp.collectionDelete(\"http://marklogic.com/entity-services/models\")";
        getHubClient().getFinalClient().newServerEval().javascript(collectionDeleteQuery).evalAs(String.class);

        runAsHubCentralUser();
        StringHandle results = new EntitySearchManager(getHubClient()).search(new SearchQuery());

        int count = getDocumentCount(getHubClient().getFinalClient());
        ObjectNode node = readJsonObject(results.get());
        assertEquals(count, node.get("total").asInt(), String.format("Expected %s total documents; an empty search should result in a count equal " +
                "to all the docs that the user can read in the database", count));

        SearchQuery searchQuery = new SearchQuery();
        searchQuery.getQuery().setEntityTypeIds(Arrays.asList("Some-entityType"));
        assertNull(new EntitySearchManager(getHubClient()).search(searchQuery), "Entity Model with name Some-entityType doesn't exist ");
    }

    @Test
    public void testSortCriteria() {
        EntitySearchManager entitySearchManager = new EntitySearchManager(getHubClient());
        SearchQuery query = new SearchQuery();
        DocSearchQueryInfo info = new DocSearchQueryInfo();
        info.setEntityTypeIds(Arrays.asList("Customer"));
        query.setQuery(info);

        SearchQuery.SortOrder sortOrder = new SearchQuery.SortOrder();
        sortOrder.setPropertyName("customerId");
        sortOrder.setSortDirection("ascending");
        List<SearchQuery.SortOrder> sortOrderList = new ArrayList<>();
        sortOrderList.add(sortOrder);
        query.setSortOrder(sortOrderList);

        entitySearchManager.buildSearchTextWithSortOperator(query);
        assertEquals("sort:Customer_customerIdAscending", query.getQuery().getSearchText());

        query.getQuery().setSearchText("");
        sortOrderList.get(0).setSortDirection("descending");
        entitySearchManager.buildSearchTextWithSortOperator(query);
        assertEquals("sort:Customer_customerIdDescending", query.getQuery().getSearchText());

        query.getQuery().setSearchText("Jane");
        sortOrderList.get(0).setSortDirection("descending");
        entitySearchManager.buildSearchTextWithSortOperator(query);
        assertEquals("Jane sort:Customer_customerIdDescending", query.getQuery().getSearchText());

        query.getQuery().setSearchText("Jane");
        sortOrderList.get(0).setSortDirection("someOtherValue");
        entitySearchManager.buildSearchTextWithSortOperator(query);
        assertEquals("Jane sort:Customer_customerIdDescending", query.getQuery().getSearchText());

        query.getQuery().setSearchText("Jane");
        sortOrderList.get(0).setSortDirection("descending");
        sortOrder = new SearchQuery.SortOrder();
        sortOrder.setPropertyName("customerId");
        sortOrder.setSortDirection("ascending");
        sortOrderList.add(sortOrder);
        entitySearchManager.buildSearchTextWithSortOperator(query);
        assertEquals("Jane sort:Customer_customerIdDescending sort:Customer_customerIdAscending", query.getQuery().getSearchText());

        info.setEntityTypeIds(null);
        query.getQuery().setSearchText("Jane");
        entitySearchManager.buildSearchTextWithSortOperator(query);
        assertEquals("Jane sort:_customerIdDescending sort:_customerIdAscending", query.getQuery().getSearchText(),
            "If there's somehow no entity type specified, then an error shouldn't be thrown; we should just have sort " +
                "state names that don't correspond to actual states, which will result in no error but no sorting either");
    }

    /**
     * This is using XML instances with namespaces to ensure that path expressions in sort operator states work
     * correctly. Will soon add a JSON test once we have sort operators that are entity-type-specific.
     */
    @Test
    public void testSearchResultsWithSorting() {
        runAsDataHubDeveloper();
        installProjectInFolder("customer-entity-with-indexes", true);

        if (!isVersionCompatibleWith520Roles()) {
            logger.warn("ML version is not compatible with 5.2.0 roles, so will deploy indexes as flow-developer instead of data-hub-developer");
            runAsUser("flow-developer", "password");
        }

        new EntityManagerImpl(getHubConfig()).saveDbIndexes();
        new DhsDeployer().deployAsDeveloper(getHubConfig());

        ReferenceModelProject project = new ReferenceModelProject(getHubClient());
        final String customerNamespace = "urn:customerNamespace";
        project.createCustomerInstance(new Customer(1, "Jane"), Format.XML, customerNamespace);
        project.createCustomerInstance(new Customer(2, "Sally"), Format.XML, customerNamespace);
        project.createCustomerInstance(new Customer(3, "Kim"), Format.XML, customerNamespace);

        runAsHubCentralUser();

        SearchQuery query = new SearchQuery();
        DocSearchQueryInfo info = new DocSearchQueryInfo();
        info.setEntityTypeIds(Arrays.asList("Customer"));
        query.setQuery(info);

        SearchQuery.SortOrder sortOrder = new SearchQuery.SortOrder();
        sortOrder.setPropertyName("customerId");
        sortOrder.setSortDirection("ascending");
        List<SearchQuery.SortOrder> sortOrderList = new ArrayList<>();
        sortOrderList.add(sortOrder);
        query.setSortOrder(sortOrderList);

        StringHandle results = new EntitySearchManager(getHubClient()).search(query);
        ObjectNode node = readJsonObject(results.get());
        assertEquals(1, node.get("results").get(0).get("entityProperties").get(0).get("propertyValue").asInt());
        assertEquals(2, node.get("results").get(1).get("entityProperties").get(0).get("propertyValue").asInt());
        assertEquals(3, node.get("results").get(2).get("entityProperties").get(0).get("propertyValue").asInt());

        sortOrderList.get(0).setSortDirection("descending");
        results = new EntitySearchManager(getHubClient()).search(query);
        node = readJsonObject(results.get());
        assertEquals(3, node.get("results").get(0).get("entityProperties").get(0).get("propertyValue").asInt());
        assertEquals(2, node.get("results").get(1).get("entityProperties").get(0).get("propertyValue").asInt());
        assertEquals(1, node.get("results").get(2).get("entityProperties").get(0).get("propertyValue").asInt());
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

        List<String> actualCols = new EntitySearchManager(getHubClient()).getColumnNamesForRowExport(queryDocument);

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

        String actualQueryName = new EntitySearchManager(getHubClient()).getQueryName(queryDocument);

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

        String actualEntityTypeId = new EntitySearchManager(getHubClient()).getEntityTypeIdForRowExport(queryDocument);

        assertEquals(expectedEntityTypeId, actualEntityTypeId);
    }

    @Test
    void testGetQueryOptions() {
        assertThrows(RuntimeException.class, () -> new EntitySearchManager(getHubClient()).getQueryOptions("non-existent-options"), "Search options doesn't exist");
    }

    private void validateSearchWithTransform(String databaseType) {
        runAsDataHubDeveloper();
        ReferenceModelProject project = installOnlyReferenceModelEntities(true);
        deployEntityIndexes();
        project.createCustomerInstance(new Customer(1, "Jane"), databaseType);
        project.createCustomerInstance(new Customer(2, "Sally"), databaseType);

        runAsHubCentralUser();

        SearchQuery query = new SearchQuery();
        DocSearchQueryInfo info = new DocSearchQueryInfo();
        info.setEntityTypeIds(Arrays.asList("Customer"));
        query.setQuery(info);

        StringHandle results = new EntitySearchManager(getHubClient(), databaseType).search(query);
        ObjectNode node = readJsonObject(results.get());
        assertTrue(node.has("selectedPropertyDefinitions"), "Including this makes life easy on the UI so it knows what " +
                "columns to display");
        assertTrue(node.has("entityPropertyDefinitions"), "Including this means the UI doesn't need to make a separate call " +
                "to /api/models to get the property names and also traverse the entity definition itself");
        assertTrue(node.get("results").get(0).has("entityProperties"), "Each result is expected to have " +
                "entityProperties so that the UI knows what structured values to show for each entity instance");
        assertTrue(node.get("results").get(1).has("entityProperties"));

        // Adding propertiesToDisplay to search query which are user selected columns
        List<String> propertiesToDisplay = Arrays.asList("name", "customerId");
        query.setPropertiesToDisplay(propertiesToDisplay);
        results = new EntitySearchManager(getHubClient(), databaseType).search(query);
        node = readJsonObject(results.get());
        assertTrue(node.has("selectedPropertyDefinitions"), "Including this makes life easy on the UI so it knows what " +
                "columns to display");
        assertEquals(2, node.get("selectedPropertyDefinitions").size());
        assertTrue(node.has("entityPropertyDefinitions"), "Including this means the UI doesn't need to make a separate call " +
                "to /api/models to get the property names and also traverse the entity definition itself");
        assertTrue(node.get("results").get(0).has("entityProperties"), "Each result is expected to have " +
                "entityProperties so that the UI knows what structured values to show for each entity instance");
        assertTrue(node.get("results").get(1).has("entityProperties"));
    }

    private void validateAllDataSearch(String databaseType) {
        runAsDataHubDeveloper();
        ReferenceModelProject project = installOnlyReferenceModelEntities(true);
        deployEntityIndexes();
        project.createCustomerInstance(new Customer(1, "Jane"), databaseType);
        project.createCustomerInstance(new Customer(2, "Sally"), databaseType);

        runAsHubCentralUser();
        DatabaseClient client = databaseType.equalsIgnoreCase("staging") ? getHubClient().getStagingClient() : getHubClient().getFinalClient();

        int count = getDocumentCount(client);
        StringHandle results = new EntitySearchManager(getHubClient(), databaseType).search(new SearchQuery());
        ObjectNode node = readJsonObject(results.get());
        assertEquals(count, node.get("total").asInt(), String.format("Expected %s total documents; an empty search should result in a count equal " +
                "to all the docs that the user can read in the database", count));
    }
}
