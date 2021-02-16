/*
 * Copyright 2012-2021 MarkLogic Corporation
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
package com.marklogic.hub.central.entities.search.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DocSearchQueryInfo {

  private boolean hideHubArtifacts;
  private String searchText;
  private List<String> entityTypeIds;
  private Map<String, FacetData> selectedFacets;

  public DocSearchQueryInfo() {
    this.hideHubArtifacts = true;
    this.searchText = "";
    this.entityTypeIds = new ArrayList<>();
    this.selectedFacets = new HashMap<>();
  }

    /**
     * @return an array of non-empty entityTypeIds; this is used to handle empty strings being passed in by the UI,
     * which seems like a bug, but we don't want it to cause a problem
     */
  public String[] getEntityTypeCollections() {
      if (entityTypeIds != null && !entityTypeIds.isEmpty()) {
          List<String> filteredTypes = new ArrayList<>();
          entityTypeIds.forEach(type -> {
              if (type != null && type.trim().length() > 0) {
                  filteredTypes.add(type);
              }
          });
          return filteredTypes.toArray(new String[]{});
      }
      return null;
  }

  public boolean isHideHubArtifacts() {
    return hideHubArtifacts;
  }

  public void setHideHubArtifacts(boolean hideHubArtifacts) {
    this.hideHubArtifacts = hideHubArtifacts;
  }

  public String getSearchText() {
    return searchText;
  }

  public void setSearchText(String searchText) {
    this.searchText = searchText;
  }

  public List<String> getEntityTypeIds() {
    return entityTypeIds;
  }

  public void setEntityTypeIds(List<String> entityTypeIds) {
    this.entityTypeIds = entityTypeIds;
  }

  public Map<String, FacetData> getSelectedFacets() {
    return selectedFacets;
  }

  public void setSelectedFacets(Map<String, FacetData> selectedFacets) {
    this.selectedFacets = selectedFacets;
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
