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
package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class FlowImpl implements Flow {
    private String name;
    private String identifier;
    private String description;
    private Map<String, Step> steps;

    public String getName() {
        return this.name;
    }

    public void setName(String flowName) {
        this.name = flowName;
    }

    public String getIdentifier() {
        return identifier;
    }

    public void setIdentifier(String identifier) {
        this.identifier = identifier;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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
        setIdentifier(jsonObject.getString("identifier"));

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
