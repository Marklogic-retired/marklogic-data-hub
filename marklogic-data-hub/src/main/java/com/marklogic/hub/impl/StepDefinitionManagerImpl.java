/*
 * Copyright (c) 2020 MarkLogic Corporation
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
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.StepDefinitionProvider;
import com.marklogic.hub.util.FileUtil;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONStreamWriter;
import com.marklogic.hub.util.json.JSONUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;

@Component
public class StepDefinitionManagerImpl extends LoggingObject implements StepDefinitionManager, StepDefinitionProvider {

    @Autowired
    private HubConfig hubConfig;

    private HubClient hubClient;
    private HubProject hubProject;

    public StepDefinitionManagerImpl() {}

    public StepDefinitionManagerImpl(HubConfig hubConfig) {
        this();
        this.hubConfig = hubConfig;
    }

    public StepDefinitionManagerImpl(HubClient hubClient, HubProject hubProject) {
        this.hubClient = hubClient;
        this.hubProject = hubProject;
    }

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

            Path dir = resolvePath(getHubProject().getStepDefinitionPath(stepDefinition.getType()), stepDefinition.getName());
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
        getArtifactService().setArtifact("stepDefinition", stepDefinition.getName(), JSONUtils.convertArtifactToJson(stepDefinition));
    }

    @Override
    public void deleteStepDefinition(StepDefinition stepDefinition) {
        final String name = stepDefinition.getName();
        Path dir = resolvePath(getHubProject().getStepDefinitionPath(stepDefinition.getType()), name);
        if (dir.toFile().exists()) {
            try {
                logger.info(format("Deleting step definition with name '%s' in directory: %s", name, dir.toFile()));
                FileUtils.deleteDirectory(dir.toFile());
            } catch (IOException e) {
                throw new DataHubProjectException(format("Could not delete step with name '%s'", name), e);
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

    //TODO: Should this look into db first ?
    @Override
    public StepDefinition getStepDefinition(String name, StepDefinition.StepDefinitionType type) {
        Path stepPath = resolvePath(getHubProject().getStepDefinitionPath(type), name);

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
        return (ArrayList<String>) FileUtil.listDirectFolders(getHubProject().getStepDefinitionPath(type));
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

    private HubProject getHubProject() {
        return hubProject != null ? hubProject : hubConfig.getHubProject();
    }

    private ArtifactService getArtifactService() {
        DatabaseClient client = hubClient != null ? hubClient.getStagingClient() : hubConfig.newStagingClient(null);
        return ArtifactService.on(client);
    }
}
