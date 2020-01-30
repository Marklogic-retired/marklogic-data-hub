package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public abstract class AbstractArtifactController {
    @Autowired
    HubConfigSession hubConfig;
    @Autowired
    EnvironmentService environmentService;

    Map<String, JsonNode> artifactInfoByType = null;

    protected ResponseEntity<JsonNode> getArtifacts() {
        return new ResponseEntity<>(getArtifactService().getList(this.getArtifactType()), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> updateArtifact(String artifactName, JsonNode loadDataJson) throws IOException {
        JsonNode resp = getArtifactService().setArtifact(this.getArtifactType(), artifactName, loadDataJson);
        JsonNode typeInfo = getArtifactTypeInfo(getArtifactType());
        Path localPath = buildLocalArtifactPath(resp.get(typeInfo.get("nameProperty").asText()).asText());
        if (!localPath.getParent().toFile().exists()) {
            localPath.getParent().toFile().mkdirs();
        }
        Files.write(localPath, resp.toPrettyString().getBytes());
        return new ResponseEntity<>(resp, HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> getArtifact(String artifactName) {
        return new ResponseEntity<>(getArtifactService().getArtifact(this.getArtifactType(), artifactName), HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> deleteArtifact(String artifactName) throws IOException {
        JsonNode resp = getArtifactService().deleteArtifact(this.getArtifactType(), artifactName);
        Path localPath = buildLocalArtifactPath(artifactName);
        Files.deleteIfExists(localPath);
        return new ResponseEntity<>(resp, HttpStatus.OK);
    }

    protected ResponseEntity<JsonNode> validateArtifact(String artifactName, JsonNode artifactJson) {
        return new ResponseEntity<>(getArtifactService().validateArtifact(this.getArtifactType(), artifactName, artifactJson), HttpStatus.OK);
    }

    protected ArtifactService getArtifactService() {
        DatabaseClient dataServicesClient = hubConfig.newStagingClient(null);
        return ArtifactService.on(dataServicesClient);
    }

    protected abstract String getArtifactType();

    Path buildLocalArtifactPath(String artifactName) {
        JsonNode typeInfo = getArtifactTypeInfo(getArtifactType());
        return Paths.get(environmentService.getProjectDirectory(), typeInfo.get("directory").asText().replaceAll("/", File.separator), artifactName + typeInfo.get("fileExtension").asText());
    }

    JsonNode getArtifactTypeInfo(String artifactType) {
        if (artifactInfoByType == null) {
            artifactInfoByType = new HashMap<String, JsonNode>();
            JsonNode artifactInfoJson = getArtifactService().getArtifactTypesInfo();
            artifactInfoJson.elements().forEachRemaining((typeInfoJson) -> {
                artifactInfoByType.put(typeInfoJson.get("type").asText(), typeInfoJson);
            });
        }
        return artifactInfoByType.get(artifactType);
    }
}
