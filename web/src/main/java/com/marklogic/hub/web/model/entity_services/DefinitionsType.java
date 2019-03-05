/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.model.entity_services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.HashMap;
import java.util.Map;

public class DefinitionsType {

    protected Map<String, DefinitionType> definitions;

    public Map<String, DefinitionType> getDefinitions() {
        if (definitions == null) {
            definitions = new HashMap<>();
        }
        return this.definitions;
    }

    public void addDefinition(String name, DefinitionType definitionType) {
        getDefinitions().put(name, definitionType);
    }

    public void removeDefinition(String name) {
        getDefinitions().remove(name);
    }

    public static DefinitionsType fromJson(JsonNode json) {
        DefinitionsType definitionsType = new DefinitionsType();
        json.fields().forEachRemaining((Map.Entry<String, JsonNode> field) -> {
            definitionsType.addDefinition(field.getKey(), DefinitionType.fromJson(field.getKey(), field.getValue()));
        });
        return definitionsType;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        this.getDefinitions().forEach((definitionName, definitionType) -> {
            node.set(definitionName, definitionType.toJson());
        });

        return node;
    }
}
