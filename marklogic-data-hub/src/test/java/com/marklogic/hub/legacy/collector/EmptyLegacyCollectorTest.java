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
import com.marklogic.hub.legacy.impl.LegacyFlowManagerImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;

import static org.junit.Assert.assertEquals;

public class EmptyLegacyCollectorTest extends AbstractHubCoreTest {

    private static final String ENTITY = "streamentity";

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    LegacyFlowManagerImpl legacyFlowManager;

    @BeforeEach
    public void setup() {
        scaffolding.createEntity(ENTITY);
        scaffolding.createLegacyFlow(ENTITY, "testharmonize", FlowType.HARMONIZE,
            CodeFormat.XQUERY, DataFormat.XML, false);

        clearUserModules();
        installUserModules(runAsFlowDeveloper(), true);
    }


    @Test
    public void runCollector() {
        LegacyFlow harmonizeFlow = legacyFlowManager.getFlow(ENTITY, "testharmonize",
            FlowType.HARMONIZE);
        HashMap<String, Object> options = new HashMap<>();

        // a sneaky attempt to test passing options. this value makes the collector work.
        options.put("returnStuff", true);
        LegacyFlowRunner flowRunner = legacyFlowManager.newFlowRunner()
            .withFlow(harmonizeFlow)
            .withBatchSize(10)
            .withThreadCount(1)
            .withOptions(options)
            .withStopOnFailure(true);
        JobTicket ticket = flowRunner.run();
        flowRunner.awaitCompletion();

        JsonNode node = getHubClient().getJobsClient().newDocumentManager().read("/jobs/" + ticket.getJobId() + ".json").next().getContent(new JacksonHandle()).get();
        assertEquals(ticket.getJobId(), node.get("jobId").asText());
        assertEquals(0, node.get("successfulEvents").asInt());
        assertEquals(0, node.get("failedEvents").asInt());
        assertEquals(0, node.get("failedBatches").asInt());
        assertEquals("FINISHED", node.get("status").asText());

    }
}
