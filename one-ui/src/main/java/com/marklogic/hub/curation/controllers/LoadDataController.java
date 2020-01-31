package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Objects;

@Controller
@RequestMapping("/api/artifacts/loadData")
public class LoadDataController extends AbstractArtifactController {
    @Autowired
    private EnvironmentService environmentService;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getArtifacts() {
        ResponseEntity<JsonNode> resp = super.getArtifacts();
        ArrayNode arrayNode = (ArrayNode) resp.getBody();
        for (Iterator<JsonNode> it = arrayNode.elements(); it.hasNext();) {
            ObjectNode loadConfig = (ObjectNode) it.next();
            enrichLoadData(loadConfig);
        }
        return resp;
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> updateArtifact(@PathVariable String artifactName, @RequestBody ObjectNode loadDataJson) {
        // scrub dynamic properties
        loadDataJson.remove("fileCount");
        loadDataJson.remove("filesNeedReuploaded");
        return super.updateArtifact(artifactName, loadDataJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getArtifact(@PathVariable String artifactName) {
        ResponseEntity<JsonNode> resp = super.getArtifact(artifactName);
        enrichLoadData((ObjectNode) Objects.requireNonNull(resp.getBody()));
        return resp;
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

    @RequestMapping(value = "/{artifactName}/setData", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> setData(@PathVariable String artifactName, @RequestParam("files") MultipartFile[] uploadedFiles) throws IOException {
        ObjectNode loadDataJson = (ObjectNode) super.getArtifact(artifactName).getBody();
        Path dataSetDirectoryPath = Paths.get(environmentService.getProjectDirectory(), "data-sets", artifactName);
        assert loadDataJson != null;
        loadDataJson.put("inputFilePath", dataSetDirectoryPath.toString());
        File dataSetDirectory = dataSetDirectoryPath.toFile();
        if (dataSetDirectory.exists()) {
            FileUtils.deleteDirectory(dataSetDirectoryPath.toFile());
        }
        dataSetDirectory.mkdirs();
        for (MultipartFile file:uploadedFiles) {
            Path newFilePath = Paths.get(dataSetDirectoryPath.toString(), file.getOriginalFilename());
            file.transferTo(newFilePath);
        }
        super.updateArtifact(artifactName, loadDataJson);
        enrichLoadData(loadDataJson);
        return new ResponseEntity<>(loadDataJson, HttpStatus.OK);
    }

    @RequestMapping(value = "/{artifactName}/setData", method = RequestMethod.DELETE)
    public ResponseEntity<JsonNode> deleteData(@PathVariable String artifactName) throws IOException {
        ObjectNode loadDataJson = (ObjectNode) super.getArtifact(artifactName).getBody();
        Path dataSetDirectoryPath = Paths.get(environmentService.getProjectDirectory(), "data-sets", artifactName);
        assert loadDataJson != null;
        if (dataSetDirectoryPath.toFile().exists()) {
            FileUtils.deleteDirectory(dataSetDirectoryPath.toFile());
        }
        enrichLoadData(loadDataJson);
        return new ResponseEntity<>(loadDataJson, HttpStatus.OK);
    }

    public String getArtifactType() {
        return "loadData";
    }

    @RequestMapping(value = "/{artifactName}/settings", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getArtifactSettings(@PathVariable String artifactName) {
        ResponseEntity<JsonNode> resp = super.getArtifactSettings(artifactName);
        return resp;
    }

    @RequestMapping(value = "/{artifactName}/settings", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> updateArtifactSettings(@PathVariable String artifactName, @RequestBody ObjectNode settings) {
        return super.updateArtifactSettings(artifactName, settings);
    }

    private void enrichLoadData(ObjectNode loadDataConfig) {
        int fileCount = 0;
        if (loadDataConfig.hasNonNull("inputFilePath")) {
            String inputFilePath = loadDataConfig.get("inputFilePath").asText();
            File inputFilePathDirectory = new File(inputFilePath);
            if (inputFilePathDirectory.exists()) {
                fileCount = Objects.requireNonNull(inputFilePathDirectory.list()).length;
            }
        }
        loadDataConfig.put("fileCount", fileCount);
        loadDataConfig.put("filesNeedReuploaded", fileCount == 0);
    }
}
