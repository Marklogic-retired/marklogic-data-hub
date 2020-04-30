package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.HubCentral;
import com.marklogic.hub.central.schemas.StepSettingsSchema;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiModelProperty;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Objects;

@Controller
@RequestMapping("/api/artifacts/loadData")
public class LoadDataController extends AbstractArtifactController {

    @Autowired
    HubCentral hubCentral;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get all LoadData artifacts", response = LoadDataArtifacts.class)
    public ResponseEntity<ArrayNode> getLoadDatas() {
        ResponseEntity<ArrayNode> resp = super.getArtifacts();
        ArrayNode arrayNode = resp.getBody();
        for (Iterator<JsonNode> it = arrayNode.elements(); it.hasNext();) {
            ObjectNode loadConfig = (ObjectNode) it.next();
            enrichLoadData(loadConfig);
        }
        return resp;
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Update a LoadData", response = LoadDataArtifact.class)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "LoadDataArtifact")
    public ResponseEntity<ObjectNode> updateLoadData(@RequestBody @ApiParam(hidden=true) ObjectNode loadDataJson, @PathVariable String artifactName) {
        // scrub dynamic properties
        loadDataJson.remove("fileCount");
        loadDataJson.remove("filesNeedReuploaded");
        return super.updateArtifact(artifactName, loadDataJson);
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get a LoadData artifact by name", response = LoadDataArtifact.class)
    public ResponseEntity<ObjectNode> getLoadData(@PathVariable String artifactName) {
        ResponseEntity<ObjectNode> resp = super.getArtifact(artifactName);
        enrichLoadData(Objects.requireNonNull(resp.getBody()));
        return resp;
    }

    @RequestMapping(value = "/{artifactName}", method = RequestMethod.DELETE)
    public void deleteLoadData(@PathVariable String artifactName) {
        super.deleteArtifact(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/validate", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Validate a LoadData", response = LoadDataArtifact.class)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "LoadDataArtifact")
    public ResponseEntity<ObjectNode> validateLoadData(@RequestBody JsonNode loadDataJson, @PathVariable String artifactName) {
        return super.validateArtifact(artifactName, loadDataJson);
    }

    @RequestMapping(value = "/{artifactName}/setData", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Associate uploaded files with a LoadData", response = LoadDataArtifact.class)
    public ResponseEntity<ObjectNode> setData(@PathVariable String artifactName, @RequestParam("files") MultipartFile[] uploadedFiles) {
        ObjectNode loadDataJson = super.getArtifact(artifactName).getBody();
        Path dataSetDirectoryPath = dataSetDirectory(artifactName);
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
    @ApiOperation(value = "Delete files associated with the given LoadData name", response = LoadDataArtifact.class)
    public ResponseEntity<ObjectNode> deleteData(@PathVariable String artifactName) {
        ObjectNode loadDataJson = super.getArtifact(artifactName).getBody();
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
    @ApiOperation(value = "Get settings for a LoadData", response = StepSettingsSchema.class)
    public ResponseEntity<ObjectNode> getLoadDataSettings(@PathVariable String artifactName) {
        return super.getArtifactSettings(artifactName);
    }

    @RequestMapping(value = "/{artifactName}/settings", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Update settings for a LoadData", response = StepSettingsSchema.class)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "LoadDataArtifact")
    public ResponseEntity<ObjectNode> updateLoadDataSettings(@RequestBody @ApiParam(hidden=true) ObjectNode settings, @PathVariable String artifactName) {
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
        return Paths.get(hubCentral.getTemporaryLoadDataDirectory().getAbsolutePath(), artifactName);
    }

    public static class LoadDataArtifacts extends ArrayList<LoadDataArtifact> {
    }

    public static class LoadDataArtifact {
        public String name;
        public String description;
        public String lastUpdated;
        @ApiModelProperty(allowableValues = "xml, json, binary, text")
        public String targetFormat;
        @ApiModelProperty(allowableValues = "xml, json, binary, text, csv")
        public String sourceFormat;
        public String separator;
        public String outputURIReplacement;
        public Integer fileCount;
        public String inputFilePath;
    }
}
