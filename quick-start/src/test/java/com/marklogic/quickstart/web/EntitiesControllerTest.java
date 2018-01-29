package com.marklogic.quickstart.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubConfigBuilder;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.quickstart.model.EnvironmentConfig;
import org.junit.Assert;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest
@WebAppConfiguration
public class EntitiesControllerTest extends BaseTestController {

    private static String ENTITY = "test-entity";

    @Autowired
    private EntitiesController ec;

    @Test
    public void getInputFlowOptions() throws Exception {
        String path = "/some/project/path";
        envConfig.setInitialized(true);
        envConfig.setProjectDir(path);
        envConfig.setMlSettings(HubConfigBuilder.newHubConfigBuilder(path).withPropertiesFromEnvironment().build());
        Map<String, Object> options = ec.getInputFlowOptions("test-entity", "flow-name");
        JSONAssert.assertEquals("{ \"input_file_path\": \"/some/project/path\" }", new ObjectMapper().writeValueAsString(options), true);
    }

    @Test
    public void getInputFlowOptionsWin() throws Exception {
        String path = "C:\\some\\crazy\\path\\to\\project";

        envConfig.setInitialized(true);
        envConfig.setProjectDir(path);
        envConfig.setMlSettings(HubConfigBuilder.newHubConfigBuilder(path).withPropertiesFromEnvironment().build());
        Map<String, Object> options = ec.getInputFlowOptions("test-entity", "flow-name");
        JSONAssert.assertEquals("{ \"input_file_path\": \"C:\\\\some\\\\crazy\\\\path\\\\to\\\\project\" }", new ObjectMapper().writeValueAsString(options), true);
    }

    @Test
    public void runHarmonizeNoOptions() throws IOException, InterruptedException {
        // Set up (not needed for other tests)
        baseSetUp();
        installHub();

        Path projectDir = Paths.get(".", PROJECT_PATH);
        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);

        scaffolding.createFlow(ENTITY, "sjs-json-harmonization-flow", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        FileUtil.copy(getResourceStream("flow-manager/sjs-harmonize-flow/headers.sjs"), harmonizeDir.resolve("sjs-json-harmonization-flow/headers.sjs").toFile());

        installUserModules(getHubConfig(), true);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "flow-manager/staged.json");

        EnvironmentConfig envConfig = new EnvironmentConfig(PROJECT_PATH, "local", "admin", "admin");
        envConfig.setMlSettings(HubConfigBuilder.newHubConfigBuilder(PROJECT_PATH).withPropertiesFromEnvironment().build());
        setEnvConfig(envConfig);

        ObjectMapper mapper = new ObjectMapper();
        JsonNode body = mapper.readTree("{\"batchSize\":1, \"threadCount\": 1}");

        ResponseEntity<?> responseEntity = ec.runHarmonizeFlow(ENTITY, "sjs-json-harmonization-flow", body);

        Assert.assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        DocumentRecord doc = finalDocMgr.read("/staged.json").next();
        JsonNode root = doc.getContent(new JacksonHandle()).get();
        JsonNode env = root.path("envelope");
        JsonNode headers = env.path("headers");
        JsonNode optionNode = headers.path("test-option");
        Assert.assertTrue(optionNode.isMissingNode());

        uninstallHub();
    }

    @Test
    public void runHarmonizeFlowWithOptions() throws IOException, InterruptedException {
        // Set up (not needed for other tests)
        baseSetUp();
        installHub();

        Path projectDir = Paths.get(".", PROJECT_PATH);
        Scaffolding scaffolding = new Scaffolding(projectDir.toString(), stagingClient);

        scaffolding.createFlow(ENTITY, "sjs-json-harmonization-flow", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON);

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        FileUtil.copy(getResourceStream("flow-manager/sjs-harmonize-flow/headers.sjs"), harmonizeDir.resolve("sjs-json-harmonization-flow/headers.sjs").toFile());

        installUserModules(getHubConfig(), true);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "flow-manager/staged.json");

        EnvironmentConfig envConfig = new EnvironmentConfig(PROJECT_PATH, "local", "admin", "admin");
        envConfig.setMlSettings(HubConfigBuilder.newHubConfigBuilder(PROJECT_PATH).withPropertiesFromEnvironment().build());
        setEnvConfig(envConfig);

        final String OPT_VALUE = "test-value";
        ObjectMapper mapper = new ObjectMapper();
        JsonNode body = mapper.readTree("{\"batchSize\":1, \"threadCount\": 1, \"options\": {\"test-option\": \"" + OPT_VALUE + "\"}}");

        ResponseEntity<?> responseEntity = ec.runHarmonizeFlow(ENTITY, "sjs-json-harmonization-flow", body);

        Assert.assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        DocumentRecord doc = finalDocMgr.read("/staged.json").next();
        JsonNode root = doc.getContent(new JacksonHandle()).get();
        JsonNode env = root.path("envelope");
        JsonNode headers = env.path("headers");
        JsonNode optionNode = headers.path("test-option");
        Assert.assertFalse(optionNode.isMissingNode());
        Assert.assertEquals(OPT_VALUE, optionNode.asText());

        uninstallHub();
    }

}
