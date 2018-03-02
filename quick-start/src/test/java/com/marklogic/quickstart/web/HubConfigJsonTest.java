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

package com.marklogic.quickstart.web;


import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubConfigBuilder;
import com.marklogic.hub.impl.HubConfigImpl;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.io.File;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringJUnit4ClassRunner.class)
@JsonTest
public class HubConfigJsonTest {

    protected static final String PROJECT_PATH = "ye-old-project";

    @Autowired
    private JacksonTester<HubConfig> jsonSerializer;

    @Autowired
    private JacksonTester<HubConfigImpl> jsonDeserializer;

    @Test
    public void testDeserialize() throws IOException {
        // need to escape the backslashes on Windows. On Linux, there won't be any, so the replace will have no effect
        String projectPath = new File(PROJECT_PATH).getAbsolutePath().replace("\\", "\\\\");
        String content = "{\n" +
            "  \"host\": null,\n" +
            "  \"stagingDbName\": \"data-hub-STAGING\",\n" +
            "  \"stagingHttpName\": \"data-hub-STAGING\",\n" +
            "  \"stagingForestsPerHost\": 4,\n" +
            "  \"stagingPort\": 8010,\n" +
            "  \"stagingAuthMethod\": \"digest\",\n" +
            "  \"finalDbName\": \"data-hub-FINAL\",\n" +
            "  \"finalHttpName\": \"data-hub-FINAL\",\n" +
            "  \"finalForestsPerHost\": 4,\n" +
            "  \"finalPort\": 8011,\n" +
            "  \"finalAuthMethod\": \"digest\",\n" +
            "  \"traceDbName\": \"data-hub-TRACING\",\n" +
            "  \"traceHttpName\": \"data-hub-TRACING\",\n" +
            "  \"traceForestsPerHost\": 1,\n" +
            "  \"tracePort\": 8012,\n" +
            "  \"traceAuthMethod\": \"digest\",\n" +
            "  \"jobDbName\": \"data-hub-JOBS\",\n" +
            "  \"jobHttpName\": \"data-hub-JOBS\",\n" +
            "  \"jobForestsPerHost\": 1,\n" +
            "  \"jobPort\": 8013,\n" +
            "  \"jobAuthMethod\": \"digest\",\n" +
            "  \"modulesDbName\": \"data-hub-MODULES\",\n" +
            "  \"triggersDbName\": \"data-hub-TRIGGERS\",\n" +
            "  \"schemasDbName\": \"data-hub-SCHEMAS\",\n" +
            "  \"modulesForestsPerHost\": 1,\n" +
            "  \"triggersForestsPerHost\": 1,\n" +
            "  \"schemasForestsPerHost\": 1,\n" +
            "  \"hubRoleName\": \"data-hub-role\",\n" +
            "  \"hubUserName\": \"data-hub-user\",\n" +
            "  \"customForestPath\": \"forests\",\n" +
            "  \"modulePermissions\": \"rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute\",\n" +
            "  \"projectDir\": \"" + projectPath + "\",\n" +
            "  \"jarVersion\": \"0.1.2\"\n" +
            "}";
        HubConfig expected = HubConfigBuilder.newHubConfigBuilder(PROJECT_PATH).withPropertiesFromEnvironment().build();
        assertThat(this.jsonDeserializer.parseObject(content).getHubPluginsDir()).isEqualTo(expected.getHubPluginsDir());
    }

    @Test
    public void testSerialize() throws IOException {
        // need to escape the backslashes on Windows. On Linux, there won't be any, so the replace will have no effect
        String projectPath = new File(PROJECT_PATH).getAbsolutePath().replace("\\", "\\\\");
        HubConfig hubConfig = HubConfigBuilder.newHubConfigBuilder(PROJECT_PATH).withPropertiesFromEnvironment().build();
        String expected = "{\n" +
            "  \"stagingDbName\": \"data-hub-STAGING\",\n" +
            "  \"stagingHttpName\": \"data-hub-STAGING\",\n" +
            "  \"stagingForestsPerHost\": 4,\n" +
            "  \"stagingPort\": 8010,\n" +
            "  \"stagingAuthMethod\": \"digest\",\n" +
            "  \"finalDbName\": \"data-hub-FINAL\",\n" +
            "  \"finalHttpName\": \"data-hub-FINAL\",\n" +
            "  \"finalForestsPerHost\": 4,\n" +
            "  \"finalPort\": 8011,\n" +
            "  \"finalAuthMethod\": \"digest\",\n" +
            "  \"traceDbName\": \"data-hub-TRACING\",\n" +
            "  \"traceHttpName\": \"data-hub-TRACING\",\n" +
            "  \"traceForestsPerHost\": 1,\n" +
            "  \"tracePort\": 8012,\n" +
            "  \"traceAuthMethod\": \"digest\",\n" +
            "  \"jobDbName\": \"data-hub-JOBS\",\n" +
            "  \"jobHttpName\": \"data-hub-JOBS\",\n" +
            "  \"jobForestsPerHost\": 1,\n" +
            "  \"jobPort\": 8013,\n" +
            "  \"jobAuthMethod\": \"digest\",\n" +
            "  \"modulesDbName\": \"data-hub-MODULES\",\n" +
            "  \"triggersDbName\": \"data-hub-TRIGGERS\",\n" +
            "  \"schemasDbName\": \"data-hub-SCHEMAS\",\n" +
            "  \"modulesForestsPerHost\": 1,\n" +
            "  \"triggersForestsPerHost\": 1,\n" +
            "  \"schemasForestsPerHost\": 1,\n" +
            "  \"hubRoleName\": \"data-hub-role\",\n" +
            "  \"hubUserName\": \"data-hub-user\",\n" +
            "  \"customForestPath\": \"forests\",\n" +
            "  \"modulePermissions\": \"rest-reader,read,rest-writer,insert,rest-writer,update,rest-extension-user,execute\",\n" +
            "  \"projectDir\": \"" + projectPath + "\",\n" +
            "  \"jarVersion\": \"" + hubConfig.getJarVersion() + "\"\n" +
            "}";
        System.out.println(jsonSerializer.write(hubConfig).getJson());
        assertThat(jsonSerializer.write(hubConfig)).isEqualToJson(expected);
    }
}
