/*
 * Copyright 2012-2021 MarkLogic Corporation
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
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.StructuredQueryDefinition;
import com.marklogic.hub.central.entities.search.EntitySearchManager;
import com.marklogic.hub.central.entities.search.models.DocSearchQueryInfo;
import com.marklogic.hub.central.entities.search.models.SearchQuery;
import com.marklogic.hub.central.schemas.EntitySearchResponseSchema;
import com.marklogic.hub.dataservices.EntitySearchService;
import com.marklogic.hub.dataservices.GraphService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping(value = "/api/entitySearch")
public class EntitySearchController extends BaseController {

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Response is a MarkLogic JSON search response. Please see ./specs/EntitySearchResponse.schema.json for complete information, as swagger-ui does not capture all the details",
            response = EntitySearchResponseSchema.class)
    public String search(@RequestBody SearchQuery searchQuery, @RequestParam(defaultValue = "final") String database) {
        StringHandle resultHandle = newEntitySearchManager(database).search(searchQuery);
        return resultHandle != null ? resultHandle.get() : "";
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getRecord(@RequestParam String docUri, @RequestParam(defaultValue = "final") String database) {
        return getEntitySearchService(database).getRecord(docUri);
    }

    @RequestMapping(value = "/facet-values", method = RequestMethod.POST)
    @ResponseBody
    @ApiImplicitParam(name = "facetValuesQuery", required = true, paramType = "body", dataTypeClass = FacetValuesQuery.class)
    @ApiOperation(value = "Get an array of strings that match the pattern for the given index", response = FacetValues.class)
    public JsonNode getFacetValues(@RequestBody @ApiParam(name = "facetValuesQuery", hidden = true) JsonNode fsQuery, @RequestParam(defaultValue = "final") String database) {
        return getEntitySearchService(database).getMatchingPropertyValues(fsQuery);
    }

    @RequestMapping(value = "/facet-values/range", method = RequestMethod.POST)
    @ResponseBody
    @ApiImplicitParam(name = "facetInfo", required = true, paramType = "body", dataTypeClass = IndexMinMaxQuery.class)
    @ApiOperation(value = "Get values for a range index", response = IndexMinMax.class)
    public JsonNode getFacetValuesRange(@RequestBody @ApiParam(name = "facetInfo", hidden = true) JsonNode facetInfo, @RequestParam(defaultValue = "final") String database) {
        return getEntitySearchService(database).getMinAndMaxPropertyValues(facetInfo);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/savedQueries")
    @ResponseBody
    @Secured("ROLE_savedQueryUser")
    @ApiImplicitParam(name = "queryDocument", required = true, paramType = "body", dataTypeClass = SavedQueryRequest.class)
    @ApiOperation(value = "Create a search query", response = SavedQuery.class)
    public ResponseEntity<JsonNode> saveQueryDocument(@RequestBody @ApiParam(name = "queryDocument", hidden = true) JsonNode queryDocument) {
        return new ResponseEntity<>(getEntitySearchService().saveSavedQuery(queryDocument), HttpStatus.CREATED);
    }

    @RequestMapping(method = RequestMethod.PUT, value = "/savedQueries")
    @ResponseBody
    @Secured("ROLE_savedQueryUser")
    @ApiImplicitParam(name = "savedQueryRequest", required = true, paramType = "body", dataTypeClass = SavedQueryRequest.class)
    @ApiOperation(value = "Update a search query", response = SavedQuery.class)
    public ResponseEntity<JsonNode> updateQueryDocument(@RequestBody @ApiParam(name = "savedQueryRequest", hidden = true) JsonNode queryDocument) {
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
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
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
    public ResponseEntity<StreamingResponseBody> export(@RequestParam String queryDocument,
                                                        @RequestParam String fileType,
                                                        @RequestParam(required = false) Long limit,
                                                        final HttpServletResponse response,
                                                        @RequestParam(defaultValue = "final") String database) {
        StreamingResponseBody stream = out -> newEntitySearchManager(database).exportByQuery(new ObjectMapper().readTree(queryDocument), fileType, limit, out, response);
        return ResponseEntity.ok(stream);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/export/query/{queryId}")
    @ResponseBody
    @Secured("ROLE_exportEntityInstances")
    @ApiOperation("Returns CSV data")
    public ResponseEntity<StreamingResponseBody> exportSavedQuery(@PathVariable String queryId,
                                                                  @RequestParam String fileType,
                                                                  @RequestParam(required = false) Long limit,
                                                                  final HttpServletResponse response,
                                                                  @RequestParam(defaultValue = "final") String database) {
        StreamingResponseBody stream = out -> newEntitySearchManager(database).exportById(queryId, fileType, limit, out, response);
        return ResponseEntity.ok(stream);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/graph")
    @ResponseBody
    @ApiOperation(value = "Response is a MarkLogic JSON search response. Please see ./specs/EntitySearchResponse.schema.json for complete information, as swagger-ui does not capture all the details",
        response = EntitySearchResponseSchema.class)
    public JsonNode graphSearch(@RequestBody SearchQuery searchQuery, @RequestParam(defaultValue = "final") String database) {
        StructuredQueryDefinition structuredQueryDefinition = newEntitySearchManager(database).graphSearchQuery(searchQuery);
        String structuredQuery = null;
        String queryOptions = null;
        if (structuredQueryDefinition != null) {
            structuredQuery = structuredQueryDefinition.serialize();
            queryOptions =  newEntitySearchManager(database).getQueryOptions();
        }
        ObjectMapper mapper = new ObjectMapper();
        JsonNode searchJsonNode = mapper.convertValue(searchQuery, JsonNode.class);
        return getGraphService(database).searchNodes(searchJsonNode, structuredQuery, queryOptions);
    }

    @RequestMapping(method = RequestMethod.POST, value = "/nodeExpand")
    @ResponseBody
    @ApiOperation(value = "Response is a MarkLogic JSON search response. Please see ./specs/EntitySearchResponse.schema.json for complete information, as swagger-ui does not capture all the details",
        response = EntitySearchResponseSchema.class)
    public JsonNode graphExpand(@RequestBody JsonNode searchQuery, @RequestParam(defaultValue = "final") String database,  @RequestParam(defaultValue = "100") Integer limit) {
        return getGraphService(database).nodeExpand(searchQuery, limit);
    }

    private EntitySearchManager newEntitySearchManager(String database) {
        return new EntitySearchManager(getHubClient(), database);
    }

    private EntitySearchService getEntitySearchService() {
        return getEntitySearchService("final");
    }

    private EntitySearchService getEntitySearchService(String database) {
        if("staging".equalsIgnoreCase(database)) {
            return EntitySearchService.on(getHubClient().getStagingClient());
        }
        return EntitySearchService.on(getHubClient().getFinalClient());
    }

    private GraphService getGraphService(String database) {
        if("staging".equalsIgnoreCase(database)) {
            return GraphService.on(getHubClient().getStagingClient());
        }
        return GraphService.on(getHubClient().getFinalClient());
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

    public static class HubMetadata {
        public String lastProcessedByFlow;
        public String lastProcessedByStep;
        public String lastProcessedDateTime;
        public ArrayList<DocumentSourceMetadata> sources;
    }

    public class DocumentSourceMetadata {
        String name;
    }
}
