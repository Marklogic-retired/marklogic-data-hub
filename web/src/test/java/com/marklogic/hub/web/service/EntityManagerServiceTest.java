/*
 * Copyright 2012-2019 MarkLogic Corporation
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

package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.DocumentPage;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.WebApplication;
import com.marklogic.hub.web.model.FlowModel;
import com.marklogic.hub.web.model.entity_services.EntityModel;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.context.web.WebAppConfiguration;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@WebAppConfiguration
@ContextConfiguration(classes = {WebApplication.class, ApplicationConfig.class, EntityManagerServiceTest.class})
public class EntityManagerServiceTest extends AbstractServiceTest implements InitializingBean {

    private static String ENTITY = "test-entity";
    private static String ENTITY2 = "test-entity2";
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    EntityManagerService entityMgrService;

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    HubConfigImpl hubConfig;

    @BeforeEach
    public void setUp() {
        createProjectDir();
        hubConfig.initHubProject();
        hubConfig.refreshProject();

        try {
            scaffolding.createEntity(ENTITY);
        }
        catch (DataHubProjectException e) {
            // Entity is already present
        }

        Path legacyEntityDir = projectDir.resolve("plugins/entities/" + ENTITY);
        Path entityDir = projectDir.resolve("entities");
        Path inputDir = legacyEntityDir.resolve("input");

        String entityFilename = ENTITY + EntityManagerService.ENTITY_FILE_EXTENSION;
        FileUtil.copy(getResourceStream(entityFilename), entityDir.resolve(entityFilename).toFile());
        installUserModules(getDataHubAdminConfig(), true);

        scaffolding.createLegacyFlow(ENTITY, "sjs-json-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createLegacyFlow(ENTITY, "sjs-xml-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        scaffolding.createLegacyFlow(ENTITY, "xqy-json-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createLegacyFlow(ENTITY, "xqy-xml-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.XML);

        FileUtil.copy(getResourceStream("legacy-flow-manager/sjs-flow/headers.sjs"), inputDir.resolve("sjs-json-input-flow/headers.sjs").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/sjs-flow/content-input.sjs"), inputDir.resolve("sjs-json-input-flow/content.sjs").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/sjs-flow/triples.sjs"), inputDir.resolve("sjs-json-input-flow/triples.sjs").toFile());

        FileUtil.copy(getResourceStream("legacy-flow-manager/sjs-flow/headers.sjs"), inputDir.resolve("sjs-xml-input-flow/headers.sjs").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/sjs-flow/content-input.sjs"), inputDir.resolve("sjs-xml-input-flow/content.sjs").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/sjs-flow/triples.sjs"), inputDir.resolve("sjs-xml-input-flow/triples.sjs").toFile());

        FileUtil.copy(getResourceStream("legacy-flow-manager/xqy-flow/headers-json.xqy"), inputDir.resolve("xqy-json-input-flow/headers.xqy").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/xqy-flow/content-input.xqy"), inputDir.resolve("xqy-json-input-flow/content.xqy").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/xqy-flow/triples.xqy"), inputDir.resolve("xqy-json-input-flow/triples.xqy").toFile());

        FileUtil.copy(getResourceStream("legacy-flow-manager/xqy-flow/headers-xml.xqy"), inputDir.resolve("xqy-xml-input-flow/headers.xqy").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/xqy-flow/content-input.xqy"), inputDir.resolve("xqy-xml-input-flow/content.xqy").toFile());
        FileUtil.copy(getResourceStream("legacy-flow-manager/xqy-flow/triples.xqy"), inputDir.resolve("xqy-xml-input-flow/triples.xqy").toFile());

        installUserModules(getDataHubAdminConfig(), true);
    }

    @AfterEach
    public void teardownProject() {
        clearUserModules();
        deleteProjectDir();
    }


    @Test
    public void getEntities() throws IOException {
        List<EntityModel> entities = entityMgrService.getEntities();

        assertEquals(1, entities.size());
        assertEquals(ENTITY, entities.get(0).getName());
    }

    @Test
    public void saveEntity() throws IOException {
        Path entityDir = projectDir.resolve("entities");
        String entityFilename = ENTITY2 + EntityManagerService.ENTITY_FILE_EXTENSION;

        JsonNode node = getJsonFromResource(entityFilename);

        EntityModel entity = EntityModel.fromJson(entityFilename, node);
        entity.setFilename(entityDir.resolve(entityFilename).toString());

        entityMgrService.saveEntity(entity);

        List<EntityModel> entities = entityMgrService.getEntities();

        assertEquals(2, entities.size());
        List<String> expected = Arrays.asList(ENTITY, ENTITY2);
        List<String> actual = Arrays.asList(entities.get(0).getName(), entities.get(1).getName());
        assertTrue(expected.containsAll(actual));
    }

    @Test
    public void deleteEntity() throws IOException, InterruptedException {
        List<EntityModel> entities = entityMgrService.getEntities();
        assertEquals(1, entities.size());

        entityMgrService.deleteEntity(ENTITY);

        entities = entityMgrService.getEntities();
        assertEquals(0, entities.size());

        // Adding sleep to delete artifacts from the db via async call
        Thread.sleep(1000);

        DocumentPage doc = finalDocMgr.read("/entities/" + ENTITY + ".entity.json");
        assertFalse(doc.hasNext());
        doc = stagingDocMgr.read("/entities/" + ENTITY + ".entity.json");
        assertFalse(doc.hasNext());
    }

    @Test
    public void getEntity() throws IOException {
        EntityModel entity = entityMgrService.getEntity(ENTITY);

        assertEquals(ENTITY, entity.getName());
        assertEquals(4, entity.getInputFlows().size());
        assertEquals(0, entity.getHarmonizeFlows().size());
    }

    @Test
    // this is a behavior change -- returning null sucks.
    public void getNoSuchEntity() throws IOException {
        Assertions.assertThrows(DataHubProjectException.class, () -> {
            EntityModel entity = entityMgrService.getEntity("no-such-entity");
            fail("Fetching no entity should throw exception");
        });
    }

    @Test
    public void getFlow() throws IOException {
        final String FLOW_NAME = "sjs-json-input-flow";
        FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.INPUT, FLOW_NAME);
        assertEquals(ENTITY, flow.entityName);
        assertEquals(FLOW_NAME, flow.flowName);
        assertEquals(FlowType.INPUT, flow.flowType);
    }

    @Test
    public void getNoSuchFlow() throws IOException {
        Assertions.assertThrows(DataHubProjectException.class, () -> {
            final String FLOW_NAME = "no-such-flow";
            FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.INPUT, FLOW_NAME);
            fail("No such flow should throw an error");
        });
    }

    /**
     * Try getting a flow using the name of a valid flow, but requesting using the wrong type.
     * @throws IOException
     */
    @Test
    public void getFlowByWrongType() throws IOException {
        Assertions.assertThrows(DataHubProjectException.class, () -> {
            final String FLOW_NAME = "sjs-json-input-flow";
            FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.HARMONIZE, FLOW_NAME);
            fail("Flow by wrong type should throw an exception");
        });
    }

    /**
     * Addresses https://github.com/marklogic/marklogic-data-hub/issues/558.
     */
    @Test
    public void changeEntityName() throws IOException {
        final String RENAMED_ENTITY = "renamed-entity";

        // Get the original entity
        EntityModel entity = entityMgrService.getEntity(ENTITY);

        // Convert to String and change the title (the UI just changes the title property)
        String strEntity = entity.toJson().toString();
        strEntity = strEntity.replaceFirst("\"title\"\\s*:\\s*\"test-entity\"", "\"title\" : \"" + RENAMED_ENTITY + "\"");
        strEntity = strEntity.replaceFirst("\"test-entity\"\\s*:", "\"" + RENAMED_ENTITY + "\" :");

        // Convert back to JsonNode
        ObjectMapper mapper = new ObjectMapper();
        JsonNode renamed = mapper.readTree(strEntity);
        EntityModel renamedEntity = EntityModel.fromJson(entity.getFilename(), renamed);

        // Save the renamedEntity
        entityMgrService.saveEntity(renamedEntity);

        List<EntityModel> entities = entityMgrService.getEntities();
        assertEquals(1, entities.size());

        // Load the entity, then check the flows to make sure they know the right entity name
        final String FLOW_NAME = "sjs-json-input-flow";
        List<FlowModel> inputFlows = entities.get(0).getInputFlows();
        List<String> flowNameList = inputFlows.stream().map(flow -> flow.flowName).collect(Collectors.toList());

        assertEquals(RENAMED_ENTITY, inputFlows.get(0).entityName);
        assertTrue(flowNameList.contains(FLOW_NAME));
        assertEquals(FlowType.INPUT, inputFlows.get(0).flowType);

        //cleanup.
        entityMgrService.deleteEntity(RENAMED_ENTITY);
        entityMgrService.deleteEntity(ENTITY);
    }

    public void afterPropertiesSet() throws Exception {
        super.afterPropertiesSet();
    }
}
