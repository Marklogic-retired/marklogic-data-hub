package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.impl.ArtifactManagerImpl;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;

public abstract class AbstractArtifactController implements InitializingBean {
    @Autowired
    protected HubConfigSession hubConfig;

    protected ArtifactManager artifactManager;

    protected ResponseEntity<ArrayNode> getArtifacts() {
        return new ResponseEntity<>(artifactManager.getArtifacts(this.getArtifactType()), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> updateArtifact(String artifactName, JsonNode artifactJson) {
        return new ResponseEntity<>(artifactManager.updateArtifact(this.getArtifactType(), artifactName, artifactJson), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> getArtifact(String artifactName) {
        return new ResponseEntity<>(artifactManager.getArtifact(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected void deleteArtifact(String artifactName) throws IOException {
       artifactManager.deleteArtifact(this.getArtifactType(), artifactName);
    }

    protected ResponseEntity<ObjectNode> validateArtifact(String artifactName, JsonNode artifactJson) {
        return new ResponseEntity<>(artifactManager.validateArtifact(this.getArtifactType(), artifactName, artifactJson), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> getArtifactSettings(String artifactName) {
        return new ResponseEntity<>(artifactManager.getArtifactSettings(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected ResponseEntity<ObjectNode> updateArtifactSettings(String artifactName, JsonNode settings) {
        return new ResponseEntity<>(artifactManager.updateArtifactSettings(this.getArtifactType(), artifactName, settings), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> getArtifactSettings(String artifactName) {
        return new ResponseEntity<>(getArtifactService().getArtifactSettings(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> updateArtifactSettings(String artifactName, JsonNode settings) {
        return new ResponseEntity<>(getArtifactService().setArtifactSettings(this.getArtifactType(), artifactName, settings), HttpStatus.OK);
    }

    protected abstract String getArtifactType();

    public void afterPropertiesSet() {
        this.artifactManager = new ArtifactManagerImpl(this.hubConfig);
    }
}
