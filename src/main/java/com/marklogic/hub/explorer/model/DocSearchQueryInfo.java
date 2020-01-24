package com.marklogic.hub.explorer.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DocSearchQueryInfo {

  private String searchStr;
  private List<String> entityNames;
  private Map<String, FacetData> facets;

  public DocSearchQueryInfo() {
    this.searchStr = "";
    this.entityNames = new ArrayList<>();
    this.facets = new HashMap<>();
  }

  public String getSearchStr() {
    return searchStr;
  }

  public void setSearchStr(String searchStr) {
    this.searchStr = searchStr;
  }

  public List<String> getEntityNames() {
    return entityNames;
  }

  public void setEntityNames(List<String> entityNames) {
    this.entityNames = entityNames;
  }

  public Map<String, FacetData> getFacets() {
    return this.facets = (facets != null) ? facets : new HashMap<>();
  }

  public void setFacets(Map<String, FacetData> facets) {
    this.facets = facets;
  }

  public final static class FacetData {

    private String dataType;
    private List<String> stringValues;
    private RangeValues rangeValues;

    public FacetData() {
      this.dataType = "";
      this.stringValues = new ArrayList<>();
      this.rangeValues = new RangeValues();
    }

    public String getDataType() {
      return dataType;
    }

    public void setDataType(String dataType) {
      this.dataType = dataType;
    }

    public List<String> getStringValues() {
      return stringValues;
    }

    public void setStringValues(List<String> stringValues) {
      this.stringValues = (stringValues != null) ? stringValues : new ArrayList<>();
    }

    public RangeValues getRangeValues() {
      return this.rangeValues = (rangeValues != null) ? rangeValues : new RangeValues();
    }

    public void setRangeValues(RangeValues rangeValues) {
      this.rangeValues = rangeValues;
    }
  }

  public final static class RangeValues {

    private String lowerBound;
    private String upperBound;

    public RangeValues() {
      this.lowerBound = "";
      this.upperBound = "";
    }

    public String getLowerBound() {
      return lowerBound;
    }

    public void setLowerBound(String lowerBound) {
      this.lowerBound = lowerBound;
    }

    public String getUpperBound() {
      return upperBound;
    }

    public void setUpperBound(String upperBound) {
      this.upperBound = upperBound;
    }
  }
}
