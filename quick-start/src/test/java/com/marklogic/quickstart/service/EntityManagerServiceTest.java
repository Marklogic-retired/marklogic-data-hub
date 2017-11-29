package com.marklogic.quickstart.service;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
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
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    MockHttpServletRequest request;

    @Autowired
    MockHttpSession session;

    @Autowired
    EntityManagerService entityMgrService;

    @BeforeClass
    public static void setupSuite() throws IOException {
        FileUtils.deleteDirectory(projectDir.toFile());

        EnvironmentConfig envConfig = new EnvironmentConfig(projectDir.toString(), "local", "admin", "admin");
        envConfig.setMlSettings(HubConfig.hubFromEnvironment(projectDir.toString(), null));
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

        getDataHub().installUserModules(true);
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
    public void saveEntity() {
    }

    @Test
    public void getEntity() {
    }

    @Test
    public void getFlow() {
    }

}
