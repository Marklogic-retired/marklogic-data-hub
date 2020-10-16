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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.AbstractHubCentralTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class JobsControllerTest extends AbstractHubCentralTest {

    @Autowired
    JobsController jobsController;

    @Test
    public void testProcessedTargetDatabase() throws JsonProcessingException {
        String jobString = "{\n" +
                "   \"jobId\":\"38c44855-1850-4673-941b-1a73beae8148\",\n" +
                "   \"stepResponses\":{\n" +
                "      \"1\":{\n" +
                "         \"targetDatabase\":\"" + getHubClient().getDbName(DatabaseKind.STAGING) + "\"\n" +
                "      },\n" +
                "      \"2\":{\n" +
                "         \"targetDatabase\":\"" + getHubClient().getDbName(DatabaseKind.FINAL) + "\"\n" +
                "      },\n" +
                "      \"3\":{\n" +
                "         \"targetDatabase\":\"testDatabase\"\n" +
                "      }\n" +
                "   }\n" +
                "}";

        JsonNode jobNode = jobsController.processTargetDatabase(objectMapper.readTree(jobString));

        assertEquals("staging", jobNode.path("stepResponses").path("1").path("targetDatabase").asText());
        assertEquals("final", jobNode.path("stepResponses").path("2").path("targetDatabase").asText());
        assertEquals("testDatabase", jobNode.path("stepResponses").path("3").path("targetDatabase").asText());
    }
}
