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
package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.impl.ArtifactManagerImpl;

import java.util.List;

/**
 * Handles writing artifacts to ML server and project directory and reading artifacts from ML server
 */
public interface ArtifactManager {

    /**
     * Gets artifacts of a given type
     *
     * @param artifactType - type of artifact the operation is dealing with
     * @return ObjectNode of the artifacts matching a type
     */
    public ArrayNode getArtifacts(String artifactType);

    /**
     * Updates an artifact of a given type and name.
     *
     * @param artifactType - type of artifact the operation is dealing with
     * @param artifactName - identifier of the artifact
     * @param artifactJson - JSON of artifact to persist
     * @return ObjectNode of the artifact matching a type
     */
    public ObjectNode updateArtifact(String artifactType, String artifactName, JsonNode artifactJson);

    /**
     * Retrieves an artifact of a given type and name.
     *
     * @param artifactType - type of artifact the operation is dealing with
     * @param artifactName - identifier of the artifact
     * @return ObjectNode of the artifact matching a type and name
     */
    public ObjectNode getArtifact(String artifactType, String artifactName);

    /**
     * Deletes an artifact of a given type and name.
     *
     * @param artifactType - type of artifact the operation is dealing with
     * @param artifactName - identifier of the artifact
     */
    public void deleteArtifact(String artifactType, String artifactName);

    /**
     * Provides metadata about the various artifact types
     *
     * @return List&lt;ArtifactTypeInfo&gt; providing information about the various artifact types
     */
    public List<ArtifactTypeInfo> getArtifactTypeInfoList();

    /**
     * Provides metadata about the a given artifact type
     *
     * @param hubClient
     * @return
     */
    static ArtifactManager on(HubClient hubClient) {
        return new ArtifactManagerImpl(hubClient);
    }
}
