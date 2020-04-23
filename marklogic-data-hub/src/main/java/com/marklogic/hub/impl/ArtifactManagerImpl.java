/*
 * Copyright 2012-2020 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.dataservices.ArtifactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

public class ArtifactManagerImpl implements ArtifactManager {
    protected static final Logger logger = LoggerFactory.getLogger(ArtifactManagerImpl.class);

    private HubConfig hubConfig;

    public ArtifactManagerImpl(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public ArrayNode getArtifacts(String artifactType) {
        return (ArrayNode) getArtifactService().getList(artifactType);
    }

    public ObjectNode updateArtifact(String artifactType, String artifactName, JsonNode artifactJson) {
        return (ObjectNode) getArtifactService().setArtifact(artifactType, artifactName, artifactJson);
    }

    public ObjectNode getArtifact(String artifactType, String artifactName) {
        return (ObjectNode) getArtifactService().getArtifact(artifactType, artifactName);
    }

    public void deleteArtifact(String artifactType, String artifactName) {
        getArtifactService().deleteArtifact(artifactType, artifactName);
    }

    public ObjectNode validateArtifact(String artifactType, String artifactName, JsonNode artifactJson) {
        return (ObjectNode) getArtifactService().validateArtifact(artifactType, artifactName, artifactJson);
    }

    public ObjectNode getArtifactSettings(String artifactType, String artifactName) {
        return (ObjectNode) getArtifactService().getArtifactSettings(artifactType, artifactName);
    }

    public ObjectNode updateArtifactSettings(String artifactType, String artifactName, JsonNode settings) {
        return (ObjectNode) getArtifactService().setArtifactSettings(artifactType, artifactName, settings);
    }

    protected ArtifactService getArtifactService() {
        DatabaseClient dataServicesClient = hubConfig.newStagingClient(null);
        return ArtifactService.on(dataServicesClient);
    }

    public List<ArtifactTypeInfo> getArtifactTypeInfoList() {
        ArrayNode allArtifactTypeInfoArray = (ArrayNode) getArtifactService().getArtifactTypesInfo();
        List<ArtifactTypeInfo> allArtifactTypeInfo = new LinkedList<ArtifactTypeInfo>();
        ObjectMapper objectMapper = new ObjectMapper();
        for (Iterator<JsonNode> it = allArtifactTypeInfoArray.elements(); it.hasNext(); ) {
            try {
                allArtifactTypeInfo.add(objectMapper.readerFor(ArtifactTypeInfo.class).readValue((ObjectNode) it.next()));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return allArtifactTypeInfo;
    }

    public ArtifactTypeInfo getArtifactTypeInfo(String artifactType) {
        ArtifactTypeInfo artifactTypeInfo = null;
        for (ArtifactTypeInfo typeInfo: getArtifactTypeInfoList()) {
            if (typeInfo.getType().equals(artifactType)) {
                artifactTypeInfo = typeInfo;
                break;
            }
        }
        return artifactTypeInfo;
    }
}
