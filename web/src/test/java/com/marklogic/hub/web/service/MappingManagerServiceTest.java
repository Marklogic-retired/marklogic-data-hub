/*
 * Copyright 2012-2019 MarkLogic Corporation
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
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.web.WebApplication;
import com.marklogic.hub.web.model.MappingModel;
import java.io.IOException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class, ApplicationConfig.class, MappingManagerServiceTest.class})
public class MappingManagerServiceTest extends AbstractServiceTest {

    private static String ENTITY = "test-entity";

    @Autowired
    MappingManagerService mappingManagerService;

    @Autowired
    FileSystemWatcherService fileSystemWatcherService;

    @BeforeEach
    public void setup() throws IOException {
        // watcher service is not compatible with this test.
        try {
            fileSystemWatcherService.unwatch(PROJECT_PATH);
        } catch (IOException e) {
            // ignore... might be a problem but probably just a forced delete.
        }
        createProjectDir();
    }

    @AfterEach
    public void tearDown() {
        try {
            fileSystemWatcherService.unwatch(PROJECT_PATH);
            deleteProjectDir();
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
                            "   \"language\":\"zxx\"," +
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
        assertEquals(1, mappingModel.getVersion());
    }

    @Test
    public void testMappingNameWithWhitespace() throws IOException {
        String mappingName = "test mapping";
        String jsonString = "{" +
            "   \"language\":\"zxx\"," +
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
}
