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

package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.DocumentRecord;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.legacy.flow.CodeFormat;
import com.marklogic.hub.legacy.flow.DataFormat;
import com.marklogic.hub.legacy.flow.FlowType;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.web.AbstractWebTest;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class EntitiesControllerTest extends AbstractWebTest {

    private static String ENTITY = "test-entity";

    @Autowired
    EntitiesController ec;

    @Autowired
    Scaffolding scaffolding;

    @Autowired
    HubConfig hubConfig;

    @Test
    public void getInputFlowOptions() throws Exception {
        Map<String, Object> options = ec.getInputFlowOptions("test-entity", "flow-name");
        JSONAssert.assertEquals("{ \"input_file_path\":\"" + hubConfig.getHubProject().getProjectDirString() + "\"}", new ObjectMapper().writeValueAsString(options), true);
    }

    @Test
    public void runHarmonizeNoOptions() throws IOException {
        Path projectDir = getHubProject().getProjectDir();

        scaffolding.createLegacyFlow(ENTITY, "sjs-json-harmonization-flow", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON, false);

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        InputStream inputStream = getResourceStream("legacy-flow-manager/sjs-harmonize-flow/headers.sjs");
        FileUtil.copy(inputStream, harmonizeDir.resolve("sjs-json-harmonization-flow/headers.sjs").toFile());
        IOUtils.closeQuietly(inputStream);
        installUserModules(runAsFlowDeveloper(), true);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "legacy-flow-manager/staged.json");

        ObjectMapper mapper = new ObjectMapper();
        JsonNode body = mapper.readTree("{\"batchSize\":1, \"threadCount\": 1}");

        ResponseEntity<?> responseEntity = ec.runHarmonizeFlow(ENTITY, "sjs-json-harmonization-flow", body);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        // document takes a moment to arrive.
        sleep(3000);
        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        DocumentRecord doc = finalDocMgr.read("/staged.json").next();
        JsonNode root = doc.getContent(new JacksonHandle()).get();
        JsonNode env = root.path("envelope");
        JsonNode headers = env.path("headers");
        JsonNode optionNode = headers.path("test-option");
        assertTrue(optionNode.isMissingNode());
    }

    @Test
    public void runHarmonizeFlowWithOptions() throws IOException {
        Path projectDir = getHubProject().getProjectDir();

        scaffolding.createLegacyFlow(ENTITY, "sjs-json-harmonization-flow", FlowType.HARMONIZE,
            CodeFormat.JAVASCRIPT, DataFormat.JSON, false);

        Path harmonizeDir = projectDir.resolve("plugins/entities/" + ENTITY + "/harmonize");
        InputStream inputStream = getResourceStream("legacy-flow-manager/sjs-harmonize-flow/headers.sjs");
        FileUtil.copy(inputStream, harmonizeDir.resolve("sjs-json-harmonization-flow/headers.sjs").toFile());
        IOUtils.closeQuietly(inputStream);

        installUserModules(runAsFlowDeveloper(), true);

        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        meta.getCollections().add(ENTITY);
        installStagingDoc("/staged.json", meta, "legacy-flow-manager/staged.json");

        final String OPT_VALUE = "test-value";
        ObjectMapper mapper = new ObjectMapper();
        JsonNode body = mapper.readTree("{\"batchSize\":1, \"threadCount\": 1, \"options\": {\"test-option\": \"" + OPT_VALUE + "\"}}");

        ResponseEntity<?> responseEntity = ec.runHarmonizeFlow(ENTITY, "sjs-json-harmonization-flow", body);

        assertEquals(HttpStatus.OK, responseEntity.getStatusCode());
        // document takes a moment to arrive.
        sleep(3000);
        GenericDocumentManager finalDocMgr = getHubClient().getFinalClient().newDocumentManager();
        DocumentRecord doc = finalDocMgr.read("/staged.json").next();
        JsonNode root = doc.getContent(new JacksonHandle()).get();
        JsonNode env = root.path("envelope");
        JsonNode headers = env.path("headers");
        JsonNode optionNode = headers.path("test-option");
        assertFalse(optionNode.isMissingNode());
        assertEquals(OPT_VALUE, optionNode.asText());
    }

}
