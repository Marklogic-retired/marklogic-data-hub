package com.marklogic.hub.explorer.model;

public class FacetSearchQuery {

  private FacetInfo facetInfo;
  private String dataType;
  private String limit;
  private String pattern;

  public FacetInfo getFacetInfo() {
    return facetInfo;
  }

  public void setFacetInfo(FacetInfo facetInfo) {
    this.facetInfo = facetInfo;
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

  public String getPattern() {
    return pattern;
  }

  public void setPattern(String pattern) {
    this.pattern = pattern;
  }
}
