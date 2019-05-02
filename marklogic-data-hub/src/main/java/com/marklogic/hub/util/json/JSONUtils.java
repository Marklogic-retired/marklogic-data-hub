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
package com.marklogic.hub.util.json;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import org.apache.commons.lang3.StringUtils;

public class JSONUtils {
    /**
     * A utility method to trim all text values in a json object
     *
     * @param jsonObject a JSONObject
     */
    public static void trimText(JSONObject jsonObject) {
        trimText(jsonObject.json);
    }

    /**
     * A utility method to trim all text values in a json node
     *
     * @param jsonNode a json node
     */
    public static void trimText(JsonNode jsonNode) {
        jsonNode.fields().forEachRemaining(e -> processJson(jsonNode, e.getKey(), e.getValue()));
    }

    private static void processJson(JsonNode parent, String key, JsonNode value) {
        if (value.isTextual()) {
            ((ObjectNode) parent).put(key, StringUtils.trim(value.asText()));
        }
        else if (value.isArray()) {
            for (int i = 0; i < value.size(); i++) {
                if (value.get(i).isTextual()) {
                    ((ArrayNode) parent.withArray(key)).set(i, new TextNode(StringUtils.trim(value.get(i).asText())));
                }
                else if (value.get(i).isArray()) {
                    processArray(parent.withArray(key).get(i), i, value.get(i));
                }
                else if (value.get(i).isObject()) {
                    JsonNode val = value.get(i);
                    val.fields().forEachRemaining(e -> processJson(val, e.getKey(), e.getValue()));
                }
            }
        }
        else if (value.isObject()) {
            value.fields().forEachRemaining(e -> processJson(value, e.getKey(), e.getValue()));
        }
    }

    private static void processArray(JsonNode parent, int index, JsonNode value) {
        if (value.isTextual()) {
            ((ArrayNode) parent).set(index, new TextNode(StringUtils.trim(value.asText())));
        }
        else if (value.isArray()) {
            for (int i = 0; i < value.size(); i++) {
                if (value.get(i).isArray()) {
                    for (int j = 0; j < value.size(); j++) {
                        processArray(parent.get(j), j, value.get(j));
                    }
                }
                else {
                    processArray(parent, i, value.get(i));
                }
            }
        }
        else if (value.isObject()) {
            value.fields().forEachRemaining(e -> processJson(value, e.getKey(), e.getValue()));
        }
    }
}
