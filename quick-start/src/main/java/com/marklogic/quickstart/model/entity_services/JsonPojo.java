package com.marklogic.quickstart.model.entity_services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public abstract class JsonPojo {

    protected static String getValue(JsonNode node, String key) {
        String value = null;
        JsonNode n = node.get(key);
        if (n != null && !(n instanceof NullNode)) {
            value = n.asText();
        }
        return value;
    }

    protected static Integer getIntValue(JsonNode node, String key) {
        return getIntValue(node, key, null);
    }

    protected static Integer getIntValue(JsonNode node, String key, Integer defaultValue) {
        Integer value = defaultValue;
        JsonNode n = node.get(key);
        if (n != null && !(n instanceof NullNode)) {
            value = n.asInt();
        }
        return value;
    }

    public abstract JsonNode toJson();

    protected static void writeObjectIf(ObjectNode node, String key, JsonPojo o) {
        if (o != null) {
            node.set(key, o.toJson());
        }
    }

    protected static void writeStringIf(ObjectNode node, String key, String value) {
        if (value != null) {
            node.put(key, value);
        }
    }

    protected static void writeNumberIf(ObjectNode node, String key, Integer value) {
        if (value != null) {
            node.put(key, value);
        }
    }
}
