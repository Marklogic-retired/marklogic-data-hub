package com.marklogic.hub.explorer.model;

import java.util.List;

public class FacetSearchQuery {

  private FacetInfo facetInfo;
  private String dataType;
  private String limit;
  private List<String> queryParams;

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

  public List<String> getQueryParams() {
    return queryParams;
  }

  public void setQueryParams(List<String> queryParams) {
    this.queryParams = queryParams;
  }
}
