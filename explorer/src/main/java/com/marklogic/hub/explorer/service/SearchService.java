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

import java.util.ArrayList;

@Service
public class SearchService {

    @Autowired
    private DatabaseClientHolder databaseClientHolder;

    public StringHandle search(SearchQuery searchQuery) {
        DatabaseClient client = databaseClientHolder.getDatabaseClient();
        String OPTIONS_NAME = "final-entity-options";

        QueryManager queryMgr = client.newQueryManager();
        queryMgr.setPageLength(searchQuery.getPageLength());

        StructuredQueryBuilder qb = queryMgr.newStructuredQueryBuilder(OPTIONS_NAME);

        // Creating queries object
        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();

        // Filtering search results for docs related to an entity
        if (searchQuery.getEntityName() != null && !searchQuery.getEntityName().equals("")) {
            StructuredQueryDefinition querydef = qb.collection(searchQuery.getEntityName());
            queries.add(querydef);
        }

        // Filtering by facets
        if (searchQuery.getFacets() != null) {
            searchQuery.getFacets().entrySet().forEach(entry -> entry.getValue().forEach(value -> {
                StructuredQueryDefinition def = null;
                if (entry.getKey().equals("Collection")) {
                    def = qb.collectionConstraint(entry.getKey(), value);
                } else {
                    def = addRangeConstraint(qb, entry.getKey(), value);
                }

                if (def != null) {
                    queries.add(def);
                }
            }));
        }

        // And between all the queries
        StructuredQueryDefinition sqd = qb.and(queries.toArray(new StructuredQueryDefinition[0]));
        sqd.setCriteria(searchQuery.getQuery());

        // Setting criteria and searching
        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        return queryMgr.search(sqd, sh, searchQuery.getStart());
    }

    private static StructuredQueryDefinition addRangeConstraint(StructuredQueryBuilder sb, String name, String value) {
        StructuredQueryDefinition sqd = null;
        if (value != null && !value.isEmpty()) {
            sqd = sb.rangeConstraint(name, StructuredQueryBuilder.Operator.EQ, value);
        }
        return sqd;
    }
}
