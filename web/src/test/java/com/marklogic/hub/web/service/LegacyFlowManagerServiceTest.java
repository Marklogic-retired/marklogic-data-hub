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
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.MlcpRunner;
import com.marklogic.hub.web.WebApplication;
import com.marklogic.hub.web.auth.ConnectionAuthenticationToken;
import org.apache.commons.io.IOUtils;
import org.json.JSONException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {WebApplication.class, ApplicationConfig.class, LegacyFlowManagerServiceTest.class})
public class LegacyFlowManagerServiceTest extends AbstractServiceTest {

    private static String ENTITY = "test-entity";
    private static Path projectDir = Paths.get(".", PROJECT_PATH);

    @Autowired
    LegacyFlowManagerService fm;

    @Autowired
    LegacyFlowManager flowManager;

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    HubConfig hubConfig;

    @BeforeEach
    public void setup() {
        createProjectDir();

        try {
            scaffolding.createEntity(ENTITY);
        }
        catch (DataHubProjectException e) {
            // Entity is already present
        }

        scaffolding.createLegacyFlow(ENTITY, "sjs-json-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.JSON, false);

        scaffolding.createLegacyFlow(ENTITY, "sjs-xml-input-flow", FlowType.INPUT,
            CodeFormat.JAVASCRIPT, DataFormat.XML, false);

        scaffolding.createLegacyFlow(ENTITY, "xqy-json-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.JSON, false);

        scaffolding.createLegacyFlow(ENTITY, "xqy-xml-input-flow", FlowType.INPUT,
            CodeFormat.XQUERY, DataFormat.XML, false);

        scaffolding.createLegacyFlow(ENTITY, "sjs-json-harmonization-flow", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON, false);

        scaffolding.createLegacyFlow(ENTITY, "xqy-xml-harmonization-flow", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML, false);

        Path inputDir = projectDir.resolve("plugins/entities/" + ENTITY + "/input");
        InputStream inputStream = getResourceStream("legacy-flow-manager/sjs-flow/headers.sjs");
        FileUtil.copy(inputStream, inputDir.resolve("sjs-json-input-flow/headers.sjs").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/sjs-flow/content-input.sjs");
        FileUtil.copy(inputStream, inputDir.resolve("sjs-json-input-flow/content.sjs").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/sjs-flow/triples.sjs");
        FileUtil.copy(inputStream, inputDir.resolve("sjs-json-input-flow/triples.sjs").toFile());
        IOUtils.closeQuietly(inputStream);

        inputStream = getResourceStream("legacy-flow-manager/sjs-flow/headers.sjs");
        FileUtil.copy(inputStream, inputDir.resolve("sjs-xml-input-flow/headers.sjs").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/sjs-flow/content-input.sjs");
        FileUtil.copy(inputStream, inputDir.resolve("sjs-xml-input-flow/content.sjs").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/sjs-flow/triples.sjs");
        FileUtil.copy(inputStream, inputDir.resolve("sjs-xml-input-flow/triples.sjs").toFile());
        IOUtils.closeQuietly(inputStream);

        inputStream = getResourceStream("legacy-flow-manager/xqy-flow/headers-json.xqy");
        FileUtil.copy(inputStream, inputDir.resolve("xqy-json-input-flow/headers.xqy").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/xqy-flow/content-input.xqy");
        FileUtil.copy(inputStream, inputDir.resolve("xqy-json-input-flow/content.xqy").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/xqy-flow/triples.xqy");
        FileUtil.copy(inputStream, inputDir.resolve("xqy-json-input-flow/triples.xqy").toFile());
        IOUtils.closeQuietly(inputStream);

        inputStream = getResourceStream("legacy-flow-manager/xqy-flow/headers-xml.xqy");
        FileUtil.copy(inputStream, inputDir.resolve("xqy-xml-input-flow/headers.xqy").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/xqy-flow/content-input.xqy");
        FileUtil.copy(inputStream, inputDir.resolve("xqy-xml-input-flow/content.xqy").toFile());
        IOUtils.closeQuietly(inputStream);
        inputStream = getResourceStream("legacy-flow-manager/xqy-flow/triples.xqy");
        FileUtil.copy(inputStream, inputDir.resolve("xqy-xml-input-flow/triples.xqy").toFile());
        IOUtils.closeQuietly(inputStream);

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        inputStream = getResourceStream("legacy-flow-manager/sjs-harmonize-flow/headers.sjs");
        FileUtil.copy(inputStream, harmonizeDir.resolve("sjs-json-harmonization-flow/headers.sjs").toFile());
        IOUtils.closeQuietly(inputStream);

        installUserModules(getDataHubAdminConfig(), true);
    }

    protected void setEnvConfig() {
        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Test
    public void getFlowMlcpOptionsFromFile() throws Exception {
        setEnvConfig();

        Map<String, Object> options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        JSONAssert.assertEquals("{ \"input_file_path\": " + hubConfig.getHubProject().getProjectDirString() + " }", new ObjectMapper().writeValueAsString(options), true);
    }

    @Test
    @Disabled
    // this test fails in some environments because wihen running in test,
    // its classpath is too long to call mlcp as an interprocess communication.
    public void runMlcp() throws IOException, InterruptedException, JSONException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        String flowName = "sjs-json-input-flow";

        LegacyFlow flow = flowManager.getFlow(ENTITY, flowName, FlowType.INPUT);

        ObjectMapper objectMapper = new ObjectMapper();
        String inputPath = getResourceFile("legacy-flow-manager/input.json").getAbsolutePath();
        String basePath = getResourceFile("legacy-flow-manager").getAbsolutePath();
        JsonNode mlcpOptions = objectMapper.readTree(
            "{" +
                "\"input_file_path\":\"" + inputPath.replace("\\", "\\\\\\\\") + "\"," +
                "\"input_file_type\":\"\\\"documents\\\"\"," +
                "\"output_collections\":\"\\\"" + ENTITY + "\\\"\"," +
                "\"output_permissions\":\"\\\"rest-reader,read,rest-writer,update\\\"\"," +
                "\"output_uri_replace\":\"\\\"" + basePath.replace("\\", "/").replaceAll("^([A-Za-z]):", "/$1:") + ",''\\\"\"," +
                "\"document_type\":\"\\\"json\\\"\"," +
                "\"transform_module\":\"\\\"/data-hub/4/transforms/mlcp-flow-transform.sjs\\\"\"," +
                "\"transform_namespace\":\"\\\"http://marklogic.com/data-hub/mlcp-flow-transform\\\"\"," +
                "\"transform_param\":\"\\\"entity-name=" + ENTITY + ",flow-name=" + flowName + "\\\"\"" +
                "}");
        LegacyFlowStatusListener flowStatusListener = (jobId, percentComplete, message) -> {
            logger.error(message);
        };
        MlcpRunner mlcpRunner = new MlcpRunner(null, "com.marklogic.hub.util.MlcpMain", getHubFlowRunnerConfig(), flow, stagingClient, mlcpOptions, flowStatusListener);
        mlcpRunner.start();
        mlcpRunner.join();

        assertEquals(1, getStagingDocCount());
        String expected = getResource("legacy-flow-manager/final.json");

        String actual = stagingDocMgr.read("/input.json").next().getContent(new StringHandle()).get();
        JSONAssert.assertEquals(expected, actual, false);
    }

    @Test
    public void runHarmonizationFlow() throws InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        assertEquals(0, getFinalDocCount());

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "legacy-flow-manager/staged.json");

        String pdir = "C:\\some\\crazy\\path\\to\\project";
        setEnvConfig();

        String flowName = "sjs-json-harmonization-flow";
        LegacyFlow flow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);

        //HubConfig hubConfig = getHubConfig();

        Object monitor = new Object();
        JobTicket jobTicket = fm.runFlow(flow, 1, 1, null, new LegacyFlowStatusListener(){
            @Override
            public void onStatusChange(String jobId, int percentComplete, String message) {
                if (percentComplete == 100)
                {
                    synchronized (monitor) {
                        monitor.notify();
                    }
                }
            }
        });

        // Wait for the flow to finish
        synchronized (monitor)
        {
            monitor.wait();
        }

        assertEquals(1, getFinalDocCount());
    }

    @Test
    public void runHarmonizationFlowWithOptions() throws InterruptedException {
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        assertEquals(0, getFinalDocCount());

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "legacy-flow-manager/staged.json");

        String pdir = "C:\\some\\crazy\\path\\to\\project";
        //EnvironmentConfig envConfig = new EnvironmentConfig("local", "admin", "admin");
        //envConfig.setMlSettings(HubConfigBuilder.newHubConfigBuilder(pdir).build());
        setEnvConfig();

        String flowName = "sjs-json-harmonization-flow";
        LegacyFlow flow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);

        //HubConfig hubConfig = getHubConfig();

        final String OPT_VALUE = "test-value";
        Map<String, Object> options = new HashMap<String, Object>();
        options.put("test-option", OPT_VALUE);

        Object monitor = new Object();
        JobTicket jobTicket = fm.runFlow(flow, 1, 1, options, new LegacyFlowStatusListener(){
            @Override
            public void onStatusChange(String jobId, int percentComplete, String message) {
                if (percentComplete == 100)
                {
                    synchronized (monitor) {
                        monitor.notify();
                    }
                }
            }
        });

        // Wait for the flow to finish
        synchronized (monitor)
        {
            monitor.wait();
        }

        assertEquals(1, getFinalDocCount());

        DocumentRecord doc = finalDocMgr.read("/staged.json").next();
        JsonNode root = doc.getContent(new JacksonHandle()).get();
        JsonNode optionNode = root.path("envelope").path("headers").path("test-option");
        assertFalse(optionNode.isMissingNode());
        assertEquals(OPT_VALUE, optionNode.asText());
    }
}
