/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.managers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.impl.DatabaseClientImpl;
import com.marklogic.hub.HubConfig;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobsManagerTest {

    @Mock
    DatabaseClientImpl dataServiceClient;

    @Mock
    HubConfig hubConfig;

    @Mock
    ModelManager modelManager;

    JobsManager jobsManager;

    private static ObjectMapper mapper;

    @BeforeAll
    static void setup() {
        mapper = new ObjectMapper();
    }

    @AfterEach
    void cleanup() {
        ReflectionTestUtils.setField(jobsManager, "finalDataServiceClient", null);
        ReflectionTestUtils.setField(jobsManager, "modelManager", null);
    }


    @Test
    void testLatestJobInfoForModel() throws IOException {
        // setup
        String resp = "{\n"
            + "        \"modelName\": \"Product\",\n"
            + "        \"jobId\": \"ab6cb392-2f9c-40ce-bd83-b15a62b6aa84\",\n"
            + "        \"jobTime\": \"2019-09-27T13:08:11.467812-07:00\"\n"
            + "    }";
        JsonNode expectedNode = mapper.readTree(resp);
        jobsManager = Mockito.spy(new JobsManager(hubConfig, modelManager));
        ReflectionTestUtils.setField(jobsManager, "finalDataServiceClient", dataServiceClient);
        String modelName = "Product";
        doReturn(expectedNode).when(jobsManager).getJobInfoFromDB(dataServiceClient, modelName);

        // test
        JsonNode actualNode = jobsManager.getLatestJobInfo(modelName);

        // verify
        assertEquals(expectedNode, actualNode);
    }

    @Test
    void testLatestJobInfoForNonExistentModel() throws IOException {
        // setup
        String resp = "{\n"
            + "        \"modelName\": \"xyz\",\n"
            + "        \"jobId\": null,\n"
            + "        \"jobTime\": null\n"
            + "    }";
        JsonNode expectedNode = mapper.readTree(resp);
        jobsManager = Mockito.spy(new JobsManager(hubConfig, modelManager));
        ReflectionTestUtils.setField(jobsManager, "finalDataServiceClient", dataServiceClient);
        String modelName = "xyz";
        doReturn(expectedNode).when(jobsManager).getJobInfoFromDB(dataServiceClient, modelName);

        // test
        JsonNode actualNode = jobsManager.getLatestJobInfo(modelName);

        // verify
        assertEquals(expectedNode, actualNode);
    }

    @Test
    void testLatestJobInfoForAllModels() throws IOException {
        // setup
        String resp = "[\n"
            + "    {\n"
            + "        \"modelName\": \"Order\",\n"
            + "        \"jobId\": null,\n"
            + "        \"jobTime\": null\n"
            + "    },\n"
            + "    {\n"
            + "        \"modelName\": \"Product\",\n"
            + "        \"jobId\": \"ab6cb392-2f9c-40ce-bd83-b15a62b6aa84\",\n"
            + "        \"jobTime\": \"2019-09-27T13:08:11.467812-07:00\"\n"
            + "    }\n"
            + "]";
        JsonNode expectedNode = mapper.readTree(resp);

        String product = "{\n"
            + "        \"modelName\": \"Product\",\n"
            + "        \"jobId\": \"ab6cb392-2f9c-40ce-bd83-b15a62b6aa84\",\n"
            + "        \"jobTime\": \"2019-09-27T13:08:11.467812-07:00\"\n"
            + "    }";
        JsonNode productNode = mapper.readTree(product);
        jobsManager = Mockito.spy(new JobsManager(hubConfig, modelManager));
        doReturn(productNode).when(jobsManager)
            .getJobInfoFromDB(dataServiceClient, "Product");

        String order = "{\n"
            + "        \"modelName\": \"Order\",\n"
            + "        \"jobId\": null,\n"
            + "        \"jobTime\": null\n"
            + "    }";
        JsonNode orderNode = mapper.readTree(order);
        doReturn(orderNode).when(jobsManager)
            .getJobInfoFromDB(dataServiceClient, "Order");

        ReflectionTestUtils.setField(jobsManager, "finalDataServiceClient", dataServiceClient);

        List<String> modelNameList = new ArrayList<>();
        modelNameList.add("Order");
        modelNameList.add("Product");
        ReflectionTestUtils.setField(jobsManager, "modelManager", modelManager);
        when(modelManager.getModelNames()).thenReturn(modelNameList);

        // test
        List<JsonNode> actualList = jobsManager.getLatestJobInfoForAllModels();
        String actualString = mapper.writeValueAsString(actualList);
        JsonNode actualNode = mapper.readTree(actualString);

        // verify
        assertEquals(expectedNode, actualNode);
    }
}
