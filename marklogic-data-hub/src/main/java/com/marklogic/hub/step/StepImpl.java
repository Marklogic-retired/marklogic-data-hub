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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.util.json.JSONObject;

public class StepImpl implements Step {
    private String name;
    private StepType type;
    private int version;
    private JsonNode options;
    private JsonNode customHook;
    private String language = "zxx";
    private String modulePath;
    private String identifier;

    StepImpl(String name, StepType type) {
        this.name = name;
        this.type = type;
        this.version = 1;
        JSONObject jsonObject = new JSONObject();
        options = jsonObject.jsonNode();
        jsonObject.putArray("collections", name);
        if (type == StepType.INGEST) {
            jsonObject.put("outputFormat", "json");
        } else if (type == StepType.MAPPING || type == StepType.CUSTOM) {
            this.identifier = "cts.uris(null, null, cts.collectionQuery('default-ingest'))";
        }
        this.modulePath = "/path/to/your/step/module/main.sjs";
        this.customHook = new JSONObject().jsonNode();
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

    public String getLanguage() {
        return language;
    }

    public void setLanguage() {
        this.language = "zxx";
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

    public String getModulePath() {
        return modulePath;
    }

    public void setModulePath(String path) {
        this.modulePath = path;
    }

    public JsonNode getCustomHook() {
        return customHook;
    }

    public void setCustomHook(JsonNode hookObj) {
        this.customHook = hookObj;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }


    @Override
    public void deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);
        setName(jsonObject.getString("name"));
        setType(StepType.getStepType(jsonObject.getString("type")));
        setVersion(jsonObject.getInt("version"));
        setOptions(jsonObject.getNode("options"));
        setCustomHook(jsonObject.getNode("customHook"));
        setModulePath(jsonObject.getString("modulePath"));
        setIdentifier(jsonObject.getString("identifier"));
    }
}
