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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.step.AbstractStepDefinition;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.util.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class IngestionStepDefinitionImpl extends AbstractStepDefinition {

    private JsonNode fileLocations;

    public IngestionStepDefinitionImpl(String name) {
        setName(name);
        setType(StepDefinitionType.INGESTION);

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("inputFilePath", "");
        jsonObject.put("outputURIReplacement", "");
        jsonObject.put("inputFileType", "");
        this.fileLocations = jsonObject.jsonNode();
        setFileLocations(this.fileLocations);

        Map<String, Object> options = getOptions();
        options.put("sourceQuery", "cts.collectionQuery([])");
        options.put("outputFormat", "json");

        List<String> collectionName = new ArrayList<>();
        collectionName.add(name);
        options.put("collections", collectionName);

        options.put("targetDatabase", HubConfig.DEFAULT_STAGING_NAME);

        setModulePath("/data-hub/5/builtins/steps/ingestion/default/main.sjs");
    }

    public JsonNode getFileLocations() {
        return this.fileLocations;
    }

    public void setFileLocations(JsonNode fileLocations) {
        this.fileLocations = fileLocations;
    }

    @Override
    public void deserialize(JsonNode json) {
        JSONObject jsonObject = new JSONObject(json);

        if (jsonObject.isExist("fileLocations")) {
            setFileLocations(jsonObject.getNode("fileLocations"));
        }

        super.deserialize(jsonObject.jsonNode());
    }

    @Override
    public Step transformToStep(String stepName, StepDefinition stepDefinition, Step step) {
        step.setFileLocations(this.fileLocations);
        return super.transformToStep(stepName, stepDefinition, step);
    }

    @Override
    public StepDefinition transformFromStep(StepDefinition stepDefinition, Step step) {
        ((IngestionStepDefinitionImpl)stepDefinition).setFileLocations(step.getFileLocations());
        return super.transformFromStep(stepDefinition, step);
    }
}
