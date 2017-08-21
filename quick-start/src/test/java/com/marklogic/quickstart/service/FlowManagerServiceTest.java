package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.MlcpRunner;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.apache.commons.io.FileUtils;
import org.json.JSONException;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.Assert.assertEquals;

@RunWith(SpringRunner.class)
@SpringBootTest()
public class FlowManagerServiceTest extends HubTestBase {

    private static String ENTITY = "test-entity";
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    MockHttpServletRequest request;

    @Autowired
    MockHttpSession session;

    @Autowired
    FlowManagerService fm;

    @BeforeClass
    public static void setup() throws IOException {
        installHub();

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

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        FileUtils.copyFile(getResourceFile("flow-manager/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-json-input-flow/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/sjs-flow/content-input.sjs"), harmonizeDir.resolve("sjs-json-input-flow/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-json-input-flow/triples.sjs").toFile());

        FileUtils.copyFile(getResourceFile("flow-manager/sjs-flow/headers.sjs"), harmonizeDir.resolve("sjs-xml-input-flow/headers.sjs").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/sjs-flow/content-input.sjs"), harmonizeDir.resolve("sjs-xml-input-flow/content.sjs").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/sjs-flow/triples.sjs"), harmonizeDir.resolve("sjs-xml-input-flow/triples.sjs").toFile());

        FileUtils.copyFile(getResourceFile("flow-manager/xqy-flow/headers-json.xqy"), harmonizeDir.resolve("xqy-json-input-flow/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/xqy-flow/content-input.xqy"), harmonizeDir.resolve("xqy-json-input-flow/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-json-input-flow/triples.xqy").toFile());

        FileUtils.copyFile(getResourceFile("flow-manager/xqy-flow/headers-xml.xqy"), harmonizeDir.resolve("xqy-xml-input-flow/headers.xqy").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/xqy-flow/content-input.xqy"), harmonizeDir.resolve("xqy-xml-input-flow/content.xqy").toFile());
        FileUtils.copyFile(getResourceFile("flow-manager/xqy-flow/triples.xqy"), harmonizeDir.resolve("xqy-xml-input-flow/triples.xqy").toFile());

        getDataHub().installUserModules(true);
    }
    private void setEnvConfig(EnvironmentConfig envConfig) {

        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        authenticationToken.setEnvironmentConfig(envConfig);
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Test
    public void getFlowMlcpOptionsFromFileNix() throws Exception {
        String pdir = "/some/crazy/path/to/project";
        EnvironmentConfig envConfig = new EnvironmentConfig(pdir, "local", "admin", "admin");
        envConfig.setMlSettings(new HubConfig(pdir));
        setEnvConfig(envConfig);

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"/some/crazy/path/to/project\" }", options);
    }

    @Test
    public void getFlowMlcpOptionsFromFileWin() throws Exception {
        String pdir = "C:\\some\\crazy\\path\\to\\project";
        EnvironmentConfig envConfig = new EnvironmentConfig(pdir, "local", "admin", "admin");
        envConfig.setMlSettings(new HubConfig(pdir));
        setEnvConfig(envConfig);

        String options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", options);
    }

    @Test
    public void runMlcp() throws IOException, InterruptedException, JSONException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_TRACE_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = "sjs-json-input-flow";

        FlowManager flowManager = new FlowManager(getHubConfig());
        Flow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);

        ObjectMapper objectMapper = new ObjectMapper();
        String inputPath = getResourceFile("flow-manager/input.json").getAbsolutePath();
        String basePath = getResourceFile("flow-manager").getAbsolutePath();
        JsonNode mlcpOptions = objectMapper.readTree(
            "{" +
                "\"input_file_path\":\"" + inputPath + "\"," +
                "\"input_file_type\":\"\\\"documents\\\"\"," +
                "\"output_collections\":\"\\\"" + ENTITY + "\\\"\"," +
                "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                "\"output_uri_replace\":\"\\\"" + basePath + ",''\\\"\"," +
                "\"document_type\":\"\\\"json\\\"\"," +
                "\"transform_module\":\"\\\"/com.marklogic.hub/mlcp-flow-transform.xqy\\\"\"," +
                "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\"," +
                "\"transform_param\":\"\\\"entity=" + ENTITY + ",flow=" + flowName + ",flowType=input\\\"\"" +
                "}");
        FlowStatusListener flowStatusListener = (jobId, percentComplete, message) -> {
            logger.error(message);
        };
        MlcpRunner mlcpRunner = new MlcpRunner("com.marklogic.hub.util.MlcpMain", getHubConfig(), flow, mlcpOptions, flowStatusListener);
        mlcpRunner.start();
        mlcpRunner.join();

        Assert.assertEquals(1, getStagingDocCount());
        String expected = getResource("flow-manager/staged.json");

        String actual = stagingDocMgr.read("/input.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(expected, actual, false);
    }

}
