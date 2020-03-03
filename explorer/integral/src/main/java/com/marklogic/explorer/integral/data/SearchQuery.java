package com.marklogic.explorer.integral.data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * "copied directly from Explorer source code" --
 * other than a change of package...
 * This is the canonical representation of the json used to
 * specify a query to MarkLogic
 * Our initial use of this is as input to jackson in order
 * to simplify json construction and the bizarre nature of
 * Java strings (when is a quote not a quote?  huh?)
 */
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
