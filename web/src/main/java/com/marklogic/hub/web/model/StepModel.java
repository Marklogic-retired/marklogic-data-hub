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

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.Iterator;

public class StepModel {

    protected String id;
    protected String type;
    protected String name;
    protected String description;
    protected String sourceDatabase;
    protected String targetDatabase;
    protected JsonNode options;
    protected String language;
    protected Boolean isValid;
    protected String version;
    protected JsonNode customHook;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public String getSourceDatabase() {
        return sourceDatabase;
    }

    public void setSourceDatabase(String sourceDatabase) {
        this.sourceDatabase = sourceDatabase;
    }

    public String getTargetDatabase() {
        return targetDatabase;
    }

    public void setTargetDatabase(String targetDatabase) {
        this.targetDatabase = targetDatabase;
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

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public JsonNode getCustomHook() {
        return customHook;
    }

    public void setCustomHook(JsonNode customHook) {
        this.customHook = customHook;
    }

    public static StepModel fromJson(JsonNode node) {
        StepModel step = new StepModel();

        JSONObject jsonObject = new JSONObject(node);


        step.setType(jsonObject.getString("type"));
        step.setName(jsonObject.getString("name"));

        if (jsonObject.getString("id") != null) {
            step.setId(jsonObject.getString("id"));
        } else {
            step.setId(step.getName() + "-" + step.getType());
        }

        step.setDescription(jsonObject.getString("description"));
        step.setSourceDatabase(jsonObject.getString("sourceDatabase"));
        step.setTargetDatabase(jsonObject.getString("targetDatabase"));
        step.setOptions(jsonObject.getNode("options"));
        step.setLanguage("zxx");
        step.setIsValid(jsonObject.getBoolean("isValid"));
        step.setVersion(jsonObject.getString("version"));
        step.setCustomHook(jsonObject.getNode("customHook"));

        return step;
    }

    public JsonNode toJson() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();

        if (getId() != null) {
            node.put("id", getId());
        } else {
            node.put("id", getName() + "-" + getType());
        }

        if (getType() != null) {
            node.put("type", getType().toString());
        }

        node.put("name", getName());
        node.put("description", getDescription());
        node.put("sourceDatabase", getSourceDatabase());
        node.put("targetDatabase", getTargetDatabase());
        node.set("options", getOptions());
        node.put("language", getLanguage());
        node.put("isValid", getIsValid());
        node.put("version", getVersion());
        node.set("customHook", getCustomHook());

        return node;
    }

    public static Step transformToCoreStepModel(StepModel stepModel, JsonNode stepJson) {
        Step step = Step.create("dummy", Step.StepType.CUSTOM);

        step.setName(stepModel.getName());
        step.setType(Step.StepType.getStepType(stepModel.getType()));
        step.setDescription(stepModel.getDescription());
        step.setSourceDatabase(stepModel.getSourceDatabase());
        step.setDestinationDatabase(stepModel.getTargetDatabase());
        step.setCustomHook(stepModel.getCustomHook());

        if (stepModel.getVersion() != null) {
            step.setVersion(Integer.parseInt(stepModel.getVersion()));
        }

        JSONObject jsonObject = new JSONObject(stepJson);
        step.setOptions(jsonObject.getMap("options"));

        return step;
    }

    public static StepModel transformToWebStepModel(Step step) {
        StepModel stepModel = new StepModel();

        stepModel.setId(step.getName() + "-" + step.getType());
        stepModel.setName(step.getName());
        stepModel.setType(step.getType().toString().toLowerCase());
        stepModel.setDescription(step.getDescription());
        stepModel.setSourceDatabase(step.getSourceDatabase());
        stepModel.setTargetDatabase(step.getDestinationDatabase());
        stepModel.setCustomHook(step.getCustomHook());
        stepModel.setVersion(String.valueOf(step.getVersion()));
        stepModel.setLanguage(step.getLanguage());

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

        if (step.getType() != null) {
            defaultStep.setType(step.getType());
        }

        if (step.getDestinationDatabase() != null) {
            defaultStep.setDestinationDatabase(step.getDestinationDatabase());
        }

        if (step.getSourceDatabase() != null) {
            defaultStep.setSourceDatabase(step.getSourceDatabase());
        }

        if (step.getVersion() != null) {
            defaultStep.setVersion(step.getVersion());
        }

        if (step.getDescription() != null) {
            defaultStep.setDescription(step.getDescription());
        }

        if (step.getCustomHook() != null) {
            defaultStep.setCustomHook(step.getCustomHook());
        }

        if (step.getIdentifier() != null) {
            defaultStep.setIdentifier(step.getIdentifier());
        }
        return defaultStep;
    }
}
