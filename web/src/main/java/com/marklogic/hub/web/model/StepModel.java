/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.Iterator;

public class StepModel {

    protected String id;
    protected String name;
    protected String stepDefinitionName;
    protected StepDefinition.StepDefinitionType stepDefinitionType;
    protected String description;
    protected JsonNode options;
    protected String language;
    protected Boolean isValid;
    protected JsonNode customHook;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private JsonNode fileLocations;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String modulePath;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStepDefinitionName() {
        return stepDefinitionName;
    }

    public void setStepDefinitionName(String stepDefinitionName) {
        this.stepDefinitionName = stepDefinitionName;
    }

    public StepDefinition.StepDefinitionType getStepDefinitionType() {
        return stepDefinitionType;
    }

    public void setStepDefinitionType(StepDefinition.StepDefinitionType stepDefinitionType) {
        this.stepDefinitionType = stepDefinitionType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public JsonNode getOptions() {
        return options;
    }

    public void setOptions(JsonNode options) {
        this.options = options;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Boolean getIsValid() {
        return isValid;
    }

    public void setIsValid(Boolean valid) {
        isValid = valid;
    }

    public JsonNode getCustomHook() {
        return customHook;
    }

    public void setCustomHook(JsonNode customHook) {
        this.customHook = customHook;
    }

    public JsonNode getFileLocations() {
        return fileLocations;
    }

    public void setFileLocations(JsonNode fileLocations) {
        this.fileLocations = fileLocations;
    }

    public String getModulePath() {
        return modulePath;
    }

    public void setModulePath(String modulePath) {
        this.modulePath = modulePath;
    }

    public static StepModel fromJson(JsonNode node) {
        StepModel step = new StepModel();

        JSONObject jsonObject = new JSONObject(node);

        step.setStepDefinitionName(jsonObject.getString("stepDefinitionName"));
        step.setStepDefinitionType(StepDefinition.StepDefinitionType.getStepDefinitionType(jsonObject.getString("stepDefinitionType")));
        step.setFileLocations(jsonObject.getNode("fileLocations"));
        step.setModulePath(jsonObject.getString("modulePath"));
        String stepName = jsonObject.getString("name");
        if (stepName == null) {
            stepName = step.getStepDefinitionName();
        }
        step.setName(stepName);

        if (jsonObject.getString("id") != null) {
            step.setId(jsonObject.getString("id"));
        }
        else {
            step.setId(step.getName() + "-" + step.getStepDefinitionType());
        }

        step.setDescription(jsonObject.getString("description"));
        step.setOptions(jsonObject.getNode("options"));
        step.setLanguage("zxx");
        step.setIsValid(jsonObject.getBoolean("isValid"));
        step.setCustomHook(jsonObject.getNode("customHook"));

        return step;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();

        if (getId() != null) {
            node.put("id", getId());
        }
        else {
            node.put("id", getName() + "-" + getStepDefinitionType());
        }

        if (getStepDefinitionType() != null) {
            node.put("stepDefinitionType", getStepDefinitionType().toString());
        }

        if (getStepDefinitionName() != null) {
            node.put("stepDefinitionName", getStepDefinitionName());
        }

        if (getFileLocations() != null) {
            node.set("fileLocations", fileLocations);
        }

        if (getModulePath() != null) {
            node.put("modulePath", modulePath);
        }

        node.put("name", getName());
        node.put("description", getDescription());
        node.set("options", getOptions());
        node.put("language", getLanguage());
        node.put("isValid", getIsValid());
        node.set("customHook", getCustomHook());

        return node;
    }

    public static Step transformToCoreStepModel(StepModel stepModel, JsonNode stepJson) {
        Step step = new Step();

        step.setName(stepModel.getName());
        step.setStepDefinitionName(stepModel.getStepDefinitionName());
        step.setStepDefinitionType(stepModel.getStepDefinitionType());
        step.setDescription(stepModel.getDescription());
        step.setCustomHook(stepModel.getCustomHook());
        step.setFileLocations(stepModel.getFileLocations());
        step.setModulePath(stepModel.getModulePath());
        JSONObject jsonObject = new JSONObject(stepJson);
        step.setOptions(jsonObject.getMap("options"));

        return step;
    }

    public static StepModel transformToWebStepModel(Step step) {
        StepModel stepModel = new StepModel();
        stepModel.setId(step.getName() + "-" + step.getStepDefinitionType());
        stepModel.setName(step.getName());
        stepModel.setStepDefinitionName(step.getStepDefinitionName());
        stepModel.setStepDefinitionType(step.getStepDefinitionType());
        stepModel.setFileLocations(step.getFileLocations());
        stepModel.setModulePath(step.getModulePath());
        stepModel.setDescription(step.getDescription());
        stepModel.setCustomHook(step.getCustomHook());

        JSONObject jsonObject = new JSONObject();
        jsonObject.putMap(step.getOptions());
        stepModel.setOptions(jsonObject.jsonNode());

        // TODO: Sending true for now
        stepModel.setIsValid(true);

        return stepModel;
    }

    public static Step mergeFields(StepModel stepModel, Step defaultStep, Step step) {
        // merge options
        if (stepModel.getOptions() != null) {
            Iterator<String> iterator = stepModel.getOptions().fieldNames();
            while (iterator.hasNext()) {
                String key = iterator.next();
                defaultStep.getOptions().put(key, stepModel.getOptions().get(key));
            }
        }

        // merge otherFields
        if (step.getName() != null) {
            defaultStep.setName(step.getName());
        }

        if (step.getDescription() != null) {
            defaultStep.setDescription(step.getDescription());
        }

        if (step.getCustomHook() != null) {
            defaultStep.setCustomHook(step.getCustomHook());
        }

        if (step.getFileLocations() != null) {
            defaultStep.setFileLocations(step.getFileLocations());
        }

        // Overwrite fields
        defaultStep.setRetryLimit(step.getRetryLimit());
        defaultStep.setThreadCount(step.getThreadCount());
        defaultStep.setBatchSize(step.getBatchSize());
        defaultStep.setModulePath(step.getModulePath());

        return defaultStep;
    }
}
