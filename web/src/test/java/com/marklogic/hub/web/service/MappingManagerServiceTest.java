/*
 * Copyright (c) 2020 MarkLogic Corporation
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

package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.web.AbstractWebTest;
import com.marklogic.hub.web.model.MappingModel;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class MappingManagerServiceTest extends AbstractWebTest {

    private static String ENTITY = "test-entity";

    @Autowired
    MappingManagerService mappingManagerService;

    @Autowired
    FileSystemWatcherService fileSystemWatcherService;

    @BeforeEach
    public void setup() throws IOException {
        // watcher service is not compatible with this test.
        try {
            fileSystemWatcherService.unwatch(getHubProject().getProjectDirString());
        } catch (IOException e) {
            // ignore... might be a problem but probably just a forced delete.
        }
    }

    @AfterEach
    public void tearDown() {
        try {
            fileSystemWatcherService.unwatch(getHubProject().getProjectDirString());
        } catch (Exception e) {
            // ignore... might be a problem but probably just trying to delete
            // from under an unstopped service.
        }
    }

    @Test
    public void testCreateDefaultMapping() throws IOException {
        String mappingName = "testDefaultMapping";

        // create if not existed
        MappingModel mappingModel = mappingManagerService.getMapping(mappingName, true);
        assertEquals(1, mappingModel.getVersion());

        // Second save
        mappingManagerService.saveMapping(mappingName, mappingModel.toJson());
        mappingModel = mappingManagerService.getMapping(mappingName, false);
        assertEquals(1, mappingModel.getVersion());
    }

    @Test
    public void testMappingVersion() throws IOException {
        String mappingName = "testMapping";
        String jsonString = "{" +
            "   \"lang\":\"zxx\"," +
            "   \"name\":\"" + mappingName + "\"," +
            "   \"description\":\"\"," +
            "   \"version\":\"0\"," +
            "   \"targetEntityType\":\"http://example.org/" + ENTITY + "-0.0.1/" + ENTITY + "\"," +
            "   \"sourceContext\":\"\"," +
            "   \"sourceURI\":\"\"," +
            "   \"properties\":{}" +
            "}";

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(jsonString);

        // First Save
        mappingManagerService.saveMapping(mappingName, jsonNode);
        MappingModel mappingModel = mappingManagerService.getMapping(mappingName, false);
        assertEquals(0, mappingModel.getVersion());

        // Second save
        mappingManagerService.saveMapping(mappingName, jsonNode);
        mappingModel = mappingManagerService.getMapping(mappingName, false);
        assertEquals(0, mappingModel.getVersion());

        ((ObjectNode) jsonNode).put("description", "someinfo");
        mappingManagerService.saveMapping(mappingName, jsonNode);
        mappingModel = mappingManagerService.getMapping(mappingName, false);
        assertEquals(0, mappingModel.getVersion(),
            "Per DHFPROD-3730, the mapping version is no longer auto-incremented. The expectation is that a user will " +
                "choose when to change the mapping version. Thus, the version number should still be zero.");
    }

    @Test
    public void testMappingNameWithWhitespace() throws IOException {
        String mappingName = "test mapping";
        String jsonString = "{" +
            "   \"lang\":\"zxx\"," +
            "   \"name\":\"" + mappingName + "\"," +
            "   \"description\":\"\"," +
            "   \"version\":\"0\"," +
            "   \"targetEntityType\":\"http://example.org/" + ENTITY + "-0.0.1/" + ENTITY + "\"," +
            "   \"sourceContext\":\"\"," +
            "   \"sourceURI\":\"\"," +
            "   \"properties\":{}" +
            "}";

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(jsonString);

        assertNotNull(mappingManagerService.saveMapping(mappingName, jsonNode));
    }

    @Test
    public void testMappingWithNamespaces() throws IOException {
        String mappingName = "test namespace mapping";
        String jsonString = "{" +
            "   \"lang\":\"zxx\"," +
            "   \"name\":\"" + mappingName + "\"," +
            "   \"description\":\"\"," +
            "   \"version\":\"0\"," +
            "   \"targetEntityType\":\"http://example.org/" + ENTITY + "-0.0.1/" + ENTITY + "\"," +
            "   \"sourceContext\":\"\"," +
            "   \"sourceURI\":\"\"," +
            "   \"namespaces\":{ \"ns1\": \"http://marklogic.com/ns1\"}," +
            "   \"properties\":{}" +
            "}";

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(jsonString);

        assertNotNull(mappingManagerService.saveMapping(mappingName, jsonNode));

        MappingModel mappingModel = mappingManagerService.getMapping(mappingName, false);
        assertEquals("http://marklogic.com/ns1", mappingModel.getNamespaces().get("ns1").asText());
    }
}
