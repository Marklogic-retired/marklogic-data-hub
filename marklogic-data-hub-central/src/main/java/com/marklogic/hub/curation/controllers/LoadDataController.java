package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.services.EnvironmentService;
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
    public ResponseEntity<ArrayNode> getArtifacts() {
        ResponseEntity<ArrayNode> resp = super.getArtifacts();
        ArrayNode arrayNode = (ArrayNode) resp.getBody();
        for (Iterator<JsonNode> it = arrayNode.elements(); it.hasNext();) {
            ObjectNode loadConfig = (ObjectNode) it.next();
            enrichLoadData(loadConfig);
        }
        return resp;
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> updateArtifact(@PathVariable String artifactName, @RequestBody ObjectNode loadDataJson) throws IOException {
        // scrub dynamic properties
        loadDataJson.remove("fileCount");
        loadDataJson.remove("filesNeedReuploaded");
        return super.updateArtifact(artifactName, loadDataJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<ObjectNode> getArtifact(@PathVariable String artifactName) {
        ResponseEntity<ObjectNode> resp = super.getArtifact(artifactName);
        enrichLoadData((ObjectNode) Objects.requireNonNull(resp.getBody()));
        return resp;
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.DELETE)
    public void deleteArtifact(@PathVariable String artifactName) throws IOException {
        super.deleteArtifact(artifactName);
        deleteDataSetDirectory(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/validate", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> validateArtifact(@PathVariable String artifactName, @RequestBody JsonNode loadDataJson) {
        return super.validateArtifact(artifactName, loadDataJson);
    }

    @RequestMapping(value = "/{artifactName}/setData", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> setData(@PathVariable String artifactName, @RequestParam("files") MultipartFile[] uploadedFiles) {
        ObjectNode loadDataJson = (ObjectNode) super.getArtifact(artifactName).getBody();
        Path dataSetDirectoryPath = Paths.get(environmentService.getProjectDirectory(), "data-sets", artifactName);
        assert loadDataJson != null;
        loadDataJson.put("inputFilePath", dataSetDirectoryPath.toString());
        File dataSetDirectory = dataSetDirectoryPath.toFile();
        try {
            if (dataSetDirectory.exists()) {
                FileUtils.deleteDirectory(dataSetDirectoryPath.toFile());
            }
            dataSetDirectory.mkdirs();
            for (MultipartFile file : uploadedFiles) {
                Path newFilePath = Paths.get(dataSetDirectoryPath.toString(), file.getOriginalFilename());
                file.transferTo(newFilePath);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        super.updateArtifact(artifactName, loadDataJson);
        enrichLoadData(loadDataJson);
        return new ResponseEntity<>(loadDataJson, HttpStatus.OK);
    }

    @RequestMapping(value = "/{artifactName}/setData", method = RequestMethod.DELETE)
    public ResponseEntity<ObjectNode> deleteData(@PathVariable String artifactName) {
        ObjectNode loadDataJson = (ObjectNode) super.getArtifact(artifactName).getBody();
        assert loadDataJson != null;
        deleteDataSetDirectory(artifactName);
        enrichLoadData(loadDataJson);
        return new ResponseEntity<>(loadDataJson, HttpStatus.OK);
    }

    public String getArtifactType() {
        return "loadData";
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

    protected void enrichLoadData(ObjectNode loadDataConfig) {
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

    private void deleteDataSetDirectory(String artifactName) {
        Path dataSetDirectoryPath = dataSetDirectory(artifactName);
        if (dataSetDirectoryPath.toFile().exists()) {
            try {
                FileUtils.deleteDirectory(dataSetDirectoryPath.toFile());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    protected Path dataSetDirectory(String artifactName) {
        return Paths.get(environmentService.getProjectDirectory(), "data-sets", artifactName);
    }
}
