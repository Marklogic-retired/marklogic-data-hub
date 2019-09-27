/** Copyright 2019 MarkLogic Corporation. All rights reserved. */
package com.marklogic.hub.explorer.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SearchQuery {

  private String query;
  private List<String> entityNames;
  private long start;
  private long pageLength;
  private Map<String, List<String>> facets;

  public String getQuery() {
    return query;
  }

  public List<String> getEntityNames() {
    return entityNames;
  }

  public long getStart() {
    return start;
  }

  public long getPageLength() {
    return pageLength;
  }

  public Map<String, List<String>> getFacets() {
    return facets;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  public void setEntityNames(List<String> entityNames) {
    this.entityNames = (entityNames != null) ? entityNames : new ArrayList<>();
  }

  public void setStart(long start) {
    this.start = start;
  }

  public void setPageLength(long pageLength) {
    this.pageLength = pageLength;
  }

  public void setFacets(Map<String, List<String>> facets) {
    this.facets = (facets != null) ? facets : new HashMap<>();
  }

}
