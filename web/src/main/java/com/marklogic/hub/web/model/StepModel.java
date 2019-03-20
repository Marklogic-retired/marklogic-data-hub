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
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.entity_services.JsonPojo;

import java.io.IOException;

public class StepModel extends JsonPojo {

    protected String id;
    protected Step.StepType type;
    protected String name;
    protected String description;
    protected String sourceDatabase;
    protected String targetDatabase;
    protected JsonNode config;
    protected String language;
    protected Boolean isValid;
    protected Boolean isRunning;
    protected String version;
    protected String sourceCollection;
    protected String sourceQuery;
    protected String targetEntity;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Step.StepType getType() {
        return type;
    }

    public void setType(Step.StepType type) {
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

    public JsonNode getConfig() {
        return config;
    }

    public void setConfig(JsonNode config) {
        this.config = config;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Boolean getValid() {
        return isValid;
    }

    public void setValid(Boolean valid) {
        isValid = valid;
    }

    public Boolean getRunning() {
        return isRunning;
    }

    public void setRunning(Boolean running) {
        isRunning = running;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getSourceCollection() {
        return sourceCollection;
    }

    public void setSourceCollection(String sourceCollection) {
        this.sourceCollection = sourceCollection;
    }

    public String getSourceQuery() {
        return sourceQuery;
    }

    public void setSourceQuery(String sourceQuery) {
        this.sourceQuery = sourceQuery;
    }

    public String getTargetEntity() {
        return targetEntity;
    }

    public void setTargetEntity(String targetEntity) {
        this.targetEntity = targetEntity;
    }

    public static StepModel fromJson(JsonNode node) {
        StepModel step = new StepModel();

        JSONObject jsonObject = new JSONObject(node);
        step.setId(jsonObject.getString("id"));
        step.setType(Step.StepType.getStepType(jsonObject.getString("type")));
        step.setName(jsonObject.getString("name"));
        step.setDescription(jsonObject.getString("description"));
        step.setSourceDatabase(jsonObject.getString("sourceDatabase"));
        step.setTargetDatabase(jsonObject.getString("targetDatabase"));
        step.setConfig(jsonObject.getNode("config"));
        step.setLanguage("zxx");
        step.setValid(jsonObject.getBoolean("isValid"));
        step.setRunning(jsonObject.getBoolean("isRunning"));
        step.setVersion(jsonObject.getString("version"));
        step.setSourceCollection(jsonObject.getString("sourceCollection"));
        step.setSourceQuery(jsonObject.getString("sourceQuery"));
        step.setTargetEntity(jsonObject.getString("targetEntity"));

        return step;
    }

    public JsonNode toJson() {
        try {
            return new JSONObject(this).jsonNode();
        } catch (IOException e) {
            throw new DataHubProjectException("Unable to get the Json Step object.");
        }
    }
}
