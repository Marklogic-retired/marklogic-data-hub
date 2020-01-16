package com.marklogic.hub.explorer.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.explorer.model.FacetInfo;
import com.marklogic.hub.explorer.model.FacetSearchQuery;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import com.marklogic.hub.explorer.util.ExplorerConfig;

import com.fasterxml.jackson.databind.JsonNode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class FacetSearchService {

  public static final String ANY_STRING = "%";
  public static final String ANY_CHAR = "_";
  public static final String DOT_CHAR = ".";
  public static final String STRING_IDENTIFIER = "'";
  private static final Logger logger = LoggerFactory.getLogger(FacetSearchService.class);

  @Autowired
  DatabaseClientHolder databaseClientHolder;
  @Autowired
  SqlExecutionerService executioner;
  @Autowired
  ExplorerConfig explorerConfig;

  private String entityName = null;
  private String facetName = null;

  public List<String> getFacetValues(FacetSearchQuery fsQuery) {
    List<String> facetValues = new ArrayList<>();
    DatabaseClient client = databaseClientHolder.getDatabaseClient();
    String sqlQuery = generateSqlQuery(fsQuery);
    if (sqlQuery != null) {
      JsonNode queryResults = executioner.executeSqlQuery(client, sqlQuery).get();
      facetValues = parseFacetQueryResults(queryResults, facetName);
    }
    return facetValues;
  }

  public List<String> getFacetValuesRange(FacetInfo facetInfo) {
    List<String> facetValues = new ArrayList<>();
    JsonNode queryResults = null;
    DatabaseClient client = databaseClientHolder.getDatabaseClient();

    Properties props = explorerConfig.getQueryProperties();
    String sqlQuery = props.getProperty("minMaxFacetValuesQuery");

    entityName = facetInfo.getSchemaName() + DOT_CHAR + facetInfo.getEntityName();
    facetName = entityName + DOT_CHAR + facetInfo.getFacetName();
    String minFacet = facetInfo.getFacetName() + "Min";
    String maxFacet = facetInfo.getFacetName() + "Max";

    sqlQuery = String.format(sqlQuery, facetName, minFacet, facetName, maxFacet, entityName);

    if (sqlQuery != null) {
      queryResults = executioner.executeSqlQuery(client, sqlQuery).get();
    }

    if (queryResults != null) {
      queryResults = queryResults.path("rows").get(0);
      facetValues.add(queryResults.get(minFacet).get("value").asText());
      facetValues.add(queryResults.get(maxFacet).get("value").asText());
    }
    return facetValues;
  }

  private String generateSqlQuery(FacetSearchQuery fsq) {
    String query = null;
    entityName = fsq.getFacetInfo().getSchemaName() + DOT_CHAR + fsq.getFacetInfo().getEntityName();
    facetName = entityName + DOT_CHAR + fsq.getFacetInfo().getFacetName();
    Properties prop = explorerConfig.getQueryProperties();

    switch (fsq.getDataType()) {
      case "string":
        query = prop.getProperty("stringFacetValuesQuery");
        if (query != null) {
          query = String.format(query, facetName, entityName, facetName,
              STRING_IDENTIFIER + fsq.getQueryParams().get(0) + ANY_STRING + STRING_IDENTIFIER,
              facetName,
              STRING_IDENTIFIER + ANY_CHAR + ANY_STRING + fsq.getQueryParams().get(0) + ANY_STRING
                  + STRING_IDENTIFIER, fsq.getLimit());
        }
        break;

      case "date":
      case "dateTime":
        query = prop.getProperty("rangeFacetValuesQuery");
        if (query != null) {
          query = String.format(query, facetName, entityName, facetName,
              STRING_IDENTIFIER + fsq.getQueryParams().get(0) + STRING_IDENTIFIER,
              STRING_IDENTIFIER + fsq.getQueryParams().get(1) + STRING_IDENTIFIER, fsq.getLimit());
        }
        break;

      default:
        break;
    }
    logger.debug(query);
    return query;
  }

  private List<String> parseFacetQueryResults(JsonNode queryResults, String facetName) {
    List<String> values = new ArrayList<>();
    if (queryResults != null) {
      queryResults.path("rows").forEach(jsonNode -> {
        String value = jsonNode.get(facetName).get("value").asText();
        values.add(value);
      });
    }
    return values;
  }
}
