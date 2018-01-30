package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubConfigBuilder;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.entity_services.EntityModel;
import org.apache.commons.io.FileUtils;
import org.junit.*;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RunWith(SpringRunner.class)
@SpringBootTest()
public class EntityManagerServiceTest extends HubTestBase {

    private static String ENTITY = "test-entity";
    private static String ENTITY2 = "test-entity2";
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    EntityManagerService entityMgrService;

    @BeforeClass
    public static void setupSuite() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());

        EnvironmentConfig envConfig = new EnvironmentConfig(projectDir.toString(), "local", "admin", "admin");
        envConfig.setMlSettings(HubConfigBuilder.newHubConfigBuilder(projectDir.toString()).withPropertiesFromEnvironment().build());
        envConfig.checkIfInstalled();
        setEnvConfig(envConfig);

        installHub();
    }

    private static void setEnvConfig(EnvironmentConfig envConfig) {
        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        authenticationToken.setEnvironmentConfig(envConfig);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Before
    public void setUp() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());

        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);
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

    @AfterClass
    public static void tearDown() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());
        uninstallHub();
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

    @Test public void getNoSuchEntity() throws IOException {
        EntityModel entity = entityMgrService.getEntity("no-such-entity");

        Assert.assertNull(entity);
    }

    @Test
    public void getFlow() throws IOException {
        final String FLOW_NAME = "sjs-json-input-flow";
        FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.INPUT, FLOW_NAME);
        Assert.assertEquals(ENTITY, flow.entityName);
        Assert.assertEquals(FLOW_NAME, flow.flowName);
        Assert.assertEquals(FlowType.INPUT, flow.flowType);
    }

    @Test
    public void getNoSuchFlow() throws IOException {
        final String FLOW_NAME = "no-such-flow";
        FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.INPUT, FLOW_NAME);
        Assert.assertNull(flow);
    }

    /**
     * Try getting a flow using the name of a valid flow, but requesting using the wrong type.
     * @throws IOException
     */
    @Test
    public void getFlowByWrongType() throws IOException {
        final String FLOW_NAME = "sjs-json-input-flow";
        FlowModel flow = entityMgrService.getFlow(ENTITY, FlowType.HARMONIZE, FLOW_NAME);
        Assert.assertNull(flow);
    }

    /**
     * Addresses https://github.com/marklogic-community/marklogic-data-hub/issues/558.
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

    }
}
