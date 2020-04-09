/*
 * Copyright 2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.impl.ArtifactManagerImpl;
import com.marklogic.hub.central.AbstractOneUiTest;
import java.io.IOException;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

public class LoadDataControllerTest extends AbstractOneUiTest {

    @Autowired
    LoadDataController controller;

    static final String LOAD_DATA_SETTINGS = "{\n"
        + "    \"artifactName\" : \"validArtifact\",\n"
        + "    \"additionalCollections\" : [ \"Collection1\", \"Collection2\" ],\n"
        + "    \"targetDatabase\" : \"data-hub-STAGING\",\n"
        + "    \"permissions\" : \"data-hub-load-data-reader,read,data-hub-load-data-writer,update\",\n"
        +"     \"provenanceGranularity\": \"coarse-grained\",\n"
        + "    \"customHook\" : {\n"
        + "          \"module\" : \"\",\n"
        + "          \"parameters\" : \"\",\n"
        + "          \"user\" : \"\",\n"
        + "          \"runBefore\" : false\n"
        + "    }}";

    @Test
    void testLoadDataController() throws IOException {
        controller.updateArtifact("validArtifact", newLoadDataConfig());

        ArrayNode resultList = (ArrayNode) controller.getArtifacts().getBody();

        assertEquals(1, resultList.size(), "List of load data artifacts should now be 1");

        Path artifactProjectLocation = new ArtifactManagerImpl(hubConfig).buildArtifactProjectLocation(controller.getArtifactType(), "validArtifact", null, false);
        ObjectNode resultByName = controller.getArtifact("validArtifact").getBody();
        assertEquals("validArtifact", resultByName.get("name").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("xml", resultByName.get("sourceFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("json", resultByName.get("targetFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertTrue(artifactProjectLocation.toFile().exists(), "File should have been created in the project directory");

        ObjectNode enrichedJson = controller.setData("validArtifact", new MockMultipartFile[]{ new MockMultipartFile("file", "orig", null, "docTest".getBytes())}).getBody();
        assertEquals(1, enrichedJson.get("fileCount").asInt(), "File should be added to data set.");

        controller.deleteArtifact("validArtifact");
        assertFalse(artifactProjectLocation.toFile().exists(), "File should have been deleted from the project directory");

        resultList = (ArrayNode) controller.getArtifacts().getBody();

        assertEquals(0, resultList.size(), "List of load data artifacts should now be 0 after deleting validArtifact");
        assertFalse(controller.dataSetDirectory("validArtifact").toFile().exists(), "Data set directory for validArtifact should no longer exist");

        assertThrows(FailedRequestException.class, () -> controller.getArtifact("validArtifact"));
    }

    @Test
    public void testLoadDataSettings() throws IOException {
        controller.updateArtifact("validArtifact", newLoadDataConfig());

        JsonNode result = controller.getArtifactSettings("validArtifact").getBody();
        // Check for defaults
        assertEquals("validArtifact", result.get("artifactName").asText());
        assertEquals(1, result.get("collections").size());
        assertEquals("default-ingestion", result.get("collections").get(0).asText());

        ObjectMapper mapper = new ObjectMapper();
        JsonNode settings = mapper.readTree(LOAD_DATA_SETTINGS);
        controller.updateArtifactSettings("validArtifact", settings);

        result = controller.getArtifactSettings("validArtifact").getBody();
        assertEquals("validArtifact", result.get("artifactName").asText());
        assertEquals(2, result.get("additionalCollections").size());
        assertEquals("Collection2", result.get("additionalCollections").get(1).asText());
        assertEquals("data-hub-STAGING", result.get("targetDatabase").asText());
        assertTrue(result.has("permissions"), "missing permissions");
        assertTrue(result.has("customHook"), "missing customHook");

        Path artifactSettingFullName = new ArtifactManagerImpl(hubConfig).buildArtifactProjectLocation(controller.getArtifactType(), "validArtifact", null, true);
        assertTrue(artifactSettingFullName.toFile().exists(), "Artifact setting file should have been created in the project directory");

        controller.deleteArtifact("validArtifact");

        assertThrows(FailedRequestException.class, () -> controller.getArtifact("validArtifact"));
        assertFalse(artifactSettingFullName.toFile().exists(), "Artifact setting file should no longer exist");
    }
}
