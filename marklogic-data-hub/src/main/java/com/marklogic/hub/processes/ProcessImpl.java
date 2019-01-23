/*
 * Copyright 2012-2019 MarkLogic Corporation
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

package com.marklogic.hub.processes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.error.DataHubProjectException;

public class ProcessImpl implements Process {
    private String name;
    private ProcessType type;

    ProcessImpl(String name, ProcessType type) {
        this.name = name;
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ProcessType getType() {
        return type;
    }

    public void setType(ProcessType type) {
        this.type = type;
    }

    @Override
    public String serialize() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(this);
        }
        catch (JsonProcessingException e) {
            throw new DataHubProjectException("Unable to serialize processes object.");
        }
    }

    @Override
    public void deserialize(JsonNode json) {
        if (json.has("name")) {
            setName(json.get("name").asText());
        }

        if (json.has("type")) {
            setType(ProcessType.getProcessType(json.get("type").asText()));
        }
    }
}
