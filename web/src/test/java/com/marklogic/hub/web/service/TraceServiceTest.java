/*
 * Copyright (c) 2020 MarkLogic Corporation
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

import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.legacy.flow.LegacyFlow;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.web.AbstractWebTest;
import com.marklogic.hub.web.model.TraceQuery;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;

class TraceServiceTest extends AbstractWebTest {

    private DatabaseClient traceClient;
    private static String ENTITY = "test-entity";

    @Autowired
    LegacyFlowManagerService flowMgrService;

    @Autowired
    Scaffolding scaffolding;


    @BeforeEach
    public void setUp() {
        scaffolding.createEntity(ENTITY);
        scaffolding.createLegacyFlow(ENTITY, "sjs-json-harmonize-flow", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON, false);

        scaffolding.createLegacyFlow(ENTITY, "xqy-xml-harmonize-flow", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML, false);

        installUserModules(runAsFlowDeveloper(), true);

        traceClient = getHubClient().getJobsClient();
        final String FLOW_NAME = "sjs-json-harmonize-flow";
        LegacyFlow flow = flowMgrService.getServerFlow(ENTITY, FLOW_NAME, FlowType.HARMONIZE);
        flowMgrService.runFlow(flow, 1, 1, new HashMap<String, Object>(), (jobId, percentComplete, message) -> { });
    }

    @Test
    public void getTraces() {
        TraceService tm = new TraceService(traceClient);
        TraceQuery traceQuery = new TraceQuery();
        traceQuery.start = 1L;
        traceQuery.count = 10L;
        tm.getTraces(traceQuery);
    }
}
