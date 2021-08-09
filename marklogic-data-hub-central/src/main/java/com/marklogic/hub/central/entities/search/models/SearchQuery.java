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
import java.util.List;
import java.util.Optional;

public class SearchQuery {

    private DocSearchQueryInfo query;
    private List<String> propertiesToDisplay;
    private long start;
    private long pageLength;
    private List<SortOrder> sortOrder;

    public SearchQuery() {
        this.query = new DocSearchQueryInfo();
        this.propertiesToDisplay = new ArrayList<>();
    }

    /**
     * @return combination of the user's search text plus custom constraints plus sort operators
     */
    public String calculateSearchCriteriaWithSortOperator() {
        final StringBuilder builder = new StringBuilder(this.query.calculateSearchCriteria());

        final Optional<List<SortOrder>> sortOrders = getSortOrder();

        // When sorting on a property, it is assumed there's one and only one entity type selected
        final String selectedEntityType = this.query.getSingleSelectedEntityType();
        if (selectedEntityType != null) {
            sortOrders.ifPresent(sortOrderList -> sortOrderList.forEach(sortOrder -> {
                String sortOperator = "sort";
                String stateName = selectedEntityType + "_" + sortOrder.getPropertyName().concat(StringUtils.capitalize(sortOrder.getSortDirection()));
                builder.append(" ").append(sortOperator).append(":").append(stateName);
            }));
        }

        return StringUtils.trim(builder.toString());
    }

    public void addSortOrder(String propertyName, String direction) {
        if (this.sortOrder == null) {
            this.sortOrder = new ArrayList<>();
        }
        this.sortOrder.add(new SortOrder(propertyName, direction));
    }

    public DocSearchQueryInfo getQuery() {
        return this.query;
    }

    public void setQuery(DocSearchQueryInfo query) {
        this.query = query;
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

    public Optional<List<SortOrder>> getSortOrder() {
        return Optional.ofNullable(sortOrder);
    }

    public void setSortOrder(List<SortOrder> sortOrder) {
        this.sortOrder = sortOrder;
    }

    public List<String> getPropertiesToDisplay() {
        return propertiesToDisplay;
    }

    public void setPropertiesToDisplay(List<String> propertiesToDisplay) {
        this.propertiesToDisplay = propertiesToDisplay;
    }

    public final static class SortOrder {

        private String propertyName;
        private String sortDirection;

        public SortOrder() {
        }

        public SortOrder(String propertyName, String sortDirection) {
            this.propertyName = propertyName;
            this.sortDirection = sortDirection;
        }

        public String getPropertyName() {
            return propertyName;
        }

        public void setPropertyName(String propertyName) {
            this.propertyName = propertyName;
        }

        public String getSortDirection() {
            if (!this.sortDirection.equals("ascending") && !this.sortDirection.equals("descending")) {
                sortDirection = "descending";
            }
            return sortDirection;
        }

        public void setSortDirection(String sortDirection) {
            this.sortDirection = sortDirection;
        }
    }
}
