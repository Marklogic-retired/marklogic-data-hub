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

package com.marklogic.hub.step;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.marklogic.hub.error.DataHubProjectException;

public class StepImpl implements Step {
    private String name;
    private StepType type;
    private int version;
    private JsonNode options;

    StepImpl(String name, StepType type) {
        this.name = name;
        this.type = type;
        this.version = 1;
        this.options = JsonNodeFactory.instance.objectNode();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public StepType getType() {
        return type;
    }

    public void setType(StepType type) {
        this.type = type;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public JsonNode getOptions() {
        return options;
    }

    public void setOptions(JsonNode options) {
        this.options = options;
    }

    @Override
    public String serialize() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(this);
        }
        catch (JsonProcessingException e) {
            throw new DataHubProjectException("Unable to serialize step object.");
        }
    }

    @Override
    public void deserialize(JsonNode json) {
        if (json.has("name")) {
            setName(json.get("name").asText());
        }

        if (json.has("type")) {
            setType(StepType.getStepType(json.get("type").asText()));
        }

        if (json.has("version")) {
            setVersion(json.get("version").asInt());
        }

        if (json.has("options")) {
            setOptions(json.get("options"));
        }
    }
}
