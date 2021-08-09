package com.marklogic.hub.central.entities.search.models;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class CalculateSearchCriteriaWithSortOrderTest {

    SearchQuery searchQuery = new SearchQuery();

    @Test
    void ascending() {
        searchQuery.getQuery().setSearchText("user text");
        searchQuery.getQuery().addSelectedEntityType("Customer");
        searchQuery.addSortOrder("customerId", "ascending");
        assertEquals("user text entityType:\"Customer\" hideHubArtifacts:true sort:Customer_customerIdAscending", calculate());
    }

    @Test
    void descending() {
        searchQuery.getQuery().addSelectedEntityType("Customer");
        searchQuery.addSortOrder("customerId", "descending");
        assertEquals("entityType:\"Customer\" hideHubArtifacts:true sort:Customer_customerIdDescending", calculate());
    }

    @Test
    void invalidDirection() {
        searchQuery.getQuery().addSelectedEntityType("Customer");
        searchQuery.addSortOrder("customerId", "invalid");
        assertEquals("entityType:\"Customer\" hideHubArtifacts:true sort:Customer_customerIdDescending", calculate(),
            "If the sort direction isn't recognized, it defaults to descending");
    }

    @Test
    void multipleSortOrders() {
        searchQuery.getQuery().addSelectedEntityType("Customer");
        searchQuery.addSortOrder("customerId", "descending");
        searchQuery.addSortOrder("name", "ascending");
        assertEquals("entityType:\"Customer\" hideHubArtifacts:true sort:Customer_customerIdDescending sort:Customer_nameAscending", calculate());

    }

    @Test
    void noSelectedEntityTypes() {
        searchQuery.getQuery().setSearchText("hello");
        searchQuery.addSortOrder("customerId", "descending");
        assertEquals("hello hideHubArtifacts:true", calculate(),
            "If no entity type is selected, then no sort operators should be added to the calculate search text, as sort " +
                "operators are only generated for entity properties with sortable=true");
    }

    private String calculate() {
        return searchQuery.calculateSearchCriteriaWithSortOperator();
    }
}
