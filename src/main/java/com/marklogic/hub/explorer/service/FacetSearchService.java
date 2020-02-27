package com.marklogic.hub.explorer.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.explorer.dataservices.EntitySearchService;
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

  @Autowired
  DatabaseClientHolder databaseClientHolder;
  @Autowired
  ExplorerConfig explorerConfig;

  public JsonNode getFacetValues(FacetSearchQuery fsQuery) {
    DatabaseClient dbClient = databaseClientHolder.getDataServiceClient();

    if (fsQuery.getFacetInfo().getReferenceType().equals("field")) {
      fsQuery.getFacetInfo().setReferenceType("field");
      if (fsQuery.getFacetInfo().getPropertyPath().equals("Step")) {
        fsQuery.getFacetInfo().setPropertyPath("datahubCreatedByStep");
      }

      if (fsQuery.getFacetInfo().getPropertyPath().equals("Flow")) {
        fsQuery.getFacetInfo().setPropertyPath("datahubCreatedInFlow");
      }
    }

    return EntitySearchService.on(dbClient)
        .getMatchingPropertyValues(fsQuery.getFacetInfo().getEntityTypeId(),
            fsQuery.getFacetInfo().getPropertyPath(), fsQuery.getFacetInfo().getReferenceType(),
            fsQuery.getPattern(), Integer.parseInt(fsQuery.getLimit()));
  }

  public JsonNode getFacetValuesRange(FacetInfo facetInfo) {
    DatabaseClient dbClient = databaseClientHolder.getDataServiceClient();
    
    return EntitySearchService.on(dbClient)
        .getMinAndMaxPropertyValues(facetInfo.getEntityTypeId(), facetInfo.getPropertyPath(),
            facetInfo.getReferenceType());
  }
}
