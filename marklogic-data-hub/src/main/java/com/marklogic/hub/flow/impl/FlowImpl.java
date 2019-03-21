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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class FlowImpl implements Flow {
    public final static int DEFAULT_BATCH_SIZE = 100;
    public final static int DEFAULT_THREAD_COUNT = 4;

    private String name;
    private String id;
    private String description;
    private int batchSize;
    private int threadCount;
    private JsonNode options;

    private Map<String, Step> steps;

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
    public Flow deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);
        setName(jsonObject.getString("name"));
        setDescription(jsonObject.getString("description"));
        setId(jsonObject.getString("id", getName()));
        setBatchSize(jsonObject.getInt("batchSize", DEFAULT_BATCH_SIZE));
        setThreadCount(jsonObject.getInt("threadCount", DEFAULT_THREAD_COUNT));
        setOptions(jsonObject.getNode("options"));

        Map<String, Step> steps = new HashMap<>();
        JSONObject stepsNode = new JSONObject(jsonObject.getNode("steps"));
        int n = 1;
        while (stepsNode.isExist(String.valueOf(n))) {
            String key = String.valueOf(n);
            Step step = Step.create("default", Step.StepType.CUSTOM);
            step.deserialize(stepsNode.getNode(key));
            steps.put(key, step);
            n++;
        }
        setSteps(steps);

        return this;
    }
}
