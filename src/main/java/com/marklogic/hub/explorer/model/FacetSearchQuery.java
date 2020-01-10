package com.marklogic.hub.explorer.model;

import java.util.List;

public class FacetSearchQuery {

  private String schemaName;
  private String entityName;
  private String facetName;
  private String dataType;
  private String limit;
  private List<String> queryParams;

  public String getSchemaName() {
    return schemaName;
  }

  public void setSchemaName(String schemaName) {
    this.schemaName = schemaName;
  }

  public String getEntityName() {
    return entityName;
  }

  public void setEntityName(String entityName) {
    this.entityName = entityName;
  }

  public String getFacetName() {
    return facetName;
  }

  public void setFacetName(String facetName) {
    this.facetName = facetName;
  }

  public String getDataType() {
    return dataType;
  }

  public void setDataType(String dataType) {
    this.dataType = dataType;
  }

  public String getLimit() {
    return limit;
  }

  public void setLimit(String limit) {
    this.limit = limit;
  }

  public List<String> getQueryParams() {
    return queryParams;
  }

  public void setQueryParams(List<String> queryParams) {
    this.queryParams = queryParams;
  }
}
