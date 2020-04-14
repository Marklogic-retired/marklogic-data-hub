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
package com.marklogic.hub.central.managers;

import com.marklogic.hub.central.AbstractHubCentralTest;
import com.marklogic.hub.central.models.SearchQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class EntitySearchManagerTest extends AbstractHubCentralTest {

    EntitySearchManager entitySearchManager;

    @BeforeEach
    public void setUpDocs() {
        entitySearchManager = new EntitySearchManager(hubConfig);
    }

    @Test
    public void testSearchResultsOnNoData() {
        entitySearchManager.QUERY_OPTIONS = "non-existent-options";
        String collectionDeleteQuery = "declareUpdate(); xdmp.collectionDelete(\"http://marklogic.com/entity-services/models\")";
        hubConfig.newFinalClient().newServerEval().javascript(collectionDeleteQuery).evalAs(String.class);
        assertTrue(entitySearchManager.search(new SearchQuery()).get().isEmpty());

        SearchQuery query = new SearchQuery();
        query.getQuery().setEntityNames(Arrays.asList("Some-entityType"));
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
        searchQuery.getQuery().setSearchStr("&<>'\"");

        String expectedResult = "<search xmlns=\"http://marklogic.com/appservices/search\">\n<qtext>&amp;&lt;&gt;&apos;&quot;</qtext><query><collection-query><uri>collection1</uri></collection-query></query></search>";
        assertTrue(entitySearchManager.buildSearchOptions(query, searchQuery).equals(expectedResult));
    }
}
