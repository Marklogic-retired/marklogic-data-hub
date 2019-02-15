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
package com.marklogic.hub.util;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Iterator;

public class JsonXor {

    public static JsonNode xor(File original, File changed) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode originalTree = (ObjectNode) objectMapper.readTree(original);
        ObjectNode changedTree = (ObjectNode) objectMapper.readTree(changed);
        return xor(originalTree, changedTree);
    }

    public static JsonNode xor(InputStream original, InputStream changed) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        ObjectNode originalTree = (ObjectNode) objectMapper.readTree(original);
        ObjectNode changedTree = (ObjectNode) objectMapper.readTree(changed);
        return xor(originalTree, changedTree);
    }

    private static JsonNode xor(ObjectNode originalTree, ObjectNode changedTree) {
        ObjectNode xored = JsonNodeFactory.instance.objectNode();
        Iterator<String> fieldItr = changedTree.fieldNames();
        while(fieldItr.hasNext()) {
            String key = fieldItr.next();
            if (originalTree.has(key)) {
                JsonNode orig = originalTree.get(key);
                JsonNode changed = changedTree.get(key);
                if (orig.isArray()) {
                    ArrayNode array = xor((ArrayNode)orig, (ArrayNode)changed);
                    if (array.size() > 0) {
                        xored.set(key, array);
                    }
                }
                else if (orig.isObject()) {
                    xored.set(key, xor((ObjectNode) orig, (ObjectNode)changed));
                }
                else {
                    if (!orig.equals(changed)) {
                        xored.set(key, changed);
                    }
                }
            }
            else {
                xored.set(key, changedTree.get(key));
            }
        }
        return xored;
    }

    private static ArrayNode xor(ArrayNode originalArray, ArrayNode changedTree) {
        ArrayNode xored = JsonNodeFactory.instance.arrayNode();
        for (int i = 0; i < changedTree.size(); i++) {
            boolean found = false;
            JsonNode changedNode = changedTree.get(i);
            for (int j = 0; j < originalArray.size(); j++) {
                if (originalArray.get(j).equals(changedNode)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                xored.add(changedNode);
            }
        }
        return xored;
    }
}
