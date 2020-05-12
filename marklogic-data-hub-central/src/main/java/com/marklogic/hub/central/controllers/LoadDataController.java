package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.central.HubCentral;
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
import java.util.Objects;

@Controller
@RequestMapping("/api/artifacts/loadData")
public class LoadDataController extends AbstractArtifactController {

    @Autowired
    HubCentral hubCentral;

    @RequestMapping(value = "/{artifactName}/setData", method = RequestMethod.POST)
    @ResponseBody
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

    public String getArtifactType() {
        return "loadData";
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

    protected Path dataSetDirectory(String artifactName) {
        return Paths.get(hubCentral.getTemporaryLoadDataDirectory().getAbsolutePath(), artifactName);
    }
}
