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

import java.io.IOException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.oneui.Application;
import com.marklogic.hub.oneui.TestHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {Application.class, ApplicationConfig.class, LoadDataControllerTest.class})
public class LoadDataControllerTest {
    @Autowired
    LoadDataController controller;

    @Autowired
    TestHelper testHelper;

    JsonNode validLoadDataConfig = new ObjectMapper().readTree("{ \"name\": \"validArtifact\", \"sourceFormat\": \"xml\", \"targetFormat\": \"json\"}");


    static final String LOAD_DATA_SETTINGS = "{\n"
        + "    \"artifactName\" : \"validArtifact\",\n"
        + "    \"additionalCollections\" : [ \"Collection1\", \"Collection2\" ],\n"
        + "    \"targetDatabase\" : \"data-hub-STAGING\",\n"
        + "    \"permissions\" : \"rest-reader,read,rest-writer,update\",\n"
        + "    \"customHook\" : {\n"
        + "          \"module\" : \"\",\n"
        + "          \"parameters\" : { },\n"
        + "          \"user\" : \"\",\n"
        + "          \"runBefore\" : false\n"
        + "    }}";

    public LoadDataControllerTest() throws JsonProcessingException {
    }

    // TODO rework tests to avoid the current dependency on manually adding credentials
    //@Test
    void testLoadDataController() {
        testHelper.authenticateSession();
        controller.updateArtifact("validArtifact", validLoadDataConfig);

        ArrayNode resultList = (ArrayNode) controller.getArtifacts().getBody();

        assertEquals(1, resultList.size(), "List of load data artifacts should now be 1");

        ObjectNode resultByName = (ObjectNode) controller.getArtifact("validArtifact").getBody();
        assertEquals("validArtifact", resultByName.get("name").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("xml", resultByName.get("sourceFormat").asText(), "Getting artifact by name should return object with expected properties");
        assertEquals("json", resultByName.get("targetFormat").asText(), "Getting artifact by name should return object with expected properties");

        ResponseEntity<JsonNode> deleteResp = controller.deleteArtifact("validArtifact");

        assertEquals(HttpStatus.OK, deleteResp.getStatusCode(), "Delete should have been successful");

        resultList = (ArrayNode) controller.getArtifacts().getBody();

        assertEquals(0, resultList.size(), "List of load data artifacts should now be 0 after deleting validArtifact");

        assertThrows(FailedRequestException.class, () -> controller.getArtifact("validArtifact"));
    }

    //@Test
    public void testLoadDataSettings() throws IOException {
        testHelper.authenticateSession();
        controller.updateArtifact("validArtifact", validLoadDataConfig);

        JsonNode result = controller.getArtifactSettings("validArtifact").getBody();
        assertTrue(result.isEmpty(), "No load data settings yet!");

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

        ResponseEntity<JsonNode> deleteResp = controller.deleteArtifact("validArtifact");
        assertEquals(HttpStatus.OK, deleteResp.getStatusCode(), "Delete should have been successful");

        assertTrue(controller.getArtifactSettings("validArtifact").getBody().isEmpty());
        assertThrows(FailedRequestException.class, () -> controller.getArtifact("validArtifact"));
    }

}
