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

import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DocSearchQueryInfo {

    private boolean hideHubArtifacts;

    // Note that this is the user-provided search text and not the complete criteria string
    private String searchText;

    // This is a misnomer; these are expected to be types, not type IDs; a type ID is e.g.
    // http://example.org/MyEntity-1.0/MyEntity, whereas a type is "MyEntity" .
    // This cannot easily be changed in the DHF 5.x timeframe due to saved queries using this name.
    private List<String> entityTypeIds;
    private List<String> relatedEntityTypeIds;

    private Map<String, FacetData> selectedFacets;

    public DocSearchQueryInfo() {
        this.hideHubArtifacts = true;
        this.searchText = "";
        this.entityTypeIds = new ArrayList<>();
        this.relatedEntityTypeIds = new ArrayList<>();
        this.selectedFacets = new HashMap<>();
    }

    /**
     * @return combination of user's search text and custom constraints based on other properties of this class
     */
    public String calculateSearchCriteria() {
        StringBuilder builder = new StringBuilder(searchText != null ? searchText : "");

        final List<String> selectedEntityTypes = this.getSelectedEntityTypes();
        if (!selectedEntityTypes.isEmpty()) {
            // The string-concatenated list of entity types is enclosed in double quotes. Based on the current validation
            // rules for entity types, this isn't necessary to do; this is primarily for future-proofing in case those
            // rules were to change and allow characters like double quotes.
            builder.append(" entityType:\"")
                .append(selectedEntityTypes.stream().collect(Collectors.joining(",")))
                .append("\"");
        }

        if (isHideHubArtifacts()) {
            builder.append(" hideHubArtifacts:true");
        }

        return StringUtils.trim(builder.toString());
    }

    /**
     * @return a single entity type if one and only one entity type has been selected
     */
    public String getSingleSelectedEntityType() {
        return entityTypeIds != null && entityTypeIds.size() == 1 ? entityTypeIds.get(0) : null;
    }

    /**
     * @return an array of non-empty entity types; this is used to handle empty strings being passed in by the UI,
     * which seems like a bug, but we don't want it to cause a problem
     */
    public List<String> getSelectedEntityTypes() {
        return entityTypeIds != null ?
            entityTypeIds.stream().filter(type -> StringUtils.isNotBlank(type)).collect(Collectors.toList()) :
            new ArrayList<>();
    }

    public void addSelectedEntityType(String entityType) {
        if (entityTypeIds == null) {
            entityTypeIds = new ArrayList<>();
        }
        entityTypeIds.add(entityType);
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

    public List<String> getRelatedEntityTypeIds() {
        return relatedEntityTypeIds;
    }

    public void setRelatedEntityTypeIds(List<String> relatedEntityTypeIds) {
        this.relatedEntityTypeIds = relatedEntityTypeIds;
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
