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

import java.util.List;
import java.util.Optional;

public class SearchQuery {

  private DocSearchQueryInfo query;
  private long start;
  private long pageLength;
  private List<SortOrder> sortOrder;

  public SearchQuery() {
    this.query = new DocSearchQueryInfo();
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
}
