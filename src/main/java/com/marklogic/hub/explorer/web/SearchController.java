/*
 * Copyright 2019 MarkLogic Corporation. All rights reserved.
 */
package com.marklogic.hub.explorer.web;

import java.util.Optional;

import com.marklogic.hub.explorer.model.Document;
import com.marklogic.hub.explorer.model.FacetInfo;
import com.marklogic.hub.explorer.model.FacetSearchQuery;
import com.marklogic.hub.explorer.model.SearchQuery;
import com.marklogic.hub.explorer.service.FacetSearchService;
import com.marklogic.hub.explorer.service.SearchService;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@RequestMapping(value = "/datahub/v2/search")
public class SearchController {

  @Autowired
  private SearchService searchService;

  @Autowired
  private FacetSearchService facetSearchService;

  @RequestMapping(method = RequestMethod.POST)
  @ResponseBody
  public String search(@RequestBody SearchQuery searchQuery) {
    return searchService.search(searchQuery).get();
  }

  @RequestMapping(method = RequestMethod.GET)
  @ResponseBody
  public ResponseEntity<Document> search(@RequestParam String docUri) {
    Optional<Document> optionalContent = searchService.getDocument(docUri);
    HttpHeaders headers = new HttpHeaders();

    return optionalContent.map(content -> {
      if (content.getContent().startsWith("<")) {
        headers.setContentType(MediaType.APPLICATION_XML);
      } else {
        headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
      }
      return new ResponseEntity<>(content, headers, HttpStatus.OK);
    }).orElse(new ResponseEntity<>(HttpStatus.OK));
  }

  @RequestMapping(value = "/facet-values", method = RequestMethod.POST)
  @ResponseBody
  public JsonNode getFacetValues(@RequestBody FacetSearchQuery fsQuery) {
    return facetSearchService.getFacetValues(fsQuery);
  }

  @RequestMapping(value = "/facet-values/range", method = RequestMethod.POST)
  @ResponseBody
  public JsonNode getFacetValuesRange(@RequestBody FacetInfo facetInfo) {
    return facetSearchService.getFacetValuesRange(facetInfo);
  }
}
