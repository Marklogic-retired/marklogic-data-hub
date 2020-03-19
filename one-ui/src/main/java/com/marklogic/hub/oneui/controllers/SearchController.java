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
package com.marklogic.hub.oneui.controllers;


import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.oneui.managers.FacetSearchManager;
import com.marklogic.hub.oneui.managers.SearchManager;
import com.marklogic.hub.oneui.models.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;


@Controller
@RequestMapping(value = "/api/search")
public class SearchController {

    @Autowired
    private SearchManager searchManager;

    @Autowired
    private FacetSearchManager facetSearchManager;

    @Autowired
    private HubConfigSession hubConfig;

    @Bean
    @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "request")
    FacetSearchManager facetSearchService() {
        return new FacetSearchManager(hubConfig);
    }

    @Bean
    @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "request")
    SearchManager searchManager() {
        return new SearchManager(hubConfig);
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public String search(@RequestBody SearchQuery searchQuery) {
        return searchManager.search(searchQuery).get();
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Document> search(@RequestParam String docUri) {
        Optional<Document> optionalContent = searchManager.getDocument(docUri);
        HttpHeaders headers = new HttpHeaders();

        return optionalContent.map(content -> {
            if (content.getContent().startsWith("<")) {
                headers.setContentType(MediaType.APPLICATION_XML);
            }
            else {
                headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
            }
            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.OK));
    }

    @RequestMapping(value = "/facet-values", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode getFacetValues(@RequestBody FacetSearchQuery fsQuery) {
        return facetSearchManager.getFacetValues(fsQuery);
    }

    @RequestMapping(value = "/facet-values/range", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode getFacetValuesRange(@RequestBody FacetInfo facetInfo) {
        return facetSearchManager.getFacetValuesRange(facetInfo);
    }
}
