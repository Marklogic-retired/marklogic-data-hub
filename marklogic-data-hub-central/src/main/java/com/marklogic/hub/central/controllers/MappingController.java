package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.central.schemas.StepSettingsSchema;
import com.marklogic.hub.dataservices.MappingService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Map;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiModelProperty;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
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
    @ApiOperation(value = "Get all mapping artifacts", response = MappingArtifacts.class)
    public ResponseEntity<ArrayNode> getMappings() {
        return super.getArtifacts();
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get a single mapping by name", response = MappingArtifact.class)
    public ResponseEntity<ObjectNode> getMapping(@PathVariable String artifactName) {
        return super.getArtifact(artifactName);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    @ApiImplicitParam(required = true, paramType = "body", dataType = "MappingArtifact")
    public ResponseEntity<ObjectNode> updateMapping(@RequestBody @ApiParam(hidden=true) ObjectNode mappingJson, @PathVariable String artifactName) {
        return super.updateArtifact(artifactName, mappingJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.DELETE)
    public void deleteMapping(@PathVariable String artifactName) {
        super.deleteArtifact(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/settings", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get the settings for a mapping", response = StepSettingsSchema.class)
    public ResponseEntity<ObjectNode> getMappingSettings(@PathVariable String artifactName) {
        return super.getArtifactSettings(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/settings", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Updating the settings for a mapping", response = StepSettingsSchema.class)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "StepSettingsSchema")
    public ResponseEntity<ObjectNode> updateMappingSettings(@RequestBody @ApiParam(hidden = true) ObjectNode settings, @PathVariable String artifactName) {
        return super.updateArtifactSettings(artifactName, settings);
    }

    @Override
    protected String getArtifactType() {
        return "mapping";
    }

    @RequestMapping(value = "/validation", method = RequestMethod.POST)
    @ResponseBody
    @ApiImplicitParam(required = true, paramType = "body", dataType = "MappingArtifact")
    @ApiOperation(value = "Test a mapping against a source document", response = MappingArtifact.class)
    public ResponseEntity<ObjectNode> testMapping(@RequestBody @ApiParam(hidden=true) ObjectNode jsonMapping,
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
        return MappingService.on(getHubClient().getStagingClient());
    }

    public static class MappingArtifacts extends ArrayList<MappingArtifact> {
    }

    public static class MappingArtifact {
        public String name;
        public String targetEntityType;
        public String selectedSource;
        public String sourceQuery;
        @ApiModelProperty("Each property object has a name matching that of an entity property and a sourceFrom mapping expression")
        public Map<String, Object> properties;
    }
}
