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

package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.entity_services.EntityModel;
import org.apache.commons.io.FileUtils;
import org.junit.*;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.junit.Assert.fail;

@RunWith(SpringRunner.class)
@SpringBootTest()
public class EntityManagerServiceTest extends AbstractServiceTest {

    private static String ENTITY = "test-entity";
    private static String ENTITY2 = "test-entity2";
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    EntityManagerService entityMgrService;

    @Before
    public void setUp() {
        createProjectDir();

        Scaffolding scaffolding = Scaffolding.create(projectDir.toString(), stagingClient);
        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "sjs-json-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "sjs-xml-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.XML);

        scaffolding.createFlow(ENTITY, "xqy-json-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.JSON);

        scaffolding.createFlow(ENTITY, "xqy-xml-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.XML);

        Path entityDir = projectDir.resolve("plugins/entities/" + ENTITY);
        Path inputDir = entityDir.resolve("input");

        String entityFilename = ENTITY + EntityManagerService.ENTITY_FILE_EXTENSION;
        FileUtil.copy(getResourceStream(entityFilename), entityDir.resolve(entityFilename).toFile());

        FileUtil.copy(getResourceStream("flow-manager/sjs-flow/headers.sjs"), inputDir.resolve("sjs-json-input-flow/headers.sjs").toFile());
        FileUtil.copy(getResourceStream("flow-manager/sjs-flow/content-input.sjs"), inputDir.resolve("sjs-json-input-flow/content.sjs").toFile());
        FileUtil.copy(getResourceStream("flow-manager/sjs-flow/triples.sjs"), inputDir.resolve("sjs-json-input-flow/triples.sjs").toFile());

        FileUtil.copy(getResourceStream("flow-manager/sjs-flow/headers.sjs"), inputDir.resolve("sjs-xml-input-flow/headers.sjs").toFile());
        FileUtil.copy(getResourceStream("flow-manager/sjs-flow/content-input.sjs"), inputDir.resolve("sjs-xml-input-flow/content.sjs").toFile());
        FileUtil.copy(getResourceStream("flow-manager/sjs-flow/triples.sjs"), inputDir.resolve("sjs-xml-input-flow/triples.sjs").toFile());

        FileUtil.copy(getResourceStream("flow-manager/xqy-flow/headers-json.xqy"), inputDir.resolve("xqy-json-input-flow/headers.xqy").toFile());
        FileUtil.copy(getResourceStream("flow-manager/xqy-flow/content-input.xqy"), inputDir.resolve("xqy-json-input-flow/content.xqy").toFile());
        FileUtil.copy(getResourceStream("flow-manager/xqy-flow/triples.xqy"), inputDir.resolve("xqy-json-input-flow/triples.xqy").toFile());

        FileUtil.copy(getResourceStream("flow-manager/xqy-flow/headers-xml.xqy"), inputDir.resolve("xqy-xml-input-flow/headers.xqy").toFile());
        FileUtil.copy(getResourceStream("flow-manager/xqy-flow/content-input.xqy"), inputDir.resolve("xqy-xml-input-flow/content.xqy").toFile());
        FileUtil.copy(getResourceStream("flow-manager/xqy-flow/triples.xqy"), inputDir.resolve("xqy-xml-input-flow/triples.xqy").toFile());

        installUserModules(getHubConfig(), true);
    }

    @Test
    public void getEntities() throws IOException {
        List<EntityModel> entities = entityMgrService.getEntities();

        Assert.assertEquals(1, entities.size());
        Assert.assertEquals(ENTITY, entities.get(0).getName());
    }

    @Test
    public void saveEntity() throws IOException {
        Path entityDir = projectDir.resolve("plugins/entities/" + ENTITY);
        String entityFilename = ENTITY2 + EntityManagerService.ENTITY_FILE_EXTENSION;

        JsonNode node = getJsonFromResource(entityFilename);

        EntityModel entity = EntityModel.fromJson(entityFilename, node);
        entity.setFilename(entityDir.resolve(entityFilename).toString());

        entityMgrService.saveEntity(entity);

        List<EntityModel> entities = entityMgrService.getEntities();

        Assert.assertEquals(2, entities.size());
        String[] expected = {ENTITY, ENTITY2};
        String[] actual = { entities.get(0).getName(), entities.get(1).getName() };
        Assert.assertArrayEquals(expected, actual);
    }

    @Test
    public void getEntity() throws IOException {
        EntityModel entity = entityMgrService.getEntity(ENTITY);

        Assert.assertEquals(ENTITY, entity.getName());
        Assert.assertEquals(4, entity.getInputFlows().size());
        Assert.assertEquals(0, entity.getHarmonizeFlows().size());
    }

    @Test(expected = DataHubProjectException.class)
    // this is a behavior change -- returning null sucks.
    public void getNoSuchEntity() throws IOException {
        EntityModel entity = entityMgrService.getEntity("no-such-entity");
        fail("Fetching no entity should throw exception");
    }

    @Test
    public void getFlow() throws IOException {
        final String FLOW_NAME = "sjs-json-input-flow";
        FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.INPUT, FLOW_NAME);
        Assert.assertEquals(ENTITY, flow.entityName);
        Assert.assertEquals(FLOW_NAME, flow.flowName);
        Assert.assertEquals(FlowType.INPUT, flow.flowType);
    }

    @Test(expected = DataHubProjectException.class)
    public void getNoSuchFlow() throws IOException {
        final String FLOW_NAME = "no-such-flow";
        FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.INPUT, FLOW_NAME);
        fail("No such flow should throw an error");
    }

    /**
     * Try getting a flow using the name of a valid flow, but requesting using the wrong type.
     * @throws IOException
     */
    @Test(expected = DataHubProjectException.class)
    public void getFlowByWrongType() throws IOException {
        final String FLOW_NAME = "sjs-json-input-flow";
        FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.HARMONIZE, FLOW_NAME);
        fail("Flow by wrong type should throw an exception");
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
        Assert.assertEquals(1, entities.size());

        // Load the entity, then check the flows to make sure they know the right entity name
        final String FLOW_NAME = "sjs-json-input-flow";
        List<FlowModel> inputFlows = entities.get(0).getInputFlows();

        Assert.assertEquals(RENAMED_ENTITY, inputFlows.get(0).entityName);
        Assert.assertEquals(FLOW_NAME, inputFlows.get(0).flowName);
        Assert.assertEquals(FlowType.INPUT, inputFlows.get(0).flowType);

        //cleanup.
        entityMgrService.deleteEntity(RENAMED_ENTITY);


    }
}
