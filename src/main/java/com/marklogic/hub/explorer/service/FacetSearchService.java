package com.marklogic.hub.explorer.service;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.hub.explorer.dataservices.EntitySearchService;
import com.marklogic.hub.explorer.exception.ExplorerException;
import com.marklogic.hub.explorer.model.FacetInfo;
import com.marklogic.hub.explorer.model.FacetSearchQuery;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import com.marklogic.hub.explorer.util.ExplorerConfig;

import com.fasterxml.jackson.databind.JsonNode;

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

      if (fsQuery.getFacetInfo().getPropertyPath().equals("createdByStep")) {
        fsQuery.getFacetInfo().setPropertyPath("datahubCreatedByStep");
      }

      if (fsQuery.getFacetInfo().getPropertyPath().equals("createdInFlowRange")) {
        fsQuery.getFacetInfo().setPropertyPath("datahubCreatedInFlow");
      }
    }

    try {
      return EntitySearchService.on(dbClient)
          .getMatchingPropertyValues(fsQuery.getFacetInfo().getEntityTypeId(),
              fsQuery.getFacetInfo().getPropertyPath(), fsQuery.getFacetInfo().getReferenceType(),
              fsQuery.getPattern(), Integer.parseInt(fsQuery.getLimit()));
    } catch (MarkLogicServerException mse) {
      throw new ExplorerException(mse.getServerStatusCode(), mse.getServerMessage());
    }
  }

  public JsonNode getFacetValuesRange(FacetInfo facetInfo) {
    DatabaseClient dbClient = databaseClientHolder.getDataServiceClient();

    try {
      return EntitySearchService.on(dbClient)
          .getMinAndMaxPropertyValues(facetInfo.getEntityTypeId(), facetInfo.getPropertyPath(),
              facetInfo.getReferenceType());
    } catch (MarkLogicServerException mse) {
      throw new ExplorerException(mse.getServerStatusCode(), mse.getServerMessage());
    }
  }
}
