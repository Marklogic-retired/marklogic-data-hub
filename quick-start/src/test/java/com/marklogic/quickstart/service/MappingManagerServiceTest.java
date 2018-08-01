/*
 * Copyright 2012-2018 MarkLogic Corporation
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

package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.quickstart.model.MappingModel;
import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;

@RunWith(SpringRunner.class)
@SpringBootTest()
public class MappingManagerServiceTest extends AbstractServiceTest {

    private static String ENTITY = "test-entity";

    @Autowired
    MappingManagerService mappingManagerService;

    @Before
    public void setup() {
        deleteProjectDir();

        createProjectDir();
    }

    @After
    public void tearDown() {
        deleteProjectDir();
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
        MappingModel mappingModel = mappingManagerService.getMapping(mappingName);
        Assert.assertEquals(0, mappingModel.getVersion());

        // Second save
        mappingManagerService.saveMapping(mappingName, jsonNode);
        mappingModel = mappingManagerService.getMapping(mappingName);
        Assert.assertEquals(1, mappingModel.getVersion());
    }
}
