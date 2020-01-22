/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class SearchQuery {

  private String query;
  private List<String> entityNames;
  private long start;
  private long pageLength;
  private Map<String, FacetData> facets;
  private List<SortOrder> sortOrder;

  public String getQuery() {
    return query;
  }

  public void setQuery(String query) {
    this.query = query;
  }

  public List<String> getEntityNames() {
    return entityNames;
  }

  public void setEntityNames(List<String> entityNames) {
    this.entityNames = (entityNames != null) ? entityNames : new ArrayList<>();
  }

  public long getStart() {
    return start;
  }

  public void setStart(long start) {
    this.start = start;
  }

  public long getPageLength() {
    return pageLength;
  }

  public void setPageLength(long pageLength) {
    this.pageLength = pageLength;
  }

  public Map<String, FacetData> getFacets() {
    return facets;
  }

  public void setFacets(Map<String, FacetData> facets) {
    this.facets = (facets != null) ? facets : new HashMap<>();
  }

  public Optional<List<SortOrder>> getSortOrder() {
    return Optional.ofNullable(sortOrder);
  }

  public void setSortOrder(List<SortOrder> sortOrder) {
    this.sortOrder = sortOrder;
  }

  public final static class SortOrder {

    private String name;
    private String dataType;
    private boolean ascending;

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getDataType() {
      return dataType;
    }

    public void setDataType(String dataType) {
      this.dataType = dataType;
    }

    public boolean isAscending() {
      return ascending;
    }

    public void setAscending(boolean ascending) {
      this.ascending = ascending;
    }
  }

  public final static class FacetData {

    private String dataType;
    private List<String> values;

    public String getDataType() {
      return dataType;
    }

    public void setDataType(String dataType) {
      this.dataType = dataType;
    }

    public List<String> getValues() {
      return values;
    }

    public void setValues(List<String> values) {
      this.values = values;
    }
  }
}
