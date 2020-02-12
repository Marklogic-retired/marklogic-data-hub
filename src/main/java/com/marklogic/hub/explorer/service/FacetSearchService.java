package com.marklogic.hub.explorer.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.marklogic.hub.explorer.model.FacetInfo;
import com.marklogic.hub.explorer.model.FacetSearchQuery;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;
import com.marklogic.hub.explorer.util.ExplorerConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class FacetSearchService {

  private static final Logger logger = LoggerFactory.getLogger(FacetSearchService.class);

  @Autowired
  DatabaseClientHolder databaseClientHolder;
  @Autowired
  ExplorerConfig explorerConfig;

  public List<String> getFacetValues(FacetSearchQuery fsQuery) {
    List<String> facetValues = new ArrayList<>();
    return facetValues;
  }

  public Map<String, String> getFacetValuesRange(FacetInfo facetInfo) {
    Map<String, String> facetValues = new HashMap<>();
    return facetValues;
  }
}
