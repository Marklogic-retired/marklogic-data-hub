package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/current-project/loadData")
@EnableAsync
public class LoadDataController extends AbstractArtifactController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getArtifacts() {
        return super.getArtifacts();
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> updateArtifact(@PathVariable String artifactName, @RequestBody JsonNode loadDataJson) {
        return super.updateArtifact(artifactName, loadDataJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getArtifact(@PathVariable String artifactName) {
        return super.getArtifact(artifactName);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<JsonNode> deleteLoadDataConfig(@PathVariable String artifactName) {
        return super.deleteArtifact(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/validate", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> validateArtifact(@PathVariable String artifactName, @RequestBody JsonNode loadDataJson) {
        return super.validateArtifact(artifactName, loadDataJson);
    }

    public String getArtifactType() {
        return "loadData";
    }
}
