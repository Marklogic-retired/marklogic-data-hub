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
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.platform.runner.JUnitPlatform;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@RunWith(JUnitPlatform.class)
@ExtendWith(MockitoExtension.class)
public class ModelManagerTest {
    @Mock
    protected ModelManager modelManager;

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
        ObjectMapper mapper = new ObjectMapper();
        JsonNode expectObj = mapper.readTree(PATIENT_ENTITY_MODEL);
        when(modelManager.getModels()).thenReturn(expectObj);
        JsonNode resultObj = modelManager.getModels();
        assertTrue(expectObj.equals(resultObj));
    }

    @Test
    public void testGetModelByTitle() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonNode = mapper.readTree(PATIENT_ENTITY_MODEL);
        ArrayNode entity = JsonNodeFactory.instance.arrayNode();
        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                if ("Labs".equals(e.get("info").get("title").asText())) {
                    entity.add(e.toString());
                    return;
                }
            });
        }
        when(modelManager.getModel("Labs")).thenReturn(entity);
        JsonNode resultObj = modelManager.getModel("Labs");
        assertTrue(resultObj.size() == 1 && entity.equals(resultObj));
    }

    @Test
    public void testGetModelNoSuchTitle() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode jsonNode = mapper.readTree(PATIENT_ENTITY_MODEL);
        ArrayNode entity = JsonNodeFactory.instance.arrayNode();
        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                if ("Lab".equals(e.get("info").get("title").asText())) {
                    entity.add(e.toString());
                    return;
                }
            });
        }
        when(modelManager.getModel("Lab")).thenReturn(entity);
        JsonNode resultObj = modelManager.getModel("Lab");
        assertTrue(resultObj.size() == 0 && entity.equals(resultObj));
    }
}
