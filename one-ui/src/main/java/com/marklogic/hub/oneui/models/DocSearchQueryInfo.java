/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.oneui.models;

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
    return facets;
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
      this.stringValues = stringValues;
    }

    public RangeValues getRangeValues() {
      return rangeValues;
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
