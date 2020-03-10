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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractStepDefinition implements StepDefinition {
    private final static int DEFAULT_BATCH_SIZE = 100;
    private final static int DEFAULT_THREAD_COUNT = 4;

    private String lang;
    private String name;
    private String description;
    private StepDefinitionType type;
    private Integer version;
    private Map<String, Object> options;
    private JsonNode customHook;
    private String modulePath;
    @JsonIgnore
    private String sourceQuery;
    private int retryLimit;
    private Integer batchSize;
    private Integer threadCount;

    protected AbstractStepDefinition() {
        lang = "zxx";
        description = "";
        version = 1;

        options = new HashMap<>();
        options.put("permissions", "data-hub-operator,read,data-hub-operator,update");

        customHook = new JSONObject().jsonNode();
        retryLimit = 0;
        batchSize = DEFAULT_BATCH_SIZE;
        threadCount = DEFAULT_THREAD_COUNT;
    }

    @Deprecated
    public String getLanguage() {
        return lang;
    }

    @Override
    public String getLang() {
        return lang;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public StepDefinitionType getType() {
        return type;
    }

    public void setType(StepDefinitionType type) {
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

    public String getSourceQuery() {
        return sourceQuery;
    }

    public void setSourceQuery(String sourceQuery) {
        this.sourceQuery = sourceQuery;
    }

    public int getRetryLimit() {
        return retryLimit;
    }

    public void setRetryLimit(int retryLimit) {
        this.retryLimit = retryLimit;
    }

    public Integer getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(Integer batchSize) {
        this.batchSize = batchSize;
    }

    public Integer getThreadCount() {
        return threadCount;
    }

    public void setThreadCount(Integer threadCount) {
        this.threadCount = threadCount;
    }

    public void incrementVersion() {
        setVersion(getVersion() + 1);
    }

    @Override
    public void deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);

        if (jsonObject.isExist("name")) {
            setName(jsonObject.getString("name"));
        }

        if (jsonObject.isExist("description")) {
            setDescription(jsonObject.getString("description"));
        }

        if (jsonObject.isExist("type")) {
            setType(StepDefinitionType.getStepDefinitionType(jsonObject.getString("type")));
        }

        if (jsonObject.isExist("version")) {
            setVersion(jsonObject.getInt("version"));
        }

        Map<String, Object> options = jsonObject.getMap("options");
        if (!options.isEmpty()) {
            setOptions(jsonObject.getMap("options"));
        }

        if (jsonObject.isExist("customHook")) {
            setCustomHook(jsonObject.getNode("customHook"));
        }

        if (jsonObject.isExist("modulePath")) {
            setModulePath(jsonObject.getString("modulePath"));
        }

        if (this.options != null) {
            Object sourceQuery = this.options.get("sourceQuery");
            if (sourceQuery != null) {
                setSourceQuery(sourceQuery.toString());
            }
        }

        if (jsonObject.isExist("retryLimit")) {
            setRetryLimit(jsonObject.getInt("retryLimit"));
        }

        if (jsonObject.isExist("batchSize")) {
            setBatchSize(jsonObject.getInt("batchSize"));
        }

        if (jsonObject.isExist("threadCount")) {
            setThreadCount(jsonObject.getInt("threadCount"));
        }
    }

    public Step transformToStep(String stepName, StepDefinition stepDefinition, Step step) {
        step.setStepDefinitionName(stepDefinition.getName());
        step.setStepDefinitionType(stepDefinition.getType());
        step.setName(stepName);
        step.setThreadCount(stepDefinition.getThreadCount());
        step.setBatchSize(stepDefinition.getBatchSize());
        step.setRetryLimit(stepDefinition.getRetryLimit());
        step.setCustomHook(stepDefinition.getCustomHook());
        step.setOptions(stepDefinition.getOptions());
        step.setDescription(stepDefinition.getDescription());

        return step;
    }

    public StepDefinition transformFromStep(StepDefinition stepDefinition, Step step) {
        if (step.getName() != null) {
            stepDefinition.setName(step.getName());
        }

        if (step.getBatchSize() != null) {
            stepDefinition.setBatchSize(step.getBatchSize());
        }

        if (step.getDescription() != null) {
            stepDefinition.setDescription(step.getDescription());
        }

        if (step.getThreadCount() != null) {
            stepDefinition.setThreadCount(step.getThreadCount());
        }

        if (step.getOptions() != null) {
            stepDefinition.setOptions(step.getOptions());
        }

        if (step.getCustomHook() != null) {
            stepDefinition.setCustomHook(step.getCustomHook());
        }

        if (step.getRetryLimit() != null) {
            stepDefinition.setRetryLimit(step.getRetryLimit());
        }

        return stepDefinition;
    }
}
