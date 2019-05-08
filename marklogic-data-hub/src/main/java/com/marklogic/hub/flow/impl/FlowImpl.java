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
import com.marklogic.hub.step.StepDefinition.StepDefinitionType;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import org.apache.commons.lang3.StringUtils;

import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;

public class FlowImpl implements Flow {
    public final static int DEFAULT_BATCH_SIZE = 100;
    public final static int DEFAULT_THREAD_COUNT = 4;
    public final static boolean DEFAULT_STOP_ONERROR = false;

    private String name;
    private String description;
    private int batchSize;
    private int threadCount;
    private boolean stopOnError;
    private JsonNode options;
    private int version;

    private Map<String, Step> steps = new LinkedHashMap<>();

    @JsonIgnore
    private Map<String, Object> overrideOptions;
    @JsonIgnore
    private Map<String, Object> overrideStepConfig;


    public Map<String, Object> getOverrideStepConfig() {
        return this.overrideStepConfig;
    }

    public void setOverrideStepConfig(Map<String, Object> overrideStepConfig) {
        this.overrideStepConfig = overrideStepConfig;
    }


    public void setOverrideOptions(Map<String, Object> overrideOptions) {
        this.overrideOptions = overrideOptions;
    }
    
    public Map<String, Object> getOverrideOptions() {
        return this.overrideOptions;
    }


    public String getName() {
        return this.name;
    }

    public void setName(String flowName) {
        this.name = flowName;
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

    @Override
    public Map<String, Step> getSteps() {
        return steps;
    }

    @Override
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
    public int getVersion() {
        return this.version;
    }

    @Override
    public void setVersion(int version) {
        this.version = version;
    }

    @Override
    public Flow deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);
        setName(jsonObject.getString("name"));
        setDescription(jsonObject.getString("description"));
        setBatchSize(jsonObject.getInt("batchSize", DEFAULT_BATCH_SIZE));
        setThreadCount(jsonObject.getInt("threadCount", DEFAULT_THREAD_COUNT));
        setOptions(jsonObject.getNode("options"));
        setStopOnError(jsonObject.getBoolean("stopOnError", DEFAULT_STOP_ONERROR));

        JsonNode stepNode =jsonObject.getNode("steps");
        if (stepNode != null) {
            Iterator<String> iterator = stepNode.fieldNames();
            while (iterator.hasNext()) {
                String key = iterator.next();
                Step step = Step.deserialize(stepNode.get(key));
                steps.put(key, step);
            }

            setSteps(steps);
        }

        return this;
    }

    @Override
    public Step getStepById(String stepId) {
        if (StringUtils.isEmpty(stepId)) {
            return null;
        }

        return steps.get(stepId);
    }
}
