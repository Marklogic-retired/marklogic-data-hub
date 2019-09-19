package com.marklogic.hub.explorer.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.StructuredQueryBuilder;
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

  private static final String QUERY_OPTIONS = "exp-final-entity-options";
  private static final Logger logger = LoggerFactory.getLogger(SearchHelper.class);
  @Autowired
  DatabaseClientHolder databaseClientHolder;

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
    searchQuery.getFacets().forEach((facetType, facetValues) -> {
      StructuredQueryDefinition facetDef = null;
      facetDef = facetType.equals("Collection") ?
          queryBuilder.collectionConstraint(facetType, facetValues.toArray(new String[0])) :
          queryBuilder.rangeConstraint(facetType, StructuredQueryBuilder.Operator.EQ,
              facetValues.toArray(new String[0]));

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
      String content = docMgr.readAs(docUri, documentMetadataReadHandle, String.class,
          new ServerTransform("ml:prettifyXML"));
      Map<String, String> metadata = documentMetadataReadHandle.getMetadataValues();
      return Optional.ofNullable(new Document(content, metadata));
    } catch (ResourceNotFoundException rnfe) {
      logger.error("The requested document " + docUri + " do not exist");
      logger.error(rnfe.getMessage());
      return Optional.ofNullable(null);
    }
  }
}
