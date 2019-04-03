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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class StepImpl implements Step {
    private String language = "zxx";
    private String name;
    private String description;
    private StepType type;
    private Integer version;
    private Map<String, Object> options;
    private JsonNode customHook;
    private String modulePath;
    @JsonIgnore
    private String identifier;
    private int retryLimit;
    private int batchSize;
    private int threadCount;
    private String sourceDatabase;
    private String destinationDatabase;

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
        } else if (type == StepType.MAPPING  || type == StepType.MASTER || type == StepType.CUSTOM) {
            identifier = "cts.uris(null, null, cts.collectionQuery('default-ingest'))";
            options.put("identifier", this.identifier);
        }
        switch (type) {
            case INGEST:
                options.put("outputFormat", "json");
                this.modulePath = "/data-hub/5/builtins/steps/ingest/default/main.sjs";
                break;
            case MAPPING:
                this.modulePath = "/data-hub/5/builtins/steps/mapping/default/main.sjs";
                break;
            case MASTER:
                options.put("sourceDatabase", HubConfig.DEFAULT_FINAL_NAME);
                options.put("targetDatabase", HubConfig.DEFAULT_FINAL_NAME);
                options.put("mergeOptions", new JSONObject());
                options.put("matchOptions", new JSONObject());
                // Step update needed for lock-for-update in Smart Mastering
                options.put("stepUpdate", true);
                // Accepts batch needed for Smart Mastering to receive all batch documents at once
                options.put("acceptsBatch", true);
                this.modulePath = "/data-hub/5/builtins/steps/master/default/main.sjs";
                break;
            default:
                this.modulePath = "/path/to/your/step/module/main.sjs";
                break;
        }
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
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

    public String getSourceDatabase() {
        return sourceDatabase;
    }

    public void setSourceDatabase(String sourceDatabase) {
        this.sourceDatabase = sourceDatabase;
    }

    public String getDestinationDatabase() {
        return destinationDatabase;
    }

    public void setDestinationDatabase(String destinationDatabase) {
        this.destinationDatabase = destinationDatabase;
    }

    public void incrementVersion() {
        setVersion(getVersion() + 1);
    }

    @Override
    public void deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);
        setName(jsonObject.getString("name"));
        setDescription(jsonObject.getString("description"));
        setType(StepType.getStepType(jsonObject.getString("type")));
        setVersion(jsonObject.getInt("version"));
        Map<String, Object> options = jsonObject.getMap("options");
        if (!options.isEmpty()) {
            setOptions(jsonObject.getMap("options"));
        }
        setCustomHook(jsonObject.getNode("customHook"));
        setModulePath(jsonObject.getString("modulePath"));
        if (this.options != null) {
            Object identifier = this.options.get("identifier");
            if (identifier != null) {
                setIdentifier(identifier.toString());
            }
        }
        setIdentifier(jsonObject.getString("identifier"));
        setRetryLimit(jsonObject.getInt("retryLimit"));
        setBatchSize(jsonObject.getInt("batchSize"));
        setThreadCount(jsonObject.getInt("threadCount"));
        setSourceDatabase(jsonObject.getString("sourceDatabase"));
        setDestinationDatabase(jsonObject.getString("destinationDatabase"));
    }
}
