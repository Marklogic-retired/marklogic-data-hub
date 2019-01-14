package com.marklogic.hub.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.HashMap;
import java.util.Map;

public class DefinitionsType extends JsonPojo {
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
