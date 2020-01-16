package com.marklogic.hub.explorer.model;

public class FacetInfo {
  private String schemaName;
  private String entityName;
  private String facetName;

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
}
