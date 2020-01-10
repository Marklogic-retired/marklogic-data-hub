package com.marklogic.hub.explorer.search;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.explorer.model.FacetSearchQuery;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import com.marklogic.hub.explorer.util.SqlExecutioner;

import com.fasterxml.jackson.databind.JsonNode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class FacetSearchImpl implements Search {

  public static final String ANY_STRING = "%";
  public static final String ANY_CHAR = "_";
  public static final String DOT_CHAR = ".";
  public static final String STRING_IDENTIFIER = "'";
  private static final String QUERIES_FILE = "SqlQueries.properties";
  private static final Logger logger = LoggerFactory.getLogger(FacetSearchImpl.class);

  @Autowired
  DatabaseClientHolder databaseClientHolder;
  @Autowired
  SqlExecutioner executioner;
  
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

  private String generateSqlQuery(FacetSearchQuery fsq) {
    String query = null;
    entityName = fsq.getSchemaName() + DOT_CHAR + fsq.getEntityName();
    facetName = entityName + DOT_CHAR + fsq.getFacetName();
    try {
      InputStream input = FacetSearchImpl.class.getClassLoader().getResourceAsStream(QUERIES_FILE);
      Properties prop = new Properties();
      prop.load(input);
      switch (fsq.getDataType()) {
        case "string":
          query = prop.getProperty("stringQuery");
          query = String.format(query, facetName, entityName, facetName,
              STRING_IDENTIFIER + fsq.getQueryParams().get(0) + ANY_STRING + STRING_IDENTIFIER,
              facetName,
              STRING_IDENTIFIER + ANY_CHAR + ANY_STRING + fsq.getQueryParams().get(0) + ANY_STRING
                  + STRING_IDENTIFIER, fsq.getLimit());
          break;

        default:
          break;
      }
      logger.debug(query);
    } catch (IOException ioe) {
      logger.error(ioe.getMessage());
    }
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
