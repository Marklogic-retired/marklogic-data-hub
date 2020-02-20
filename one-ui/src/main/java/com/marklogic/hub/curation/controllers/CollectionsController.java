package com.marklogic.hub.curation.controllers;

import com.marklogic.hub.curation.services.CollectionsManager;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping(value = "/api/collections")
public class CollectionsController {

    @Autowired
    private CollectionsManager collectionsService;

    @RequestMapping(value = "/{databaseName}", method = RequestMethod.GET)
    @ResponseBody
    public List<String> getCollections(@PathVariable String databaseName) {
        return collectionsService.getCollections(databaseName);
    }

}
