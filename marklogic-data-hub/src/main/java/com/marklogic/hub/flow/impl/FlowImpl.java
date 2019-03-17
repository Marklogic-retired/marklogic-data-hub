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
package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;

public class FlowImpl implements Flow {
    private String name;
    // Storing the entire JSON node for serialization;
    private JsonNode rawValue;

    public String getName() { return this.name; }

    public void setName(String flowName) { this.name = flowName; }

    @Override
    public String serialize() {
        ObjectMapper mapper = new ObjectMapper();
        // Using this approach, as we aren't de-serializing all data into Java Objects
        if (rawValue != null) {
            ObjectNode objNode = mapper.createObjectNode();
            rawValue.fields().forEachRemaining((field) -> {
                objNode.set(field.getKey(), field.getValue());
            });
            // Setters should be serialized into JSON
            objNode.put("name", this.name);
            return objNode.toString();
        } else {
            try {
                return mapper.writeValueAsString(this);
            }
            catch (JsonProcessingException e) {
                throw new DataHubProjectException("Unable to serialize flow object.");
            }
        }
    }

    @Override
    public Flow deserialize(JsonNode json) {
        this.rawValue = json;
        if (json.has("name")) {
            setName(json.get("name").asText());
        }
        return this;
    }
}
