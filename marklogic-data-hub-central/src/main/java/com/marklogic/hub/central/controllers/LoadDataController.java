package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.central.HubCentral;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@Controller
@RequestMapping("/api/artifacts/loadData")
public class LoadDataController extends AbstractArtifactController {

    @Autowired
    HubCentral hubCentral;

    @RequestMapping(value = "/{artifactName}/setData", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<ObjectNode> setData(@PathVariable String artifactName, @RequestParam("files") MultipartFile[] uploadedFiles) {
        ObjectNode loadDataJson = super.getArtifact(artifactName).getBody();
        assert loadDataJson != null;
        super.updateArtifact(artifactName, loadDataJson);
        return new ResponseEntity<>(loadDataJson, HttpStatus.OK);
    }

    public String getArtifactType() {
        return "ingestion";
    }

}
