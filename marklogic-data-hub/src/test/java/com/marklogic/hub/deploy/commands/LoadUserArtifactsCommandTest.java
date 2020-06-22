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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.ScaffoldingImpl;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

public class LoadUserArtifactsCommandTest extends AbstractHubCoreTest {

    private LoadUserArtifactsCommand loadUserArtifactsCommand;

    @BeforeEach
    public void setup() {
        loadUserArtifactsCommand = new LoadUserArtifactsCommand(adminHubConfig);
    }

    @Test
    public void replaceLanguageWithLang() {
        ObjectNode object = ObjectMapperFactory.getObjectMapper().createObjectNode();
        object.put("language", "zxx");
        object.put("something", "else");

        object = loadUserArtifactsCommand.replaceLanguageWithLang(object);
        assertEquals("zxx", object.get("lang").asText());
        assertEquals("else", object.get("something").asText());
        assertFalse(object.has("language"));
        assertEquals("lang", object.fieldNames().next(),
            "lang should still be the first field name in the JSON object");
    }

    @Test
    public void testIsEntityDir() {
        Path startPath = Paths.get("/tmp/my-project/plugins/entities");
        Path dir = Paths.get("/tmp/my-project/plugins/entities/my-entity");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/entities");
        dir = Paths.get("/tmp/my-project/plugins/entities/my-entity/input/my-input-flow");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/mappings");
        dir = Paths.get("/tmp/my-project/plugins/mappings/my-mappings/input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("/tmp/my-project/plugins/mappings");
        dir = Paths.get("/tmp/my-project/plugins/mappings/my-mappings");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));


        // test windows paths
        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\entities");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\entities\\my-entity\\input\\my-input-flow");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\mappings");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\mappings\\my-mappings\\path1\\path2");
        assertFalse(loadUserArtifactsCommand.isArtifactDir(dir, startPath));

        startPath = Paths.get("c:\\temp\\my-project\\plugins\\mappings");
        dir = Paths.get("c:\\temp\\my-project\\plugins\\mappings\\my-mappings");
        assertTrue(loadUserArtifactsCommand.isArtifactDir(dir, startPath));
    }

    @Test
    public void defaultEntityModelPermissions() {
        DocumentMetadataHandle.DocumentPermissions perms = loadUserArtifactsCommand.buildMetadata(adminHubConfig.getEntityModelPermissions(), "http://marklogic.com/entity-services/models").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-entity-model-writer").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(adminHubConfig.getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-step-definition-writer").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(adminHubConfig.getFlowPermissions(), "http://marklogic.com/data-hub/flow").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-flow-reader").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(adminHubConfig.getMappingPermissions(), "http://marklogic.com/data-hub/mappings").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-mapping-reader").iterator().next());
    }

    @Test
    public void customEntityModelPermissions() {
        //ensuring that permissions are user configured as opposed to the defaults
        HubConfigImpl config = new HubConfigImpl();
        config.setEntityModelPermissions("manage-user,read,manage-admin,update");
        config.setFlowPermissions("manage-user,read,manage-admin,update");
        config.setMappingPermissions("manage-user,read,manage-admin,update");
        config.setStepDefinitionPermissions("manage-user,read,manage-admin,update");
        DocumentMetadataHandle.DocumentPermissions perms = loadUserArtifactsCommand.buildMetadata(config.getEntityModelPermissions(), "http://marklogic.com/entity-services/models").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-entity-model-writer"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-step-definition-writer"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getFlowPermissions(), "http://marklogic.com/data-hub/flow").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-flow-reader"));

        perms = loadUserArtifactsCommand.buildMetadata(config.getMappingPermissions(), "http://marklogic.com/data-hub/mappings").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("manage-user").iterator().next());
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("manage-admin").iterator().next());
        assertNull(perms.get("data-hub-mapping-reader"));
    }

    @Test
    void scaffoldedIngestionStep() {
        final String stepName = "testIngester";
        final String stepType = "INGESTION"; // use uppercase to verify it gets converted to lowercase

        File file = new ScaffoldingImpl(getHubConfig()).createStepFile(stepName, stepType).getLeft();
        verifyScaffoldedFileDoesntHavePropertiesThatBackendWillSet(file, stepName);

        loadUserArtifactsCommand.loadUserArtifacts();

        JsonNode step = StepService.on(getHubClient().getStagingClient()).getStep(stepType, stepName);
        assertEquals(stepName, step.get("name").asText());
        assertEquals("default-ingestion", step.get("stepDefinitionName").asText());
        assertEquals("ingestion", step.get("stepDefinitionType").asText());
        assertEquals(stepName + "-ingestion", step.get("stepId").asText());
    }

    @Test
    void scaffoldedMappingStep() throws IOException {
        installOnlyReferenceModelEntities();

        final String stepName = "testMapper";
        final String stepType = "MAPPING";

        File file = new ScaffoldingImpl(getHubConfig()).createStepFile(stepName, stepType).getLeft();
        verifyScaffoldedFileDoesntHavePropertiesThatBackendWillSet(file, stepName);

        // Fix targetEntityType so the mapping can be loaded
        ObjectNode fileStep = readJsonObject(file);
        fileStep.put("targetEntityType", "http://example.org/Customer-0.0.1/Customer");
        objectMapper.writeValue(file, fileStep);

        loadUserArtifactsCommand.loadUserArtifacts();

        JsonNode step = StepService.on(getHubClient().getStagingClient()).getStep(stepType, stepName);
        assertEquals(stepName, step.get("name").asText());
        assertEquals("entity-services-mapping", step.get("stepDefinitionName").asText());
        assertEquals("mapping", step.get("stepDefinitionType").asText());
        assertEquals(stepName + "-mapping", step.get("stepId").asText());
    }

    private void verifyScaffoldedFileDoesntHavePropertiesThatBackendWillSet(File file, String stepName) {
        ObjectNode fileStep = readJsonObject(file);
        assertEquals(stepName, fileStep.get("name").asText());
        final String message = "The default scaffolded step shouldn't have stepDefinitionName/stepDefinitionType/stepId " +
            "because those will be populated by the backend when the step is loaded";
        assertFalse(fileStep.has("stepDefinitionName"), message);
        assertFalse(fileStep.has("stepDefinitionType"), message);
        assertFalse(fileStep.has("stepId"), message);
    }
}
