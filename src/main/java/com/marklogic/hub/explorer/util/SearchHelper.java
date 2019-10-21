/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.util;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.SearchHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryBuilder.Operator;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.explorer.model.Document;
import com.marklogic.hub.explorer.model.SearchQuery;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Component
public class SearchHelper {

  private static final String DEFAULT_OPTIONS = "exp-default";
  private static final String QUERY_OPTIONS = "exp-final-entity-options";

  private static final String COLLECTION_CONSTRAINT_NAME = "Collection";
  private static final String CREATED_ON_CONSTRAINT_NAME = "createdOnRange";
  private static final String JOB_WORD_CONSTRAINT_NAME = "createdByJobWord";
  private static final String JOB_RANGE_CONSTRAINT_NAME = "createdByJob";
  private static final String MASTERING_AUDIT_COLLECTION_NAME = "mdm-auditing";

  private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private static final DateTimeFormatter DATE_TIME_FORMAT = DateTimeFormatter
      .ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ");

  private static final Logger logger = LoggerFactory.getLogger(SearchHelper.class);

  @Autowired
  DatabaseClientHolder databaseClientHolder;

  public StringHandle search(SearchQuery searchQuery) {
    DatabaseClient client = databaseClientHolder.getDatabaseClient();
    QueryManager queryMgr = client.newQueryManager();
    StructuredQueryDefinition finalQueryDef = buildQuery(queryMgr, searchQuery);

    // Setting criteria and searching
    StringHandle resultHandle = new StringHandle();
    resultHandle.setFormat(Format.JSON);
    return queryMgr.search(finalQueryDef, resultHandle, searchQuery.getStart());
  }

  public Optional<Document> getDocument(String docUri) {
    DatabaseClient client = databaseClientHolder.getDatabaseClient();

    GenericDocumentManager docMgr = client.newDocumentManager();
    DocumentMetadataHandle documentMetadataReadHandle = new DocumentMetadataHandle();

    // Fetching document content and meta-data
    try {
      String content = docMgr.readAs(docUri, documentMetadataReadHandle, String.class);
      Map<String, String> metadata = documentMetadataReadHandle.getMetadataValues();
      return Optional.ofNullable(new Document(content, metadata));
    } catch (ResourceNotFoundException rnfe) {
      logger.warn(rnfe.getMessage());
      return Optional.empty();
    }
  }

  private StructuredQueryDefinition buildQuery(QueryManager queryMgr, SearchQuery searchQuery) {
    queryMgr.setPageLength(searchQuery.getPageLength());
    StructuredQueryBuilder queryBuilder = getQueryBuilder(queryMgr);

    // Creating queries object
    List<StructuredQueryDefinition> queries = new ArrayList<>();

    // Filtering search results for docs related to an entity
    if (!CollectionUtils.isEmpty(searchQuery.getEntityNames())) {
      // Collections to search
      String[] collections = searchQuery.getEntityNames().toArray(new String[0]);
      // Collections that have the mastering audit and notification docs. Excluding docs from
      // these collection in search results
      String[] excludedCollections = getExcludedCollections(searchQuery.getEntityNames());

      StructuredQueryDefinition finalCollQuery = queryBuilder
          .andNot(queryBuilder.collection(collections),
              queryBuilder.collection(excludedCollections));

      queries.add(finalCollQuery);
    }

    // Filtering by facets
    searchQuery.getFacets().forEach((facetType, facetValues) -> {
      StructuredQueryDefinition facetDef = null;

      if (facetType.equals(COLLECTION_CONSTRAINT_NAME)) {
        facetDef = queryBuilder.collectionConstraint(facetType, facetValues.toArray(new String[0]));
      } else if (facetType.equals(JOB_RANGE_CONSTRAINT_NAME)) {
        facetDef = queryBuilder
            .wordConstraint(JOB_WORD_CONSTRAINT_NAME, facetValues.toArray(new String[0]));
      } else if (facetType.equals(CREATED_ON_CONSTRAINT_NAME)) {
        // Converting the date in string format from yyyy-MM-dd format to yyyy-MM-dd HH:mm:ss format
        LocalDate startDate = LocalDate.parse(facetValues.get(0), DATE_FORMAT);
        String startDateTime = startDate.atStartOfDay(ZoneId.systemDefault())
            .format(DATE_TIME_FORMAT);

        // Converting the date in string format from yyyy-MM-dd format to yyyy-MM-dd HH:mm:ss format
        // Adding 1 day to end date to get docs harmonized on the end date as well.
        LocalDate endDate = LocalDate.parse(facetValues.get(1), DATE_FORMAT).plusDays(1);
        String endDateTime = endDate.atStartOfDay(ZoneId.systemDefault()).format(DATE_TIME_FORMAT);

        facetDef = queryBuilder
            .and(queryBuilder.rangeConstraint(facetType, Operator.GE, startDateTime),
                queryBuilder.rangeConstraint(facetType, Operator.LT, endDateTime));
      } else {
        facetDef = queryBuilder.rangeConstraint(facetType, StructuredQueryBuilder.Operator.EQ,
            facetValues.toArray(new String[0]));
      }

      if (facetDef != null) {
        queries.add(facetDef);
      }
    });

    // And between all the queries
    StructuredQueryDefinition finalQueryDef = queryBuilder
        .and(queries.toArray(new StructuredQueryDefinition[0]));

    // Setting search string if provided by user
    if (StringUtils.isNotEmpty(searchQuery.getQuery())) {
      finalQueryDef.setCriteria(searchQuery.getQuery());
    }
    return finalQueryDef;
  }

  private StructuredQueryBuilder getQueryBuilder(QueryManager queryMgr) {
    try {
      // Testing if the QUERY_OPTIONS File exists in the modules database
      StructuredQueryBuilder queryBuilder = queryMgr.newStructuredQueryBuilder(QUERY_OPTIONS);
      queryMgr.search(queryBuilder.and(), new SearchHandle());
      // Creating query builder with the QUERY_OPTIONS file if it exists
      return queryBuilder;
    } catch (FailedRequestException fre) {
      logger.error(fre.getServerMessage());
      // QUERY_OPTIONS doesn't exist. So, using DEFAULT_OPTIONS query options file
      return queryMgr.newStructuredQueryBuilder(DEFAULT_OPTIONS);
    }
  }

  private String[] getExcludedCollections(List<String> entityModels) {
    entityModels.forEach(collection -> {
      entityModels.set(entityModels.indexOf(collection), "sm-" + collection + "-notification");
    });
    entityModels.add(MASTERING_AUDIT_COLLECTION_NAME);
    return entityModels.toArray(new String[0]);
  }
}
