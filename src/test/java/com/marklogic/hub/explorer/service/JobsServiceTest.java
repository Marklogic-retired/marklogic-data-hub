/* Copyright 2019 MarkLogic Corporation. All rights reserved. */
package com.marklogic.hub.explorer.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import com.marklogic.client.impl.DatabaseClientImpl;
import com.marklogic.hub.explorer.util.DatabaseClientHolder;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SuppressWarnings("ResultOfMethodCallIgnored")
@ExtendWith(MockitoExtension.class)
class JobsServiceTest {

  @Mock
  DatabaseClientImpl dataServiceClient;

  @Mock
  DatabaseClientHolder dbClientHolder;

  @Mock
  ModelService modelService;

  @Spy
  JobsService jobsService;

  private static ObjectMapper mapper;

  @BeforeAll
  static void setup() {
    mapper = new ObjectMapper();
  }

  @AfterEach
  void cleanup() {
    ReflectionTestUtils.setField(jobsService, "dbClientHolder", null);
    ReflectionTestUtils.setField(jobsService, "modelService", null);
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
    ReflectionTestUtils.setField(jobsService, "dbClientHolder", dbClientHolder);
    when(dbClientHolder.getDataServiceClient()).thenReturn(dataServiceClient);
    String modelName = "Product";
    doReturn(expectedNode).when(jobsService).getJobInfoFromDB(dataServiceClient, modelName);

    // test
    JsonNode actualNode = jobsService.getLatestJobInfo(modelName);

    // verify
    verify(dbClientHolder).getDataServiceClient();
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
    ReflectionTestUtils.setField(jobsService, "dbClientHolder", dbClientHolder);
    when(dbClientHolder.getDataServiceClient()).thenReturn(dataServiceClient);
    String modelName = "xyz";
    doReturn(expectedNode).when(jobsService).getJobInfoFromDB(dataServiceClient, modelName);

    // test
    JsonNode actualNode = jobsService.getLatestJobInfo(modelName);

    // verify
    verify(dbClientHolder).getDataServiceClient();
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
    doReturn(productNode).when(jobsService)
        .getJobInfoFromDB(dataServiceClient, "Product");

    String order = "{\n"
        + "        \"modelName\": \"Order\",\n"
        + "        \"jobId\": null,\n"
        + "        \"jobTime\": null\n"
        + "    }";
    JsonNode orderNode = mapper.readTree(order);
    doReturn(orderNode).when(jobsService)
        .getJobInfoFromDB(dataServiceClient, "Order");

    ReflectionTestUtils.setField(jobsService, "dbClientHolder", dbClientHolder);
    when(dbClientHolder.getDataServiceClient()).thenReturn(dataServiceClient);

    List<String> modelNameList = new ArrayList<>();
    modelNameList.add("Order");
    modelNameList.add("Product");
    ReflectionTestUtils.setField(jobsService, "modelService", modelService);
    when(modelService.getModelNames()).thenReturn(modelNameList);

    // test
    List<JsonNode> actualList = jobsService.getLatestJobInfoForAllModels();
    String actualString = mapper.writeValueAsString(actualList);
    JsonNode actualNode = mapper.readTree(actualString);

    // verify
    verify(dbClientHolder).getDataServiceClient();
    assertEquals(expectedNode, actualNode);
  }
}
