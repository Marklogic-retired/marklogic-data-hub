package com.marklogic.hub.explorer.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {

    private static final String QUERY_OPTIONS = "final-entity-options";

    @Autowired
    private DatabaseClientHolder databaseClientHolder;

    public StringHandle search(SearchQuery searchQuery) {
        DatabaseClient client = databaseClientHolder.getDatabaseClient();

        QueryManager queryMgr = client.newQueryManager();
        queryMgr.setPageLength(searchQuery.getPageLength());

        StructuredQueryBuilder queryBuilder = queryMgr.newStructuredQueryBuilder(QUERY_OPTIONS);

        // Creating queries object
        List<StructuredQueryDefinition> queries = new ArrayList<>();

        // Filtering search results for docs related to an entity
        if (!CollectionUtils.isEmpty(searchQuery.getEntityNames())) {
            String[] collections = searchQuery.getEntityNames().toArray(new String[0]);
            queries.add(queryBuilder.collection(collections));
        }

        // Filtering by facets
        if (searchQuery.getFacets() != null) {
            searchQuery.getFacets().forEach((facetType, facetValues) -> {
                StructuredQueryDefinition facetDef = null;
                facetDef = facetType.equals("Collection") ? queryBuilder.collectionConstraint(facetType,
                    facetValues.toArray(new String[0])) : queryBuilder.rangeConstraint(facetType,
                    StructuredQueryBuilder.Operator.EQ, facetValues.toArray(new String[0]));

                if (facetDef != null) {
                    queries.add(facetDef);
                }
            });
        }

        // And between all the queries
        StructuredQueryDefinition finalQueryDef = queryBuilder.and(queries.toArray(new StructuredQueryDefinition[0]));

        // Setting search string if provided by user
        if(StringUtils.isNotEmpty(searchQuery.getQuery())) {
            finalQueryDef.setCriteria(searchQuery.getQuery());
        }

        // Setting criteria and searching
        StringHandle resultHandle = new StringHandle();
        resultHandle.setFormat(Format.JSON);
        return queryMgr.search(finalQueryDef, resultHandle, searchQuery.getStart());
    }
}
