package com.marklogic.hub.explorer.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {

    @Autowired
    private DatabaseClientHolder databaseClientHolder;

    public StringHandle search(SearchQuery searchQuery) {
        DatabaseClient client = databaseClientHolder.getDatabaseClient();
        String OPTIONS_NAME = "final-entity-options";

        QueryManager queryMgr = client.newQueryManager();
        queryMgr.setPageLength(searchQuery.getPageLength());

        StructuredQueryBuilder searchQueryBuilder = queryMgr.newStructuredQueryBuilder(OPTIONS_NAME);

        // Creating queries object
        List<StructuredQueryDefinition> queries = new ArrayList<>();

        // Filtering search results for docs related to an entity
        if (! CollectionUtils.isEmpty(searchQuery.getEntityNames())) {
            String[] collections = searchQuery.getEntityNames().toArray(new String[0]);
            queries.add(searchQueryBuilder.collection(collections));
        }

        // Filtering by facets
        if (searchQuery.getFacets() != null) {
            searchQuery.getFacets().forEach((facetType, facetValues) -> facetValues.forEach(facetValue -> {
                StructuredQueryDefinition facetDef = null;
                if (facetType.equals("Collection")) {
                    facetDef = searchQueryBuilder.collectionConstraint(facetType, facetValue);
                } else {
                    facetDef = searchQueryBuilder.rangeConstraint(facetType, StructuredQueryBuilder.Operator.EQ, facetValue);
                }

                if (facetDef != null) {
                    queries.add(facetDef);
                }
            }));
        }

        // And between all the queries
        StructuredQueryDefinition finalQueryDef = searchQueryBuilder.and(queries.toArray(new StructuredQueryDefinition[0]));
        finalQueryDef.setCriteria(searchQuery.getQuery());

        // Setting criteria and searching
        StringHandle resultHandle = new StringHandle();
        resultHandle.setFormat(Format.JSON);
        return queryMgr.search(finalQueryDef, resultHandle, searchQuery.getStart());
    }
}
