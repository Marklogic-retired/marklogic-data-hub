package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Controller
@RequestMapping("/api/artifacts/matching")
public class MatchingController extends AbstractArtifactController {
    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<ArrayNode> getArtifacts() {
        return super.getArtifacts();
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> updateArtifact(@PathVariable String artifactName, @RequestBody ObjectNode matchingJson) {
        return super.updateArtifact(artifactName, matchingJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.DELETE)
    public void deleteLoadDataConfig(@PathVariable String artifactName) throws IOException {
        super.deleteArtifact(artifactName);
    }

    @Override
    protected String getArtifactType() {
        return "matching";
    }
}
