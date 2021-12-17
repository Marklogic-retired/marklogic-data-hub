/*
 * Copyright (c) 2021 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.AppDeployer;
import com.marklogic.appdeployer.impl.SimpleAppDeployer;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.deploy.commands.FinishHubDeploymentCommand;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.HubProjectImpl;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class JobControllerTest extends AbstractMvcTest {

    @Autowired
    JobController jobController;

    private final static String STEP_RESPONSES_PATH = "/api/jobs/stepResponses";
    private final static String GET_MATCHING_VALUES_PATH = "/api/jobs/stepResponses/facetValues";

    private static boolean initialized = false;

    @BeforeEach
    public void setupJobs() {
        resetDatabases();

        // Ensure that TDEs are installed as part as finish deployment.
        if (!initialized) {
            runAsAdmin();
            HubConfig hubConfig = getHubConfig();
            SimpleAppDeployer appDeployer = new SimpleAppDeployer();
            appDeployer.setCommands(Arrays.asList(new FinishHubDeploymentCommand(hubConfig)));
            appDeployer.deploy(hubConfig.getAppConfig());
            initialized = true;
        }
    }

    @Test
    public void testProcessedTargetDatabase() throws JsonProcessingException {
        String jobString = "{\n" +
                "   \"jobId\":\"38c44855-1850-4673-941b-1a73beae8148\",\n" +
                "   \"stepResponses\":{\n" +
                "      \"1\":{\n" +
                "         \"targetDatabase\":\"" + getHubClient().getDbName(DatabaseKind.STAGING) + "\"\n" +
                "      },\n" +
                "      \"2\":{\n" +
                "         \"targetDatabase\":\"" + getHubClient().getDbName(DatabaseKind.FINAL) + "\"\n" +
                "      },\n" +
                "      \"3\":{\n" +
                "         \"targetDatabase\":\"testDatabase\"\n" +
                "      }\n" +
                "   }\n" +
                "}";

        JsonNode jobNode = jobController.processTargetDatabase(objectMapper.readTree(jobString));

        assertEquals("staging", jobNode.path("stepResponses").path("1").path("targetDatabase").asText());
        assertEquals("final", jobNode.path("stepResponses").path("2").path("targetDatabase").asText());
        assertEquals("testDatabase", jobNode.path("stepResponses").path("3").path("targetDatabase").asText());
    }

    @Test
    public void testFindStepResponses() throws Exception {
        String json = "{\n" +
                "  \"start\": 1,\n" +
                "  \"pageLength\": 10\n" +
                "}";
        runAsDataHubDeveloper();
        installReferenceModelProject(true);

        loginAsTestUserWithRoles("hub-central-operator");
        runSuccessfulFlow(new FlowInputs("simpleMapping"));

        postJson(STEP_RESPONSES_PATH, json)
            .andExpect(status().isOk())
            .andDo(result -> {
                ObjectNode response = readJsonObject(result.getResponse().getContentAsString());
                assertNotNull(response);
                assertEquals(1, response.get("total").asInt());
                assertEquals(1, response.get("start").asInt());
                assertEquals(10, response.get("pageLength").asInt());
                assertEquals(1, response.get("results").size());
                assertNotNull(response.get("results").get(0).get("jobId").asText());
            });

        loginAsTestUserWithRoles("hub-central-user");
        verifyRequestIsForbidden(buildJsonPost(STEP_RESPONSES_PATH, json));
    }

    @Test
    public void testGetMatchingPropertyValues() throws Exception {
        String json = "{\n" +
                "  \"facetName\": \"flowName\",\n" +
                "  \"searchTerm\": \"simple\"\n" +
                "}";
        runAsDataHubDeveloper();
        installReferenceModelProject(true);

        loginAsTestUserWithRoles("hub-central-operator");
        runSuccessfulFlow(new FlowInputs("simpleMapping"));

        postJson(GET_MATCHING_VALUES_PATH, json)
                .andExpect(status().isOk())
                .andDo(result -> {
                    ArrayNode response = readJsonArray(result.getResponse().getContentAsString());
                    assertNotNull(response);
                    assertEquals(1, response.size());
                });

        loginAsTestUserWithRoles("hub-central-user");
        verifyRequestIsForbidden(buildJsonPost(GET_MATCHING_VALUES_PATH, json));
    }
}
