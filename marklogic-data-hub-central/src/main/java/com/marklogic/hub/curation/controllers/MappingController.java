package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.dataservices.MappingService;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/artifacts/mapping")
public class MappingController extends AbstractArtifactController {
    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<ArrayNode> getArtifacts() {
        return super.getArtifacts();
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<ObjectNode> getArtifact(@PathVariable String artifactName) {
        return super.getArtifact(artifactName);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> updateArtifact(@PathVariable String artifactName, @RequestBody ObjectNode mappingJson) {
        return super.updateArtifact(artifactName, mappingJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.DELETE)
    public void deleteLoadDataConfig(@PathVariable String artifactName) throws IOException {
        super.deleteArtifact(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/settings", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<ObjectNode> getArtifactSettings(@PathVariable String artifactName) {
        return super.getArtifactSettings(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/settings", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> updateArtifactSettings(@PathVariable String artifactName, @RequestBody ObjectNode settings) {
        return super.updateArtifactSettings(artifactName, settings);
    }

    @Override
    protected String getArtifactType() {
        return "mapping";
    }

    @RequestMapping(value = "/validation", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> testMapping(@RequestBody ObjectNode jsonMapping,
                                                  @RequestParam(value = "uri", required = true) String uri,
                                                  @RequestParam(value = "db", required = true) String database) {
        return new ResponseEntity<>((ObjectNode) getMappingService().testMapping(uri, database, jsonMapping), HttpStatus.OK);
    }

    @RequestMapping(value = "/functions", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<ObjectNode> getMappingFunctions() {
        return  new ResponseEntity<>((ObjectNode) getMappingService().getMappingFunctions(), HttpStatus.OK);
    }

    protected MappingService getMappingService() {
        DatabaseClient dataServicesClient = hubConfig.newStagingClient(null);
        return MappingService.on(dataServicesClient);
    }
}
