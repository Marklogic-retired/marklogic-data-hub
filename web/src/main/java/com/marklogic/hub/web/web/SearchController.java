/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.web.model.SJSSearchQuery;
import com.marklogic.hub.web.model.SearchQuery;
import com.marklogic.hub.web.service.SearchService;
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

@Controller
@RequestMapping(value = "/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

    @Autowired
    private HubConfigImpl hubConfig;

    @Bean
    @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "request")
    SearchService searchService() {
        return new SearchService(hubConfig);
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public String search(@RequestBody SearchQuery searchQuery) throws JsonProcessingException {
        return searchService.search(searchQuery).get();
    }

    @RequestMapping(value = "/sjsSearch", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode sjsSearch(@RequestBody SJSSearchQuery SJSSearchQuery) {
        return searchService.sjsSearch(SJSSearchQuery);
    }

    @RequestMapping(value = "/doc", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<String> getDoc(@RequestParam String database, @RequestParam String docUri) {
        HttpHeaders headers = new HttpHeaders();
        String body = searchService.getDoc(database, docUri);
        if (body.startsWith("<")) {
            headers.setContentType(MediaType.APPLICATION_XML);
        }
        else {
            headers.setContentType(MediaType.APPLICATION_JSON_UTF8);
        }
        return new ResponseEntity<>(body, headers, HttpStatus.OK);
    }
}
