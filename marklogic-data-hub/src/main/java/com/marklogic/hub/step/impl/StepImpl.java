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

package com.marklogic.hub.step.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StepImpl implements Step {
    private String language = "zxx";
    private String name;
    private StepType type;
    private int version;
    private Map<String, Object> options;
    private JsonNode customHook;
    private String modulePath;
    private String identifier;
    private int retryLimit;
    //TODO:Set default values
    private int batchSize;
    private int threadCount;
    private String sourceDB;
    private String destDB;

    public StepImpl(String name, StepType type) {
        this.name = name;
        this.type = type;
        version = 1;

        options = new HashMap<>();
        List<String> collectionName = new ArrayList<>();
        collectionName.add(name);
        options.put("collections", collectionName);

        if (type == StepType.INGEST) {
            options.put("outputFormat", "json");
        } else if (type == StepType.MAPPING || type == StepType.CUSTOM) {
            identifier = "cts.uris(null, null, cts.collectionQuery('default-ingest'))";
        }
        modulePath = "/path/to/your/step/module/main.sjs";
        customHook = new JSONObject().jsonNode();
        retryLimit = 0;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage() {
        this.language = "zxx";
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

    public void setType(StepType type) {
        this.type = type;
    }

    public int getVersion() {
        return version;
    }

    public void setVersion(int version) {
        this.version = version;
    }

    public Map<String, Object> getOptions() {
        return options;
    }

    public void setOptions(Map<String, Object> options) {
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

    public int getRetryLimit() {
        return retryLimit;
    }

    public void setRetryLimit(int retryLimit) {
        this.retryLimit = retryLimit;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    public int getThreadCount() {
        return threadCount;
    }

    public void setThreadCount(int threadCount) {
        this.threadCount = threadCount;
    }

    public String getSourceDB() {
        return sourceDB;
    }

    public void setSourceDB(String sourceDB) {
        this.sourceDB = sourceDB;
    }

    public String getDestDB() {
        return destDB;
    }

    public void setDestDB(String destDB) {
        this.destDB = destDB;
    }

    @Override
    public void deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);
        setName(jsonObject.getString("name"));
        setType(StepType.getStepType(jsonObject.getString("type")));
        setVersion(jsonObject.getInt("version"));
        Map<String, Object> options = jsonObject.getMap("options");
        if (!options.isEmpty()) {
            setOptions(jsonObject.getMap("options"));
        }
        setCustomHook(jsonObject.getNode("customHook"));
        setModulePath(jsonObject.getString("modulePath"));
        setIdentifier(jsonObject.getString("identifier"));
        setRetryLimit(jsonObject.getInt("retryLimit"));
        setBatchSize(jsonObject.getInt("batchSize"));
        setThreadCount(jsonObject.getInt("threadCount"));
        setSourceDB(jsonObject.getString("sourceDB"));
        setDestDB(jsonObject.getString("destDB"));
    }
}
