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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
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
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ModelManagerTest {
    @Mock
    DatabaseClientImpl dataServiceClient;

    @Mock
    HubConfig hubConfig;

    @Mock
    protected ModelManager modelManager;

    private static ObjectMapper mapper;

    @BeforeAll
    static void setup() {
        mapper = new ObjectMapper();
    }

    @AfterEach
    void cleanup() {
        ReflectionTestUtils.setField(modelManager, "finalDataServiceClient", null);
    }

    private static final String PATIENT_ENTITY_MODEL = "[\n"
        + "  {\n"
        + "    \"info\": {\n"
        + "      \"title\": \"Admissions\",\n"
        + "      \"version\": \"0.0.1\",\n"
        + "      \"baseUri\": \"http://www.example.org/\"\n"
        + "    },\n"
        + "    \"definitions\": {\n"
        + "      \"Labs\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"name\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"value\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"units\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"datetime\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          }\n"
        + "        }\n"
        + "      },\n"
        + "      \"Admissions\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [\n"
        + "          \"AdmissionID\"\n"
        + "        ],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"AdmissionID\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"startdate\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"enddate\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"labs\": {\n"
        + "            \"datatype\": \"array\",\n"
        + "            \"items\": {\n"
        + "              \"$ref\": \"#/definitions/Labs\"\n"
        + "            }\n"
        + "          },\n"
        + "          \"diagnoses\": {\n"
        + "            \"datatype\": \"array\",\n"
        + "            \"items\": {\n"
        + "              \"$ref\": \"#/definitions/Diagnoses\"\n"
        + "            }\n"
        + "          }\n"
        + "        }\n"
        + "      },\n"
        + "      \"Diagnoses\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"primaryDiagnosisCode\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"primaryDiagnosisDescription\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          }\n"
        + "        }\n"
        + "      }\n"
        + "    }\n"
        + "  },\n"
        + "  {\n"
        + "    \"info\": {\n"
        + "      \"title\": \"Labs\",\n"
        + "      \"version\": \"0.0.1\",\n"
        + "      \"baseUri\": \"http://example.org/\",\n"
        + "      \"description\": \"Labs that were run\"\n"
        + "    },\n"
        + "    \"definitions\": {\n"
        + "      \"Labs\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"name\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"value\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"units\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"datetime\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          }\n"
        + "        }\n"
        + "      }\n"
        + "    }\n"
        + "  },\n"
        + "  {\n"
        + "    \"info\": {\n"
        + "      \"title\": \"Diagnoses\",\n"
        + "      \"version\": \"0.0.1\",\n"
        + "      \"baseUri\": \"http://example.org/\"\n"
        + "    },\n"
        + "    \"definitions\": {\n"
        + "      \"Diagnoses\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"primaryDiagnosisCode\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"primaryDiagnosisDescription\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          }\n"
        + "        }\n"
        + "      }\n"
        + "    }\n"
        + "  },\n"
        + "  {\n"
        + "    \"info\": {\n"
        + "      \"title\": \"Patients\",\n"
        + "      \"version\": \"0.0.1\",\n"
        + "      \"baseUri\": \"http://example.org/\",\n"
        + "      \"description\": \"Patient Model\"\n"
        + "    },\n"
        + "    \"definitions\": {\n"
        + "      \"Labs\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"name\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"value\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"units\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"datetime\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          }\n"
        + "        }\n"
        + "      },\n"
        + "      \"Admissions\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [\n"
        + "          \"AdmissionID\"\n"
        + "        ],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"AdmissionID\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"startdate\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"enddate\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"labs\": {\n"
        + "            \"datatype\": \"array\",\n"
        + "            \"items\": {\n"
        + "              \"$ref\": \"#/definitions/Labs\"\n"
        + "            }\n"
        + "          },\n"
        + "          \"diagnoses\": {\n"
        + "            \"datatype\": \"array\",\n"
        + "            \"items\": {\n"
        + "              \"$ref\": \"#/definitions/Diagnoses\"\n"
        + "            }\n"
        + "          }\n"
        + "        }\n"
        + "      },\n"
        + "      \"Patients\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [\n"
        + "          \"PatientID\"\n"
        + "        ],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"PatientID\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"gender\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"dob\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"race\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"marital-status\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"language\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"percentagebelowpoverty\": {\n"
        + "            \"datatype\": \"decimal\"\n"
        + "          },\n"
        + "          \"admissions\": {\n"
        + "            \"datatype\": \"array\",\n"
        + "            \"items\": {\n"
        + "              \"$ref\": \"#/definitions/Admissions\"\n"
        + "            }\n"
        + "          }\n"
        + "        }\n"
        + "      },\n"
        + "      \"Diagnoses\": {\n"
        + "        \"required\": [],\n"
        + "        \"pii\": [],\n"
        + "        \"elementRangeIndex\": [],\n"
        + "        \"rangeIndex\": [],\n"
        + "        \"wordLexicon\": [],\n"
        + "        \"properties\": {\n"
        + "          \"primaryDiagnosisCode\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          },\n"
        + "          \"primaryDiagnosisDescription\": {\n"
        + "            \"datatype\": \"string\",\n"
        + "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n"
        + "          }\n"
        + "        }\n"
        + "      }\n"
        + "    }\n"
        + "  }\n"
        + "]";

    @Test
    public void testGetModels() throws IOException {
        JsonNode expectObj = mapper.readTree(PATIENT_ENTITY_MODEL);
        when(modelManager.getModels()).thenReturn(expectObj);
        JsonNode resultObj = modelManager.getModels();
        assertEquals(expectObj, resultObj);
    }

    @Test
    public void testGetModelByTitle() throws IOException {
        JsonNode jsonNode = mapper.readTree(PATIENT_ENTITY_MODEL);
        ArrayNode entity = JsonNodeFactory.instance.arrayNode();
        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                if ("Labs".equals(e.get("info").get("title").asText())) {
                    entity.add(e.toString());
                }
            });
        }
        when(modelManager.getModel("Labs")).thenReturn(entity);
        JsonNode resultObj = modelManager.getModel("Labs");
        assertTrue(resultObj.size() == 1 && entity.equals(resultObj));
    }

    @Test
    public void testGetModelNoSuchTitle() throws IOException {
        JsonNode jsonNode = mapper.readTree(PATIENT_ENTITY_MODEL);
        ArrayNode entity = JsonNodeFactory.instance.arrayNode();
        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                if ("Lab".equals(e.get("info").get("title").asText())) {
                    entity.add(e.toString());
                }
            });
        }
        when(modelManager.getModel("Lab")).thenReturn(entity);
        JsonNode resultObj = modelManager.getModel("Lab");
        assertTrue(resultObj.size() == 0 && entity.equals(resultObj));
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
        modelManager = Mockito.spy(new ModelManager(hubConfig));
        ReflectionTestUtils.setField(modelManager, "finalDataServiceClient", dataServiceClient);
        String modelName = "Product";
        doReturn(expectedNode).when(modelManager).getLatestJobData(dataServiceClient, modelName);

        // test
        JsonNode actualNode = modelManager.getLatestJobInfo(modelName);

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
        modelManager = Mockito.spy(new ModelManager(hubConfig));
        ReflectionTestUtils.setField(modelManager, "finalDataServiceClient", dataServiceClient);
        String modelName = "xyz";
        doReturn(expectedNode).when(modelManager).getLatestJobData(dataServiceClient, modelName);

        // test
        JsonNode actualNode = modelManager.getLatestJobInfo(modelName);

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
        modelManager = Mockito.spy(new ModelManager(hubConfig));
        doReturn(productNode).when(modelManager)
            .getLatestJobData(dataServiceClient, "Product");

        String order = "{\n"
            + "        \"modelName\": \"Order\",\n"
            + "        \"jobId\": null,\n"
            + "        \"jobTime\": null\n"
            + "    }";
        JsonNode orderNode = mapper.readTree(order);
        doReturn(orderNode).when(modelManager)
            .getLatestJobData(dataServiceClient, "Order");

        ReflectionTestUtils.setField(modelManager, "finalDataServiceClient", dataServiceClient);

        List<String> modelNameList = new ArrayList<>();
        modelNameList.add("Order");
        modelNameList.add("Product");
        doReturn(modelNameList).when(modelManager).getModelNames();

        // test
        List<JsonNode> actualList = modelManager.getLatestJobInfoForAllModels();
        String actualString = mapper.writeValueAsString(actualList);
        JsonNode actualNode = mapper.readTree(actualString);

        // verify
        assertEquals(expectedNode, actualNode);
    }
}
