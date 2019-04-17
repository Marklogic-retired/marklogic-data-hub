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

package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.CodeFormat;
import com.marklogic.hub.flow.DataFormat;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.quickstart.DataHubApiConfiguration;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.model.TraceQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;


@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = {DataHubApiConfiguration.class, ApplicationConfig.class, TraceServiceTest.class})
class TraceServiceTest extends AbstractServiceTest {

    private DatabaseClient traceClient;
    private static Path projectDir = Paths.get(".", PROJECT_PATH);
    private static String ENTITY = "test-entity";

    @Autowired
    private FlowManagerService flowMgrService;

    @Autowired
    Scaffolding scaffolding;


    @BeforeEach
    public void setUp() throws IOException, InterruptedException {
        deleteProjectDir();
        //envConfig.checkIfInstalled();
        setEnvConfig();
        createProjectDir();
        enableTracing();

        scaffolding.createEntity(ENTITY);
        scaffolding.createFlow(ENTITY, "sjs-json-harmonize-flow", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON, false);

        scaffolding.createFlow(ENTITY, "xqy-xml-harmonize-flow", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML, false);

        installUserModules(getDataHubAdminConfig(), true);
        // Thread.sleep(3000);
        Thread.currentThread().join(3000);
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);

        traceClient = getDataHubAdminConfig().newJobDbClient();
        final String FLOW_NAME = "sjs-json-harmonize-flow";
        Flow flow = flowMgrService.getServerFlow(ENTITY, FLOW_NAME, FlowType.HARMONIZE);
        flowMgrService.runFlow(flow, 1, 1, new HashMap<String, Object>(), (jobId, percentComplete, message) -> { });
    }

    protected void setEnvConfig() {
        ConnectionAuthenticationToken authenticationToken = new ConnectionAuthenticationToken("admin", "admin", "localhost", 1, "local");
        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
    }

    @Test
    public void getTraces() {
        TraceService tm = new TraceService(traceClient);
        TraceQuery traceQuery = new TraceQuery();
        traceQuery.start = 1L;
        traceQuery.count = 10L;
        tm.getTraces(traceQuery);
    }

    @Test
    public void getTrace() throws IOException {
        TraceService tm = new TraceService(traceClient);
        TraceQuery traceQuery = new TraceQuery();
        traceQuery.start = 1L;
        traceQuery.count = 1L;
        StringHandle traces = tm.getTraces(traceQuery);

        String resultStr = traces.toString();
        ObjectMapper mapper = new ObjectMapper();
        JsonNode node = mapper.readTree(resultStr);
        JsonNode results = node.findValue("results");
        String traceId = results.get(0).findValue("content").findValue("traceId").asText();

        JsonNode trace = tm.getTrace(traceId);
        assertNotNull(trace);
        assertEquals(traceId, trace.findValue("traceId").asText());
    }
}
