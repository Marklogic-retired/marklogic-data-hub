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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.central.AbstractHubCentralTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

public class LoadDataControllerTest extends AbstractHubCentralTest {

    @Autowired
    LoadDataController controller;
    @Autowired
    FlowController flowController;

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
    void testLoadDataController() {
        controller.updateLoadData(newLoadDataConfig(), "validArtifact");

        ArrayNode resultList = controller.getLoadDatas().getBody();

        assertEquals(1, resultList.size(), "List of load data artifacts should now be 1");

        ObjectNode resultByName = controller.getLoadData("validArtifact").getBody();
        assertEquals("validArtifact", resultByName.get("name").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("xml", resultByName.get("sourceFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("json", resultByName.get("targetFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertTrue(resultByName.get("headers").isObject(), "Artifact should have headers set");
        assertEquals("validArtifact", resultByName.get("headers").get("sources").get(0).get("name").asText(), "Artifact should have headers source name default to step name");

        ObjectNode enrichedJson = controller.setData("validArtifact", new MockMultipartFile[]{ new MockMultipartFile("file.json", "orig.json", null, "{\"isTest\": true}".getBytes())}).getBody();
        assertEquals(1, enrichedJson.get("fileCount").asInt(), "File should be added to data set.");

        controller.deleteLoadData("validArtifact");

        resultList = controller.getLoadDatas().getBody();

        assertEquals(0, resultList.size(), "List of load data artifacts should now be 0 after deleting validArtifact");

        assertThrows(FailedRequestException.class, () -> controller.getLoadData("validArtifact"));
    }

    @Test
    public void testLoadDataSettings() {
        controller.updateLoadData(newLoadDataConfig(), "validArtifact");

        JsonNode result = controller.getLoadDataSettings("validArtifact").getBody();
        // Check for defaults
        assertEquals("validArtifact", result.get("artifactName").asText());
        assertEquals(1, result.get("collections").size());
        assertEquals("default-ingestion", result.get("collections").get(0).asText());

        controller.updateLoadDataSettings(readJsonObject(LOAD_DATA_SETTINGS), "validArtifact");

        result = controller.getArtifactSettings("validArtifact").getBody();
        assertEquals("validArtifact", result.get("artifactName").asText());
        assertEquals(2, result.get("additionalCollections").size());
        assertEquals("Collection2", result.get("additionalCollections").get(1).asText());
        assertEquals("data-hub-STAGING", result.get("targetDatabase").asText());
        assertTrue(result.has("permissions"), "missing permissions");
        assertTrue(result.has("customHook"), "missing customHook");

        controller.deleteLoadData("validArtifact");

        assertThrows(FailedRequestException.class, () -> controller.getArtifact("validArtifact"));
    }
}
