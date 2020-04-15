package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.ArtifactManager;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public abstract class AbstractArtifactController extends BaseController {

    protected ResponseEntity<ArrayNode> getArtifacts() {
        return new ResponseEntity<>(newArtifactManager().getArtifacts(this.getArtifactType()), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> updateArtifact(String artifactName, JsonNode artifactJson) {
        return new ResponseEntity<>(newArtifactManager().updateArtifact(this.getArtifactType(), artifactName, artifactJson), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> getArtifact(String artifactName) {
        return new ResponseEntity<>(newArtifactManager().getArtifact(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected void deleteArtifact(String artifactName) throws IOException {
        newArtifactManager().deleteArtifact(this.getArtifactType(), artifactName);
    }

    protected ResponseEntity<ObjectNode> validateArtifact(String artifactName, JsonNode artifactJson) {
        return new ResponseEntity<>(newArtifactManager().validateArtifact(this.getArtifactType(), artifactName, artifactJson), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> getArtifactSettings(String artifactName) {
        return new ResponseEntity<>(newArtifactManager().getArtifactSettings(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> updateArtifactSettings(String artifactName, JsonNode settings) {
        return new ResponseEntity<>(newArtifactManager().updateArtifactSettings(this.getArtifactType(), artifactName, settings), HttpStatus.OK);
    }

    protected abstract String getArtifactType();

    protected ArtifactManager newArtifactManager() {
        return ArtifactManager.on(getHubConfig());
    }
}
