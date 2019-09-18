package com.marklogic.hub.explorer.service;

import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.explorer.model.Document;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.util.SearchHelper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class SearchService {

  @Autowired
  private SearchHelper searchHelper;

  public StringHandle search(SearchQuery searchQuery) {
    return searchHelper.search(searchQuery);
  }

  public Document getDocument(String docUri) {
    Document doc = searchHelper.getDocument(docUri);
    return doc;
  }
}
