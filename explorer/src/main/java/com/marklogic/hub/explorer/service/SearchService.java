package com.marklogic.hub.explorer.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
import com.marklogic.hub.explorer.util.DatabaseClientHolder;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;


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

  public Document getDocument(String docUri) {
    String content = null;
    Map<String, String> metadata = null;
    DatabaseClient client = databaseClientHolder.getDatabaseClient();
    Document document = new Document();

    GenericDocumentManager docMgr = client.newDocumentManager();
    DocumentMetadataHandle documentMetadataReadHandle = new DocumentMetadataHandle();

    // Fetching document content and meta-data
    try {
      content = docMgr.readAs(docUri, documentMetadataReadHandle, String.class,
          new ServerTransform("ml:prettifyXML"));
      metadata = documentMetadataReadHandle.getMetadataValues();
    } catch (ResourceNotFoundException rnfe) {
      return null;
    }

    // Setting content and meta-data to Document object
    document.setContent(content);
    document.setMetaData(metadata);

    return document;
  }
}
