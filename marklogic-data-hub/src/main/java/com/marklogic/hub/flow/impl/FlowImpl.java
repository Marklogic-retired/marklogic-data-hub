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
package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

public class FlowImpl implements Flow {
    public final static int DEFAULT_BATCH_SIZE = 100;
    public final static int DEFAULT_THREAD_COUNT = 4;
    public final static boolean DEFAULT_STOP_ONERROR = false;

    private String name;
    private String id;
    private String description;
    private int batchSize;
    private int threadCount;
    private boolean stopOnError;
    private JsonNode options;

    private Map<String, Step> steps = new LinkedHashMap<>();


    @JsonIgnore
    private Integer overrideBatchSize;
    @JsonIgnore
    private Integer overrideThreadCount;
    @JsonIgnore
    private Map<String, Object> overrideOptions;
    @JsonIgnore
    private String overrideSourceDB;
    @JsonIgnore
    private String overrideDestDB;

    public Integer getOverrideBatchSize() {
        return overrideBatchSize;
    }

    public void setOverrideBatchSize(Integer overrideBatchSize) {
        this.overrideBatchSize = overrideBatchSize;
    }

    public Integer getOverrideThreadCount() {
        return overrideThreadCount;
    }

    public void setOverrideThreadCount(Integer overrideThreadCount) {
        this.overrideThreadCount = overrideThreadCount;
    }

    public Map<String, Object> getOverrideOptions() {
        return overrideOptions;
    }

    public void setOverrideOptions(Map<String, Object> overrideOptions) {
        this.overrideOptions = overrideOptions;
    }

    public String getOverrideSourceDB() {
        return overrideSourceDB;
    }

    public void setOverrideSourceDB(String overrideSourceDB) {
        this.overrideSourceDB = overrideSourceDB;
    }

    public String getOverrideDestDB() {
        return overrideDestDB;
    }

    public void setOverrideDestDB(String overrideDestDB) {
        this.overrideDestDB = overrideDestDB;
    }


    public String getName() {
        return this.name;
    }

    public void setName(String flowName) {
        this.name = flowName;
    }

    @Override
    public String getId() {
        return id;
    }

    @Override
    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public int getBatchSize() {
        return batchSize;
    }

    @Override
    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    @Override
    public int getThreadCount() {
        return threadCount;
    }

    @Override
    public void setThreadCount(int threadCount) {
        this.threadCount = threadCount;
    }

    @Override
    public JsonNode getOptions() {
        return this.options;
    }

    @Override
    public void setOptions(JsonNode options) {
        this.options = options;
    }

    public Map<String, Step> getSteps() {
        return steps;
    }

    public void setSteps(Map<String, Step> steps) {
        this.steps = steps;
    }

    @Override
    public Step getStep(String stepNum) {
        return steps.get(stepNum);
    }

    @Override
    public void setStopOnError(boolean stopOnError) {
        this.stopOnError = stopOnError;
    }

    @Override
    public boolean isStopOnError() {
        return stopOnError;
    }

    @Override
    public Flow deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);
        setName(jsonObject.getString("name"));
        setDescription(jsonObject.getString("description"));
        setId(jsonObject.getString("id", getName()));
        setBatchSize(jsonObject.getInt("batchSize", DEFAULT_BATCH_SIZE));
        setThreadCount(jsonObject.getInt("threadCount", DEFAULT_THREAD_COUNT));
        setOptions(jsonObject.getNode("options"));
        setStopOnError(jsonObject.getBoolean("stopOnError", DEFAULT_STOP_ONERROR));

        JSONObject stepsNode = new JSONObject(jsonObject.getNode("steps"));
        Iterator<String> iterator = jsonObject.getNode("steps").fieldNames();
        while (iterator.hasNext()) {
            String key = iterator.next();
            Step step = Step.create("default", Step.StepType.CUSTOM);
            step.deserialize(stepsNode.getNode(key));

            steps.put(key, step);
        }
        setSteps(steps);

        return this;
    }
}
