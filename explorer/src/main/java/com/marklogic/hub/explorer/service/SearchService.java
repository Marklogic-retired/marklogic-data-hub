package com.marklogic.hub.explorer.service;

import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.explorer.model.Document;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.util.SearchUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class SearchService {

  @Autowired
  private SearchUtil searchUtil;

  public StringHandle search(SearchQuery searchQuery) {
    return searchUtil.search(searchQuery);
  }

  public Document getDocument(String docUri) {
    try {
      return searchUtil.getDocument(docUri);
    } catch (ResourceNotFoundException rnfe) {
      return null;
    }
  }
}
