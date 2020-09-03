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
package com.marklogic.hub.legacy.collector;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;

import static org.junit.Assert.assertEquals;

public class EmptyLegacyCollectorTest extends AbstractHubCoreTest {

    private static final String ENTITY = "streamentity";

    @BeforeEach
    public void setup() {
        scaffolding.createEntity(ENTITY);
        scaffolding.createLegacyFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML, false);

        clearUserModules();
        installUserModules(getDataHubAdminConfig(), true);
        clearDatabases(HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_JOB_NAME);
    }


    @Test
    public void runCollector() {
        LegacyFlow harmonizeFlow = fm.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();

        // a sneaky attempt to test passing options. this value makes the collector work.
        options.put("returnStuff", true);
        LegacyFlowRunner flowRunner = fm.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .withStopOnFailure(true);
        JobTicket ticket = flowRunner.run();
        flowRunner.awaitCompletion();

        JsonNode node = jobDocMgr.read("/jobs/" + ticket.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        assertEquals(ticket.getJobId(), node.get("jobId").asText());
        assertEquals(0, node.get("successfulEvents").asInt());
        assertEquals(0, node.get("failedEvents").asInt());
        assertEquals(0, node.get("failedBatches").asInt());
        assertEquals("FINISHED", node.get("status").asText());

    }
}
