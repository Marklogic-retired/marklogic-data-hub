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
