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
package com.marklogic.hub.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;


public class HubEntity extends JsonPojo {

    protected String filename;
    protected InfoType info;
    protected DefinitionsType definitions;

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public InfoType getInfo() {
        return info;
    }

    public void setInfo(InfoType info) {
        this.info = info;
    }

    public DefinitionsType getDefinitions() {
        return definitions;
    }

    public void setDefinitions(DefinitionsType definition) {
        this.definitions = definition;
    }


    @Override
    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        writeObjectIf(node, "info", info);

        node.set("definitions",definitions.toJson());

        return node;
    }

    public static HubEntity fromJson(String filename, JsonNode node) {
        HubEntity hubEntity = new HubEntity();
        hubEntity.setFilename(filename);
        hubEntity.setInfo(InfoType.fromJson(node.get("info")));

        String title = hubEntity.getInfo().getTitle();
        hubEntity.setDefinitions(DefinitionsType.fromJson(node.get("definitions")));
        return hubEntity;
    }
}
