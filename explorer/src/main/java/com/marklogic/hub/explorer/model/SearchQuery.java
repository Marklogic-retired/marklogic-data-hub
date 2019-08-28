package com.marklogic.hub.explorer.model;

import java.util.List;
import java.util.Map;

public class SearchQuery {
    private String query;
    private String entityName;
    private long start;
    private long pageLength;
    private Map<String, List<String>> facets;

    public String getQuery() {
        return query;
    }

    public String getEntityName() {
        return entityName;
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
}
