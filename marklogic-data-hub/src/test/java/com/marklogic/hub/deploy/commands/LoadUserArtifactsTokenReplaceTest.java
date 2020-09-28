/*
 * Copyright (c) 2020 MarkLogic Corporation
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
package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class LoadUserArtifactsTokenReplaceTest extends AbstractHubCoreTest {

    @Test
    void verifyTokenReplacement() throws Exception {
        setupEntityModel();
        setupLegacyMapping();
        setupFlow();
        setupStepDefinition();
        setupStep();

        // Manually adding the property for now; when ran via gradle plugin the gradle properties will be loaded by ml-gradle
        getHubConfig().getAppConfig().getCustomTokens().put("%%mlIsProvisionedEnvironment%%", "false");

        new LoadUserArtifactsCommand(getHubConfig()).execute(newCommandContext());

        assertTokenReplacement("/entities/Entity.entity.json");
        assertTokenReplacement("/mappings/LegacyMapping/LegacyMapping.mapping.json");
        assertTokenReplacement("/flows/Flow.flow.json");
        assertTokenReplacement("/step-definitions/mapping/StepDefinition/StepDefinition.step.json");
        assertTokenReplacement("/steps/mapping/Step.step.json");
    }

    private void setupFlow() throws IOException {
        String flow = "{\n" +
                "  \"name\": \"Flow\",\n" +
                "  \"options\": {\n" +
                "    \"mlHost\": \"%%mlHost%%\",\n" +
                "    \"mlIsProvisionedEnvironment\": \"%%mlIsProvisionedEnvironment%%\"\n" +
                "  },\n" +
                "  \"steps\": {\n" +
                "  }\n" +
                "}\n";

        File file = getHubProject().getFlowsDir().resolve("Flow.flow.json").toFile();
        FileCopyUtils.copy(flow.getBytes(), file);
    }

    private void setupStepDefinition() throws IOException {
        String flow = "{\n" +
                "  \"lang\" : \"zxx\",\n" +
                "  \"name\" : \"StepDefinition\",\n" +
                "  \"type\" : \"MAPPING\",\n" +
                "  \"version\" : 1,\n" +
                "  \"options\" : {\n" +
                "    \"mlHost\" : \"%%mlHost%%\",\n" +
                "    \"mlIsProvisionedEnvironment\" : \"%%mlIsProvisionedEnvironment%%\"\n" +
                "  },\n" +
                "  \"customHook\" : { },\n" +
                "  \"modulePath\" : \"/main.sjs\"\n" +
                "}\n";

        File file = getHubProject().getStepDefinitionPath(StepDefinition.StepDefinitionType.MAPPING).resolve("StepDefinition").resolve("StepDefinition.step.json").toFile();
        file.getParentFile().mkdirs();
        FileCopyUtils.copy(flow.getBytes(), file);
    }

    private void setupLegacyMapping() throws IOException {
        String mapping = "{\n" +
                "  \"lang\" : \"zxx\",\n" +
                "  \"name\" : \"LegacyMapping\",\n" +
                "  \"version\" : 0,\n" +
                "  \"targetEntityType\" : \"http://marklogic.com/Entity-0.0.1/Entity\",\n" +
                "  \"sourceContext\" : \"/\",\n" +
                "  \"options\" : {\n" +
                "    \"mlHost\" : \"%%mlHost%%\",\n" +
                "    \"mlIsProvisionedEnvironment\" : \"%%mlIsProvisionedEnvironment%%\"\n" +
                "  },\n" +
                "  \"properties\" : { }\n" +
                "}\n";

        File file = getHubProject().getHubMappingsDir().resolve("LegacyMapping").resolve("LegacyMapping.mapping.json").toFile();
        file.getParentFile().mkdirs();
        FileCopyUtils.copy(mapping.getBytes(), file);
    }

    private void setupStep() throws IOException {
        String step = "{\n" +
                "  \"lang\": \"zxx\",\n" +
                "  \"name\": \"Step\",\n" +
                "  \"version\": 1,\n" +
                "  \"targetEntityType\": \"Entity\",\n" +
                "  \"sourceContext\": \"/\",\n" +
                "  \"selectedSource\": \"collection\",\n" +
                "  \"options\": {\n" +
                "    \"mlHost\": \"%%mlHost%%\",\n" +
                "    \"mlIsProvisionedEnvironment\": \"%%mlIsProvisionedEnvironment%%\"\n" +
                "  },\n" +
                "  \"properties\": { }\n" +
                "}";

        File file = getHubProject().getStepsPath(StepDefinition.StepDefinitionType.MAPPING).resolve("Step.step.json").toFile();
        file.getParentFile().mkdirs();
        FileCopyUtils.copy(step.getBytes(), file);
    }

    private void setupEntityModel() throws IOException {
        String model = "{\n" +
                "  \"info\": {\n" +
                "    \"title\": \"Entity\",\n" +
                "    \"version\": \"0.0.1\",\n" +
                "    \"baseUri\": \"http://marklogic.com/\"\n" +
                "  },\n" +
                "  \"options\": {\n" +
                "    \"mlHost\": \"%%mlHost%%\",\n" +
                "    \"mlIsProvisionedEnvironment\": \"%%mlIsProvisionedEnvironment%%\"\n" +
                "  },\n" +
                "  \"definitions\": {\n" +
                "    \"Entity\": {\n" +
                "      \"properties\": {\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "}";

        File file = getHubProject().getHubEntitiesDir().resolve("Entity.entity.json").toFile();
        FileCopyUtils.copy(model.getBytes(), file);
    }


    private void assertTokenReplacement(String uri) {
        String mlHost = getHubConfig().getAppConfig().getCustomTokens().get("%%mlHost%%");
        String mlIsProvisionedEnvironment = getHubConfig().getAppConfig().getCustomTokens().get("%%mlIsProvisionedEnvironment%%");

        assertEquals(mlHost, getStagingDoc(uri).get("options").get("mlHost").asText());
        assertEquals(mlHost, getFinalDoc(uri).get("options").get("mlHost").asText());
        assertEquals(mlIsProvisionedEnvironment, getStagingDoc(uri).get("options").get("mlIsProvisionedEnvironment").asText());
        assertEquals(mlIsProvisionedEnvironment, getFinalDoc(uri).get("options").get("mlIsProvisionedEnvironment").asText());
    }
}
