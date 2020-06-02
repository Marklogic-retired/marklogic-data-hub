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
package com.marklogic.hub.central.controllers;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.central.managers.EntitySearchManager;
import com.marklogic.hub.central.models.DocSearchQueryInfo;
import com.marklogic.hub.central.models.Document;
import com.marklogic.hub.central.models.SearchQuery;
import com.marklogic.hub.dataservices.EntitySearchService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


@Controller
@RequestMapping(value = "/api/entitySearch")
public class EntitySearchController extends BaseController {

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation("Response is a MarkLogic JSON search response")
    public String search(@RequestBody SearchQuery searchQuery) {
        return newEntitySearchManager().search(searchQuery).get();
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Document> search(@RequestParam String docUri) {
        Optional<Document> optionalContent = newEntitySearchManager().getDocument(docUri);
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
    @ApiImplicitParam(required = true, paramType = "body", dataType = "FacetValuesQuery")
    @ApiOperation(value = "Get an array of strings that match the pattern for the given index", response = FacetValues.class)
    public JsonNode getFacetValues(@RequestBody @ApiParam(hidden = true) JsonNode fsQuery) {
        return getEntitySearchService().getMatchingPropertyValues(fsQuery);
    }

    @RequestMapping(value = "/facet-values/range", method = RequestMethod.POST)
    @ResponseBody
    @ApiImplicitParam(required = true, paramType = "body", dataType = "IndexMinMaxQuery")
    @ApiOperation(value = "Get values for a range index", response = IndexMinMax.class)
    public JsonNode getFacetValuesRange(@RequestBody @ApiParam(hidden = true) JsonNode facetInfo) {
        return getEntitySearchService().getMinAndMaxPropertyValues(facetInfo);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/savedQueries")
    @ResponseBody
    @Secured("ROLE_savedQueryUser")
    @ApiImplicitParam(required = true, paramType = "body", dataType = "SavedQueryRequest")
    @ApiOperation(value = "Create a search query", response = SavedQuery.class)
    public ResponseEntity<JsonNode> saveQueryDocument(@RequestBody @ApiParam(hidden = true) JsonNode queryDocument) {
        return new ResponseEntity<>(getEntitySearchService().saveSavedQuery(queryDocument), HttpStatus.CREATED);
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/savedQueries")
    @ResponseBody
    @Secured("ROLE_savedQueryUser")
    @ApiImplicitParam(required = true, paramType = "body", dataType = "SavedQueryRequest")
    @ApiOperation(value = "Update a search query", response = SavedQuery.class)
    public ResponseEntity<JsonNode> updateQueryDocument(@RequestBody @ApiParam(hidden = true) JsonNode queryDocument) {
        return new ResponseEntity<>(getEntitySearchService().saveSavedQuery(queryDocument), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/savedQueries")
    @ResponseBody
    @ApiOperation(value = "Get all saved queries for the current user", response = SavedQueries.class)
    public ResponseEntity<JsonNode> getQueryDocuments() {
        return new ResponseEntity<>(getEntitySearchService().getSavedQueries(), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/savedQueries/query")
    @ResponseBody
    @ApiOperation(value = "Get a saved query with the given ID", response = SavedQuery.class)
    public ResponseEntity<JsonNode> getQueryDocument(@RequestParam String id) {
        return new ResponseEntity<>(getEntitySearchService().getSavedQuery(id), HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.DELETE, value = "/savedQueries/query")
    @ResponseBody
    @Secured("ROLE_savedQueryUser")
    public ResponseEntity<Void> deleteQueryDocument(@RequestParam String id) {
        getEntitySearchService().deleteSavedQuery(id);
        return new ResponseEntity(HttpStatus.NO_CONTENT);
    }

    /*
     * In order for the browser to download the file using POST, we are sending the request as HTML Form submit.
     * As a result we are accepting the queryDocument json as a string since it will be sent as HTML Form data.
     * https://stackoverflow.com/questions/7563791/is-it-possible-to-download-a-file-with-http-post/46486694#46486694
     */
    @RequestMapping(method = RequestMethod.POST, value = "/export")
    @ResponseBody
    @Secured("ROLE_exportEntityInstances")
    @ApiOperation("Returns CSV data")
    public ResponseEntity<StreamingResponseBody> export(@RequestParam String queryDocument, @RequestParam String fileType, @RequestParam(required = false) Long limit, final HttpServletResponse response) {
        StreamingResponseBody stream = out -> {
            newEntitySearchManager().exportByQuery(new ObjectMapper().readTree(queryDocument), fileType, limit, out, response);
        };

        return ResponseEntity.ok(stream);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/export/query/{queryId}")
    @ResponseBody
    @Secured("ROLE_exportEntityInstances")
    @ApiOperation("Returns CSV data")
    public ResponseEntity<StreamingResponseBody> exportSavedQuery(@PathVariable String queryId, @RequestParam String fileType, @RequestParam(required = false) Long limit, final HttpServletResponse response) {
        StreamingResponseBody stream = out -> {
            newEntitySearchManager().exportById(queryId, fileType, limit, out, response);
        };

        return ResponseEntity.ok(stream);
    }

    private EntitySearchManager newEntitySearchManager() {
        return new EntitySearchManager(getHubClient());
    }

    private EntitySearchService getEntitySearchService() {
        return EntitySearchService.on(getHubClient().getFinalClient());
    }

    public static class FacetValues extends ArrayList<String> {
    }

    public static class FacetValuesQuery {
        public String entityTypeId;
        public String propertyPath;
        public String referenceType;
        public Integer limit;
        public String pattern;
    }

    public static class IndexMinMaxQuery {
        public String entityTypeId;
        public String propertyPath;
        public String referenceType;
    }

    public static class IndexMinMax {
        public String min;
        public String max;
    }

    public static class SavedQueryRequest {
        public String id;
        public String name;
        public String description;
        public DocSearchQueryInfo query;
        public List<String> propertiesToDisplay;
    }

    public static class SavedQuery extends SavedQueryRequest {
        public String owner;
        public Map<String, String> systemMetadata;
    }

    public static class SavedQueries extends ArrayList<SavedQuery> {
    }
}
