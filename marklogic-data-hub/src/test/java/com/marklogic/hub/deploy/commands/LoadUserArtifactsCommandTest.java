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
        loadUserArtifactsCommand = new LoadUserArtifactsCommand(getHubConfig());
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
        DocumentMetadataHandle.DocumentPermissions perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getEntityModelPermissions(), "http://marklogic.com/entity-services/models").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-entity-model-writer").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getStepDefinitionPermissions(), "http://marklogic.com/data-hub/step-definition").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.UPDATE, perms.get("data-hub-step-definition-writer").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getFlowPermissions(), "http://marklogic.com/data-hub/flow").getPermissions();
        assertEquals(DocumentMetadataHandle.Capability.READ, perms.get("data-hub-flow-reader").iterator().next());

        perms = loadUserArtifactsCommand.buildMetadata(getHubConfig().getMappingPermissions(), "http://marklogic.com/data-hub/mappings").getPermissions();
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
}
