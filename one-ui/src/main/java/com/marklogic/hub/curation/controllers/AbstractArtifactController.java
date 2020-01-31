package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public abstract class AbstractArtifactController {
    @Autowired
    HubConfigSession hubConfig;

    protected ResponseEntity<JsonNode> getArtifacts() {
        return new ResponseEntity<>(getArtifactService().getList(this.getArtifactType()), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> updateArtifact(String artifactName, JsonNode loadDataJson) {
        return new ResponseEntity<>(getArtifactService().setArtifact(this.getArtifactType(), artifactName, loadDataJson), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> getArtifact(String artifactName) {
        return new ResponseEntity<>(getArtifactService().getArtifact(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> deleteArtifact(String artifactName) {
        return new ResponseEntity<>(getArtifactService().deleteArtifact(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> validateArtifact(String artifactName, JsonNode artifactJson) {
        return new ResponseEntity<>(getArtifactService().validateArtifact(this.getArtifactType(), artifactName, artifactJson), HttpStatus.OK);
    }

    protected ArtifactService getArtifactService() {
        DatabaseClient dataServicesClient = hubConfig.newStagingClient(null);
        return ArtifactService.on(dataServicesClient);
    }

    protected ResponseEntity<JsonNode> getArtifactSettings(String artifactName) {
        return new ResponseEntity<>(getArtifactService().getArtifactSettings(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> updateArtifactSettings(String artifactName, JsonNode settings) {
        return new ResponseEntity<>(getArtifactService().setArtifactSettings(this.getArtifactType(), artifactName, settings), HttpStatus.OK);
    }

    protected abstract String getArtifactType();
}
