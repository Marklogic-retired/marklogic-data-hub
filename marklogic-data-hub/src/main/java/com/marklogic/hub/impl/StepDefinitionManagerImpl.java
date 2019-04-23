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

package com.marklogic.hub.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONStreamWriter;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;

@Component
public class StepDefinitionManagerImpl implements StepDefinitionManager {

    @Autowired
    private HubConfig hubConfig;

    @Override
    public void saveStepDefinition(StepDefinition stepDefinition) {
        saveStepDefinition(stepDefinition, false);
    }

    @Override
    public void saveStepDefinition(StepDefinition stepDefinition, boolean autoIncrement) {
        try {
            if (autoIncrement) {
                stepDefinition.incrementVersion();
            }

            Path dir = resolvePath(hubConfig.getStepsDirByType(stepDefinition.getType()), stepDefinition.getName());
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            String stepFileName = stepDefinition.getName() + STEP_DEFINITION_FILE_EXTENSION;
            File file = Paths.get(dir.toString(), stepFileName).toFile();
            FileOutputStream fileOutputStream = new FileOutputStream(file);
            JSONStreamWriter jw = new JSONStreamWriter(fileOutputStream);
            jw.write(stepDefinition);
        } catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not serialize Step for project.");
        } catch (IOException e) {
            throw new DataHubProjectException("Could not write Step to disk for project.");
        }
    }

    @Override
    public void deleteStepDefinition(StepDefinition stepDefinition) {
        Path dir = resolvePath(hubConfig.getStepsDirByType(stepDefinition.getType()), stepDefinition.getName());
        if (dir.toFile().exists()) {
            try {
                FileUtils.deleteDirectory(dir.toFile());
            } catch (IOException e) {
                throw new DataHubProjectException("Could not delete Step for project.");
            }
        }
    }

    @Override
    public ArrayList<StepDefinition> getStepDefinitions() {
        ArrayList<StepDefinition> stepList = new ArrayList<>();
        for (StepDefinition.StepDefinitionType stepDefinitionType : StepDefinition.StepDefinitionType.getStepDefinitionTypes()) {
            for (String name : getStepDefinitionNamesByType(stepDefinitionType)) {
                stepList.add(getStepDefinition(name, stepDefinitionType));
            }
        }
        return stepList;
    }

    @Override
    public StepDefinition getStepDefinition(String name, StepDefinition.StepDefinitionType type) {
        Path stepPath = resolvePath(hubConfig.getStepsDirByType(type), name);

        try {
            String targetFileName = name + STEP_DEFINITION_FILE_EXTENSION;
            InputStream inputStream = StepDefinitionManagerImpl.class.getResourceAsStream("/hub-internal-artifacts/step-definitions/" + type.toString().toLowerCase() + "/marklogic/" + targetFileName);
            if (inputStream == null) {
                inputStream = new FileInputStream(stepPath.resolve(targetFileName).toFile());
            }
            JsonNode node = JSONObject.readInput(inputStream);
            StepDefinition newStep = createStepDefinitionFromJSON(node);
            if (newStep != null && newStep.getName().length() > 0) {
                return newStep;
            }
        }
        catch (FileNotFoundException e) {
            return null;
        }
        catch (IOException e) {
            throw new DataHubProjectException("Could not read Step on disk.");
        }

        return null;
    }

    @Override
    public ArrayList<StepDefinition> getStepDefinitionsByType(StepDefinition.StepDefinitionType type) {
        ArrayList<StepDefinition> stepList = new ArrayList<>();
        for (String name : getStepDefinitionNamesByType(type)) {
            stepList.add(getStepDefinition(name, type));
        }
        return stepList;
    }

    @Override
    public ArrayList<String> getStepDefinitionNamesByType(StepDefinition.StepDefinitionType type) {
        return (ArrayList<String>) FileUtil.listDirectFolders(hubConfig.getStepsDirByType(type));
    }

    @Override
    public StepDefinition createStepDefinitionFromJSON(JsonNode json) {
        String stepDefName = null;
        String stepDefType = null;
        if(json.get("name") !=null && !json.get("name").isNull()) {
            stepDefName = json.get("name").asText();
        }
        else{
            throw new DataHubProjectException("StepDefinition should have a name");
        }
        if(json.get("type") !=null && !json.get("type").isNull()) {
            stepDefType = json.get("type").asText();
        }
        else{
            throw new DataHubProjectException("StepDefinition should have a type");
        }

        StepDefinition step;
        if(StringUtils.isNotEmpty(stepDefName) && StringUtils.isNotEmpty(stepDefType)) {
            step = StepDefinition.create(stepDefName, StepDefinition.StepDefinitionType.getStepDefinitionType(stepDefType));
        }
        else{
            step = StepDefinition.create("default", StepDefinition.StepDefinitionType.CUSTOM);
        }
        step.deserialize(json);
        return step;
    }

    private Path resolvePath(Path path, String more) {
        return path.resolve(more);
    }
}
