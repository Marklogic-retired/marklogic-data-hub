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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.datamovement.JobTicket;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.legacy.LegacyFlowManager;
import com.marklogic.hub.legacy.flow.*;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.AbstractWebTest;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.InputStream;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class LegacyFlowManagerServiceTest extends AbstractWebTest {

    private static String ENTITY = "test-entity";

    @Autowired
    LegacyFlowManagerService fm;

    @Autowired
    LegacyFlowManager flowManager;

    @Autowired
    Scaffolding scaffolding;

    @BeforeEach
    public void setup() {
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

        Path inputDir = getHubProject().getProjectDir().resolve("plugins/entities/" + ENTITY + "/input");
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

        Path harmonizeDir = getHubProject().getProjectDir().resolve("plugins/entities/" + ENTITY + "/harmonize");
        inputStream = getResourceStream("legacy-flow-manager/sjs-harmonize-flow/headers.sjs");
        FileUtil.copy(inputStream, harmonizeDir.resolve("sjs-json-harmonization-flow/headers.sjs").toFile());
        IOUtils.closeQuietly(inputStream);

        installUserModules(runAsFlowDeveloper(), true);
    }

    @Test
    public void getFlowMlcpOptionsFromFile() throws Exception {
        Map<String, Object> options = fm.getFlowMlcpOptionsFromFile("test-entity", "test-flow");
        String expected = "{\"input_file_path\":\"" + getHubProject().getProjectDirString() + "\"}";
        String actual = new ObjectMapper().writeValueAsString(options);
        JSONAssert.assertEquals("Options differ; expected: " + expected + "; actual: " + actual, expected, actual, true);
    }

    @Test
    public void runHarmonizationFlow() throws InterruptedException {
        int finalCount = getFinalDocCount();

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "legacy-flow-manager/staged.json");

        String flowName = "sjs-json-harmonization-flow";
        LegacyFlow flow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);

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

        assertEquals(finalCount + 1, getFinalDocCount());
    }

    @Test
    public void runHarmonizationFlowWithOptions() throws InterruptedException {
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "legacy-flow-manager/staged.json");

        String flowName = "sjs-json-harmonization-flow";
        LegacyFlow flow = flowManager.getFlow(ENTITY, flowName, FlowType.HARMONIZE);

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

        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        DocumentRecord doc = finalDocMgr.read("/staged.json").next();
        JsonNode root = doc.getContent(new JacksonHandle()).get();
        JsonNode optionNode = root.path("envelope").path("headers").path("test-option");
        assertFalse(optionNode.isMissingNode());
        assertEquals(OPT_VALUE, optionNode.asText());
    }
}
