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

package com.marklogic.hub.web.web;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.web.WebApplication;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.AutoConfigureJsonTesters;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class, ApplicationConfig.class, HubConfigJsonTest.class, JsonTest.class})
@AutoConfigureJsonTesters
public class HubConfigJsonTest {

    protected static final String PROJECT_PATH = "ye-olde-project";

    @Autowired
    private JacksonTester<HubConfig> json;

    @Autowired
    private HubConfigImpl hubConfig;

    @Test
    public void testSerialize() throws IOException {
        hubConfig.createProject(PROJECT_PATH);
        hubConfig.initHubProject();
        hubConfig.refreshProject();

        hubConfig.setMlUsername("mluser");
        hubConfig.setMlPassword("mlpassword");
        hubConfig.setLoadBalancerHost("somehost");

        String expected = "{\n" +
            "  \"stagingDbName\": \"data-hub-STAGING\",\n" +
            "  \"stagingHttpName\": \"data-hub-STAGING\",\n" +
            "  \"stagingForestsPerHost\": 1,\n" +
            "  \"stagingPort\": 8010,\n" +
            "  \"stagingAuthMethod\": \"digest\",\n" +
            "  \"finalDbName\": \"data-hub-FINAL\",\n" +
            "  \"finalHttpName\": \"data-hub-FINAL\",\n" +
            "  \"finalForestsPerHost\": 1,\n" +
            "  \"finalPort\": 8011,\n" +
            "  \"finalAuthMethod\": \"digest\",\n" +
            "  \"jobDbName\": \"data-hub-JOBS\",\n" +
            "  \"jobHttpName\": \"data-hub-JOBS\",\n" +
            "  \"jobForestsPerHost\": 1,\n" +
            "  \"jobPort\": 8013,\n" +
            "  \"jobAuthMethod\": \"digest\",\n" +
            "  \"modulesDbName\": \"data-hub-MODULES\",\n" +
            "  \"stagingTriggersDbName\": \"data-hub-staging-TRIGGERS\",\n" +
            "  \"stagingSchemasDbName\": \"data-hub-staging-SCHEMAS\",\n" +
            "  \"finalTriggersDbName\": \"data-hub-final-TRIGGERS\",\n" +
            "  \"finalSchemasDbName\": \"data-hub-final-SCHEMAS\",\n" +
            "  \"modulesForestsPerHost\": 1,\n" +
            "  \"stagingTriggersForestsPerHost\": 1,\n" +
            "  \"stagingSchemasForestsPerHost\": 1,\n" +
            "  \"finalTriggersForestsPerHost\": 1,\n" +
            "  \"finalSchemasForestsPerHost\": 1,\n" +
            "  \"flowOperatorRoleName\": \"flow-operator-role\",\n" +
            "  \"flowOperatorUserName\": \"flow-operator\",\n" +
            "  \"customForestPath\": \"forests\",\n" +
            "  \"jarVersion\": \"" + hubConfig.getJarVersion() + "\"\n" +
            "}";

        assertThat(json.write(hubConfig)).isEqualToJson(expected);

        // Verify some fields were not serialized
        JsonNode actualJson = new ObjectMapper().readTree(json.write(hubConfig).getJson());
        assertFalse(actualJson.has("mlUsername"), "mlUsername and mlPassword were previously serialized because they " +
            "had public getters in HubConfigImpl, but this seems like an unintended error, as we wouldn't want to " +
            "serialize passwords out into a JSON string");
        assertFalse(actualJson.has("mlPassword"));
        assertFalse(actualJson.has("loadBalancerHost"), "It is not known why this is JsonIgnore'd, but that was the " +
            "case with HubConfigImpl, so it's expected to be enforced by AbstractHubConfig as well");
    }
}
