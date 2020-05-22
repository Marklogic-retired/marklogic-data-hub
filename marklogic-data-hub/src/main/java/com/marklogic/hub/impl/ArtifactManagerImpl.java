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

import com.fasterxml.jackson.core.util.DefaultIndenter;
import com.fasterxml.jackson.core.util.DefaultPrettyPrinter;
import com.fasterxml.jackson.core.util.Separators;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectWriter;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.ArtifactManager;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.artifact.ArtifactTypeInfo;
import com.marklogic.hub.dataservices.ArtifactService;
import org.apache.commons.io.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.OutputStream;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class ArtifactManagerImpl implements ArtifactManager {
    protected static final Logger logger = LoggerFactory.getLogger(ArtifactManagerImpl.class);

    private HubClient hubClient;

    public ArtifactManagerImpl(HubClient hubClient) {
        this.hubClient = hubClient;
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
        return ArtifactService.on(hubClient.getStagingClient());
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
        for (ArtifactTypeInfo typeInfo : getArtifactTypeInfoList()) {
            if (typeInfo.getType().equals(artifactType)) {
                artifactTypeInfo = typeInfo;
                break;
            }
        }
        return artifactTypeInfo;
    }

    public void writeProjectArtifactsAsZip(OutputStream outputStream) {
        ArrayNode artifacts = (ArrayNode) ArtifactService.on(hubClient.getStagingClient()).getArtifactsWithProjectPaths();

        final ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream);
        final ObjectWriter prettyWriter = buildPrettyWriter();

        try {
            artifacts.forEach(artifact -> {
                ZipEntry entry = new ZipEntry(artifact.get("path").asText());
                try {
                    zipOutputStream.putNextEntry(entry);
                    if (artifact.has("xml")) {
                        byte[] bytes = artifact.get("xml").asText().getBytes();
                        zipOutputStream.write(bytes, 0, bytes.length);
                    } else {
                        byte[] bytes = prettyWriter.writeValueAsString(artifact.get("json")).getBytes();
                        zipOutputStream.write(bytes, 0, bytes.length);
                    }
                    zipOutputStream.closeEntry();
                } catch (IOException ex) {
                    throw new RuntimeException("Unable to download configuration files as a zip, cause: " + ex.getMessage(), ex);
                }
            });
        } finally {
            IOUtils.closeQuietly(zipOutputStream);
        }
    }

    protected ObjectWriter buildPrettyWriter() {
        ObjectMapper prettyMapper = new ObjectMapper();
        prettyMapper.enable(SerializationFeature.INDENT_OUTPUT);
        return prettyMapper.writer(new CustomPrettyPrinter());
    }

    class CustomPrettyPrinter extends DefaultPrettyPrinter {
        @Override
        public DefaultPrettyPrinter withSeparators(Separators separators) {
            _separators = separators;
            // Jackson does " : " by default; ": " is used by qconsole and Intellij, so defaulting to that instead
            _objectFieldValueSeparatorWithSpaces = ": ";
            return this;
        }

        /**
         * Jackson 2.9.x does not require this, and DH core is currently depending on that.
         * But Hub Central uses jackson 2.10.x, and that version of jackson requires this method to be overridden.
         *
         * @return
         */
        @Override
        public DefaultPrettyPrinter createInstance() {
            CustomPrettyPrinter printer = new CustomPrettyPrinter();
            printer.indentArraysWith(DefaultIndenter.SYSTEM_LINEFEED_INSTANCE);
            return printer;
        }
    }
}
