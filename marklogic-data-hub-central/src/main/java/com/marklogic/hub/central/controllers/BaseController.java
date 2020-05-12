package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.central.HttpSessionHubClientProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Base controller for all HC controllers. The sole purpose of this controller (so far) is to provide a single point
 * for obtaining a HubClient, such that classes that extend this don't have to worry about how to do that.
 */
public abstract class BaseController {

    @Autowired
    HttpSessionHubClientProvider hubClientProvider;

    protected HubClient getHubClient() {
        return hubClientProvider.getHubClient();
    }

    protected ResponseEntity<Void> emptyOk() {
        return new ResponseEntity<>(HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> jsonCreated(JsonNode createdJson) {
        return new ResponseEntity<>(createdJson, HttpStatus.CREATED);
    }
}
