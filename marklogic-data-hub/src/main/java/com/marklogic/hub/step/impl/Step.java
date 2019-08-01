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
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.util.json.JSONObject;
import org.apache.commons.lang3.StringUtils;

import java.util.Map;

public class Step {
    private String name;
    private String description;
    private Map<String, Object> options;
    private JsonNode customHook;
    private Integer retryLimit;
    private Integer batchSize;
    private Integer threadCount;
    private String stepDefinitionName;
    private StepDefinition.StepDefinitionType stepDefinitionType;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private JsonNode fileLocations;

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

    public Map<String, Object> getOptions() {
        return options;
    }

    public void setOptions(Map<String, Object> options) {
        this.options = options;
    }

    public JsonNode getCustomHook() {
        return customHook;
    }

    public void setCustomHook(JsonNode customHook) {
        this.customHook = customHook;
    }

    public Integer getRetryLimit() {
        return retryLimit;
    }

    public void setRetryLimit(Integer retryLimit) {
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

    public JsonNode getFileLocations() {
        return fileLocations;
    }

    public void setFileLocations(JsonNode fileLocations) {
        this.fileLocations = fileLocations;
    }

    public static Step deserialize(JsonNode json) {
        Step step = new Step();

        JSONObject jsonObject = new JSONObject(json);
        step.setStepDefinitionName(jsonObject.getString("stepDefinitionName"));
        step.setStepDefinitionType(StepDefinition.StepDefinitionType.getStepDefinitionType(jsonObject.getString("stepDefinitionType")));
        String stepName = jsonObject.getString("name");
        if (stepName == null) {
            stepName = step.getStepDefinitionName();
        }
        step.setName(stepName);
        step.setDescription(jsonObject.getString("description"));
        step.setOptions(jsonObject.getMap("options"));
        step.setCustomHook(jsonObject.getNode("customHook"));
        step.setRetryLimit(jsonObject.getInt("retryLimit"));
        step.setBatchSize(jsonObject.getInt("batchSize"));
        step.setThreadCount(jsonObject.getInt("threadCount"));
        step.setFileLocations(jsonObject.getNode("fileLocations"));
        return step;
    }

    public boolean isEqual(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || o.getClass() != this.getClass()) {
            return false;
        }
        Step that = (Step) o;
        if (!name.equalsIgnoreCase(that.name)) return false;
        if (StringUtils.isNotEmpty(description) ? !description.equals(that.description) : StringUtils.isNotEmpty(that.description)) {
            return false;
        }
        if (that.batchSize != null && that.batchSize.equals(batchSize) || that.retryLimit != null && that.retryLimit.equals(retryLimit) ||
            that.threadCount != null && that.threadCount.equals(threadCount) || !stepDefinitionType.equals(that.stepDefinitionType)) {
            return false;
        }

        if (StringUtils.isNotEmpty(stepDefinitionName) ? !stepDefinitionName.equals(that.stepDefinitionName) : StringUtils.isNotEmpty(that.stepDefinitionName)) {
            return false;
        }
        if (options == null && that.options != null || options != null && that.options == null || options.size() != that.options.size()) {
            return false;
        }
        if (options != null && that.options != null) {
            if (!options.entrySet().stream().allMatch(e -> e.getValue() instanceof JsonNode && ((JsonNode) e.getValue()).equals(that.options.get(e.getKey())))) {
                return false;
            }
        }
        if (customHook == null && that.customHook != null || customHook != null && that.customHook == null ||
            !customHook.equals(that.customHook)) {
            return false;
        }

        //fileLocations should not be null
        if (fileLocations != null && that.fileLocations != null) {
            if (!fileLocations.equals(that.fileLocations)) {
                return false;
            }
        }
        return true;
    }

    @JsonIgnore
    public boolean isMappingStep() {
        return StepDefinition.StepDefinitionType.MAPPING.equals(stepDefinitionType);
    }

    @JsonIgnore
    public boolean isCustomStep() {
        return StepDefinition.StepDefinitionType.CUSTOM.equals(stepDefinitionType);
    }

    /**
     * @return the name of the mapping if this is a mapping step and the mapping is defined in the step options
     */
    @JsonIgnore
    public String getMappingName() {
        if (isMappingStep() && options != null) {
            Object obj = options.get("mapping");
            if (obj != null && obj instanceof ObjectNode) {
                ObjectNode mapping = (ObjectNode)obj;
                if (mapping.has("name")) {
                    return mapping.get("name").asText();
                }
            }
        }

        return null;
    }
}
