package com.marklogic.hub.oneui.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.dataservices.SavedQueriesService;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/api/savedQueries")
public class SavedQueriesController {

    @Autowired
    private HubConfigSession hubConfig;

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> saveQueryDocument(@RequestBody JsonNode queryDocument) {
        return new ResponseEntity<>(getSavedQueriesService().saveSavedQuery(queryDocument), HttpStatus.CREATED);
    }

    @RequestMapping(method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<JsonNode> updateQueryDocument(@RequestBody JsonNode queryDocument) {
        return new ResponseEntity<>(getSavedQueriesService().saveSavedQuery(queryDocument), HttpStatus.OK);
    }

    private SavedQueriesService getSavedQueriesService() {
        return SavedQueriesService.on(hubConfig.newFinalClient());
    }
}
