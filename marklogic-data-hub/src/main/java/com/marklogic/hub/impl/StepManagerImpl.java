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
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StepManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;

@Component
public class StepManagerImpl implements StepManager {

    @Autowired
    private HubConfig hubConfig;

    @Override
    public void saveStep(Step step) {
        try {
            String stepString = step.serialize();
            Path dir = resolvePath(hubConfig.getStepsDirByType(step.getType()), step.getName());
            if (!dir.toFile().exists()) {
                dir.toFile().mkdirs();
            }
            String stepFileName = step.getName() + STEP_FILE_EXTENSION;
            File file = Paths.get(dir.toString(), stepFileName).toFile();
            //create the object mapper to pretty print to disk
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
            Object json = objectMapper.readValue(stepString, Object.class);
            FileOutputStream fileOutputStream = new FileOutputStream(file);
            fileOutputStream.write(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(json).getBytes());
            fileOutputStream.flush();
            fileOutputStream.close();
        }
        catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not serialize Step for project.");
        }
        catch (IOException e) {
            throw new DataHubProjectException("Could not write Step to disk for project.");
        }
    }

    @Override
    public void deleteStep(Step step) {
        Path dir = resolvePath(hubConfig.getStepsDirByType(step.getType()), step.getName());
        if (dir.toFile().exists()) {
            try {
                FileUtils.deleteDirectory(dir.toFile());
            }
            catch (IOException e) {
                throw new DataHubProjectException("Could not delete Step for project.");
            }
        }
    }

    @Override
    public ArrayList<Step> getSteps() {
        ArrayList<Step> stepList = new ArrayList<>();
        for (Step.StepType stepType : Step.StepType.getStepTypes()) {
            for (String name : getStepNamesByType(stepType)) {
                stepList.add(getStep(name, stepType));
            }
        }
        return stepList;
    }

    @Override
    public Step getStep(String name, Step.StepType type) {
        Path stepPath = resolvePath(hubConfig.getStepsDirByType(type), name);

        try {
            String targetFileName = name + STEP_FILE_EXTENSION;
            FileInputStream fileInputStream = new FileInputStream(stepPath.resolve(targetFileName).toFile());
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode node = objectMapper.readTree(fileInputStream);
            Step newStep = createStepFromJSON(node);
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
    public ArrayList<Step> getStepsByType(Step.StepType type) {
        ArrayList<Step> stepList = new ArrayList<>();
        for (String name : getStepNamesByType(type)) {
            stepList.add(getStep(name, type));
        }
        return stepList;
    }

    @Override
    public ArrayList<String> getStepNamesByType(Step.StepType type) {
        return (ArrayList<String>) FileUtil.listDirectFolders(hubConfig.getStepsDirByType(type));
    }

    @Override
    public Step createStepFromJSON(JsonNode json) {
        Step step = Step.create("default", Step.StepType.CUSTOM);
        step.deserialize(json);
        return step;
    }

    private Path resolvePath(Path path, String more) {
        return path.resolve(more);
    }
}
