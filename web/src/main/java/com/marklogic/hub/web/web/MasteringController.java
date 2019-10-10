package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.dataservices.MasteringService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mastering")
public class MasteringController {

    @Autowired
    private HubConfig hubConfig;

    @RequestMapping(value = "/defaultCollections/{entityType}", method = RequestMethod.GET)
    public JsonNode getDefaultCollection(@PathVariable String entityType) {
        return MasteringService
            .on(hubConfig.newStagingClient(null))
            .getDefaultCollections(entityType);
    }
}
