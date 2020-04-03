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
import com.marklogic.hub.dataservices.EntitySearchService;
import com.marklogic.hub.oneui.managers.EntitySearchManager;
import com.marklogic.hub.oneui.models.Document;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.models.SearchQuery;
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

import java.util.Optional;


@Controller
@RequestMapping(value = "/api/entitySearch")
public class EntitySearchController {

    @Autowired
    private HubConfigSession hubConfig;

    EntitySearchManager entitySearchManager() {
        return new EntitySearchManager(hubConfig);
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public String search(@RequestBody SearchQuery searchQuery) {
        return entitySearchManager().search(searchQuery).get();
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Document> search(@RequestParam String docUri) {
        Optional<Document> optionalContent = entitySearchManager().getDocument(docUri);
        HttpHeaders headers = new HttpHeaders();

        return optionalContent.map(content -> {
            if (content.getContent().startsWith("<")) {
                headers.setContentType(MediaType.APPLICATION_XML);
            }
            else {
                headers.setContentType(MediaType.APPLICATION_JSON);
            }
            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        }).orElse(new ResponseEntity<>(HttpStatus.OK));
    }

    @RequestMapping(value = "/facet-values", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode getFacetValues(@RequestBody JsonNode fsQuery) {
        return getEntitySearchService().getMatchingPropertyValues(fsQuery);
    }

    @RequestMapping(value = "/facet-values/range", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode getFacetValuesRange(@RequestBody JsonNode facetInfo) {
        return getEntitySearchService().getMinAndMaxPropertyValues(facetInfo);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/savedQueries")
    @ResponseBody
    public ResponseEntity<JsonNode> saveQueryDocument(@RequestBody JsonNode queryDocument) {
        return new ResponseEntity<>(getEntitySearchService().saveSavedQuery(queryDocument), HttpStatus.CREATED);
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/savedQueries")
    @ResponseBody
    public ResponseEntity<JsonNode> updateQueryDocument(@RequestBody JsonNode queryDocument) {
        return new ResponseEntity<>(getEntitySearchService().saveSavedQuery(queryDocument), HttpStatus.OK);
    }

    private EntitySearchService getEntitySearchService() {
        return EntitySearchService.on(hubConfig.newFinalClient());
    }
}
