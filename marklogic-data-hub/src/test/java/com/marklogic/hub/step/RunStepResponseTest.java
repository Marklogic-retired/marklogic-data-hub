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
package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class RunStepResponseTest {

    @Test
    public void testTargetDatabase() throws IOException {
        String flowString = "{\n" +
                "   \"name\":\"testFlow\",\n" +
                "   \"steps\":{\n" +
                "      \"1\":{\n" +
                "         \"name\":\"ingest\",\n" +
                "         \"stepDefinitionName\":\"default-ingestion\",\n" +
                "         \"stepDefinitionType\":\"INGESTION\",\n" +
                "         \"options\":{\n" +
                "            \"targetDatabase\":\"data-hub-STAGING\"\n" +
                "         }\n" +
                "      },\n" +
                "      \"2\":{\n" +
                "         \"name\":\"map\",\n" +
                "         \"stepDefinitionName\":\"entity-services-mapping\",\n" +
                "         \"stepDefinitionType\":\"MAPPING\",\n" +
                "         \"options\":{\n" +
                "            \"targetDatabase\":\"data-hub-FINAL\"\n" +
                "         }\n" +
                "      },\n" +
                "      \"3\":{\n" +
                "         \"name\":\"match\",\n" +
                "         \"stepDefinitionName\":\"default-matching\",\n" +
                "         \"stepDefinitionType\":\"MATCHING\",\n" +
                "         \"options\":{\n" +
                "            \n" +
                "         }\n" +
                "      }\n" +
                "   }\n" +
                "}";

        Flow flow = new FlowImpl();
        flow.deserialize(new ObjectMapper().readTree(flowString));

        assertEquals("data-hub-STAGING", RunStepResponse.withFlow(flow).withStep("1").getTargetDatabase());
        assertEquals("data-hub-FINAL", RunStepResponse.withFlow(flow).withStep("2").getTargetDatabase());
        assertNull(RunStepResponse.withFlow(flow).withStep("3").getTargetDatabase());
    }
}
