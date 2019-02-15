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
package com.marklogic.hub.flow;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.marklogic.hub.error.DataHubProjectException;

public class FlowImpl implements Flow {
    private String name;
    private String description;
    private String identifier;
    private JsonNode steps;
    private String language = "zxx";
    private int version;
    private JsonNode options;

    public String getName() {
        return this.name;
    }

    public void setName(String flowName) {
        this.name = flowName;
    }

    public String getDescription() {
        return this.description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIdentifier() {
        return this.identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getLanguage() {
        return this.language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public int getVersion() {
        return this.version;
    }

    public void setVersion(int versionNumber) {
        this.version = versionNumber;
    }

    public JsonNode getOptions() {
        return this.options;
    }

    public void setOptions(JsonNode optionsNode) {
        this.options = optionsNode;
    }

    public JsonNode getSteps() {
        return this.steps;
    }

    public void setSteps(JsonNode steps) {
        this.steps = steps;
    }

    FlowImpl(String name) {
        this.name = name;
        this.description = "This is a description of what this flow's purpose.";
        this.version = 1;
        this.identifier = "cts.collectionQuery('entity', '" + name + "')";
        this.options = JsonNodeFactory.instance.objectNode();
        this.steps = JsonNodeFactory.instance.objectNode();
    }


    @Override
    public String serialize() {
        ObjectMapper mapper = new ObjectMapper();
        try {
            return mapper.writeValueAsString(this);
        }
        catch (JsonProcessingException e) {
            throw new DataHubProjectException("Unable to serialize the flow object.");
        }
    }

    @Override
    public Flow deserialize(JsonNode json) {
        if (json.has("name")) {
            setName(json.get("name").asText());
        }

        if (json.has("description")) {
            setDescription(json.get("description").asText());
        }

        if (json.has("identifier")) {
            setIdentifier(json.get("identifier").asText());
        }

        if (json.has("steps")) {
            setSteps(json.get("steps"));
        }

        if (json.has("language")) {
            setLanguage(json.get("language").asText());
        }

        if (json.has("version")) {
            setVersion(json.get("version").asInt());
        }

        if (json.has("options")) {
            setOptions(json.get("options"));
        }

        return this;
    }
}
