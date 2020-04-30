package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;

@Controller
@RequestMapping("/api/artifacts/matching")
public class MatchingController extends AbstractArtifactController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get all matching artifacts", response = MatchingArtifacts.class)
    public ResponseEntity<ArrayNode> getMatchings() {
        return super.getArtifacts();
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Update a matching artifact", response = MatchingArtifact.class)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "MatchingArtifact")
    public ResponseEntity<ObjectNode> updateMatching(@RequestBody @ApiParam(hidden=true) ObjectNode matchingJson, @PathVariable String artifactName) {
        return super.updateArtifact(artifactName, matchingJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.DELETE)
    public void deleteMatching(@PathVariable String artifactName) {
        super.deleteArtifact(artifactName);
    }

    @Override
    protected String getArtifactType() {
        return "matching";
    }

    public static class MatchingArtifacts extends ArrayList<MatchingArtifact> {
    }

    public static class MatchingArtifact {
        public String name;
        public String targetEntityType;
        public String selectedSource;
        public String sourceQuery;
    }
}
