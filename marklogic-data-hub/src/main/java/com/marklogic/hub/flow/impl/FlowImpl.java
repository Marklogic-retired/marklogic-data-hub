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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;
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
    private JsonNode stepsNode;

    @JsonIgnore
    private Map<String, Step> stepDetails = new HashMap<>();

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

    public Map<String, Step> getStepDetails() {
        return stepDetails;
    }

    public void setStepDetails(Map<String, Step> steps) {
        this.stepDetails = steps;
    }

    @Override
    public Step getStep(String stepNum) {
        return stepDetails.get(stepNum);
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
    public JsonNode getSteps() {
        return this.stepsNode;
    }

    @Override
    public void setSteps(JsonNode stepsNode) {
        this.stepsNode = stepsNode;
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

        JsonNode stepsNode = jsonObject.getNode("steps");
        if (stepsNode != null) {
            if (stepsNode instanceof ArrayNode) {
                setSteps(stepsNode);
            }
            else {
                Iterator<String> iterator = stepsNode.fieldNames();
                while (iterator.hasNext()) {
                    String key = iterator.next();
                    Step step = Step.create("default", Step.StepType.CUSTOM);
                    step.deserialize(stepsNode.get(key));

                    stepDetails.put(key, step);
                }
                setStepDetails(stepDetails);
            }
        }

        return this;
    }
}
