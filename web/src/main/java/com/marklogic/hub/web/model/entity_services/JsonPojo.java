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
