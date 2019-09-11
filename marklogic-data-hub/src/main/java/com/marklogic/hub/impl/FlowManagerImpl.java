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

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONStreamWriter;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class FlowManagerImpl extends LoggingObject implements FlowManager {

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private MappingManager mappingManager;

    @Autowired
    private StepDefinitionManager stepDefinitionManager;

    public void setHubConfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    @Override
    public Flow getFlow(String flowName) {
        Path flowPath = Paths.get(hubConfig.getFlowsDir().toString(), flowName + FLOW_FILE_EXTENSION);
        InputStream inputStream = null;
        // first, let's check our resources
        inputStream = getClass().getResourceAsStream("/hub-internal-artifacts/flows/" + flowName + FLOW_FILE_EXTENSION);
        if (inputStream == null) {
            try {
                inputStream = FileUtils.openInputStream(flowPath.toFile());
            } catch (FileNotFoundException e) {
                return null;
            } catch (IOException e) {
                throw new DataHubProjectException(e.getMessage());
            }
        }
        JsonNode node;
        try {
            node = JSONObject.readInput(inputStream);
        } catch (IOException e) {
            throw new DataHubProjectException("Unable to read flow: " + e.getMessage());
        }
        Flow newFlow = createFlowFromJSON(node);
        if (newFlow != null && newFlow.getName().length() > 0) {
            return newFlow;
        } else {
            throw new DataHubProjectException(flowName + " is not a valid flow");
        }
    }

    @Override
    public String getFlowAsJSON(String flowName) {
        try {
            return JSONObject.writeValueAsString(getFlow(flowName));
        } catch (JsonProcessingException e) {
            throw new DataHubProjectException("Unable to serialize flow object.");
        }
    }

    @Override
    public List<Flow> getFlows() {
        List<String> flowNames = getFlowNames();
        List<Flow> flows = new ArrayList<>();
        for (String flow : flowNames) {
            flows.add(getFlow(flow));
        }
        return flows;
    }

    @Override
    public List<String> getFlowNames() {
        // Get all the files with flow.json extension from flows dir
        File flowsDir = hubConfig.getFlowsDir().toFile();
        if (flowsDir == null || !flowsDir.exists()) {
            return new ArrayList<>();
        }

        List<File> files = (List<File>) FileUtils.listFiles(flowsDir, new String[]{"flow.json"}, false);
        List<String> flowNames = files.stream()
            .map(f -> f.getName().replaceAll("(.+)\\.flow\\.json", "$1"))
            .collect(Collectors.toList());

        return flowNames;
    }

    @Override
    public Flow createFlow(String flowName) {
        Flow flow = createFlowFromJSON(getFlowScaffolding());
        flow.setName(flowName);
        return flow;
    }

    @Override
    public Flow createFlowFromJSON(String json) {
        JsonNode node = null;
        try {
            node = JSONObject.readInput(json);
        } catch (JsonParseException e) {
            throw new DataHubProjectException("Unable to parse flow json string : " + e.getMessage());
        } catch (JsonMappingException e1) {
            throw new DataHubProjectException("Unable to parse flow json string : " + e1.getMessage());
        } catch (IOException e2) {
            throw new DataHubProjectException("Unable to parse flow json string : " + e2.getMessage());
        }
        return createFlowFromJSON(node);
    }

    @Override
    public Flow createFlowFromJSON(JsonNode json) {
        Flow flow = new FlowImpl();
        flow.deserialize(json);
        return flow;
    }

    @Override
    public void deleteFlow(String flowName) {
        File flowFile = Paths.get(hubConfig.getFlowsDir().toString(), flowName + FLOW_FILE_EXTENSION).toFile();
        if (flowFile.exists()) {
            try {
                FileUtils.forceDelete(flowFile);
            } catch (IOException e) {
                throw new DataHubProjectException("Could not delete flow " + flowName);
            }
        } else {
            throw new DataHubProjectException("The specified flow doesn't exist.");
        }
    }

    @Override
    public void deleteStep(Flow flow, String key) {
        Map<String, Step> stepMap = flow.getSteps();
        int stepOrder = Integer.parseInt(key);

        Step removedStep = null;

        if (stepOrder == stepMap.size()) {
            removedStep = stepMap.remove(key);
        } else {
            Map<String, Step> newStepMap = new LinkedHashMap<>();
            final int[] newStepOrder = {1};
            final int[] stepIndex = {1};
            for (Step step : stepMap.values()) {
                if (stepIndex[0] != stepOrder) {
                    newStepMap.put(String.valueOf(newStepOrder[0]++), step);
                } else {
                    removedStep = step;
                }
                stepIndex[0]++;
            }
            stepMap = newStepMap;
        }

        flow.setSteps(stepMap);
        saveFlow(flow);
        deleteRelatedStepArtifacts(flow, removedStep);
    }

    @Override
    public void saveFlow(Flow flow) {
        File flowsDir = hubConfig.getFlowsDir().toFile();
        if (!flowsDir.exists()) {
            flowsDir.mkdirs();
        }
        try {
            String flowFileName = flow.getName() + FLOW_FILE_EXTENSION;
            File file = Paths.get(hubConfig.getFlowsDir().toString(), flowFileName).toFile();

            FileOutputStream fileOutputStream = new FileOutputStream(file);
            JSONStreamWriter writer = new JSONStreamWriter(fileOutputStream);
            writer.write(flow);

        } catch (JsonProcessingException e) {
            throw new DataHubProjectException("Could not serialize flow.");
        } catch (IOException e) {
            throw new DataHubProjectException("Could not save flow to disk.");
        }
    }

    @Override
    public boolean isFlowExisted(String flowName) {
        File flowFile = Paths.get(hubConfig.getFlowsDir().toString(), flowName + FLOW_FILE_EXTENSION).toFile();
        if (flowFile.exists()) {
            return true;
        }
        return false;
    }

    @Deprecated
    @Override
    public Map<String, Step> getSteps(Flow flow) {
        return flow.getSteps();
    }

    @Override
    @Deprecated
    public Step getStep(Flow flow, String stepNum) {
        return flow.getStep(stepNum);
    }

    @Override
    @Deprecated
    public void setSteps(Flow flow, Map<String, Step> stepMap) {
        flow.setSteps(stepMap);
    }

    /**
     * For certain step types, when the step is deleted, we need to do some cleanup of artifacts on disk and in the
     * staging and final databases.
     *
     * So for a mapping - we need to get the name of the mapping and then see if any other flow references that mapping.
     *
     * For custom Mapping/Ingestion/Mastering, the type is not Custom, so we need to check for such step definition types
     * to delete the step definition artifacts
     *
     * @param flow
     * @param removedStep
     */
    protected void deleteRelatedStepArtifacts(Flow flow, Step removedStep) {
        if (removedStep == null) {
            return;
        }

        StepDefinition.StepDefinitionType stepTypeOfRemovedStep = StepDefinition.StepDefinitionType.getStepDefinitionType(
                                                    removedStep.getStepDefinitionType().toString()
                                                    );

        if (removedStep.isMappingStep() && !mappingIsReferencedByAFlow(removedStep) && !isCustomMapping(removedStep)) {
            deleteMappingArtifacts(flow, removedStep);
        } else if(!removedStep.isCustomStep() && !stepIsReferencedByAFlow(removedStep.getName(), stepTypeOfRemovedStep)) {
            deleteStepDefinitionArtifacts(removedStep, stepTypeOfRemovedStep);
        } else if (removedStep.isCustomStep() && !stepIsReferencedByAFlow(removedStep.getName(), StepDefinition.StepDefinitionType.CUSTOM)) {
            deleteStepDefinitionArtifacts(removedStep, stepTypeOfRemovedStep);
        }
    }

    /**
     * @param stepName
     * @param stepType
     * @return true if any flow has a step with the given name and type
     */
    protected boolean stepIsReferencedByAFlow(String stepName, StepDefinition.StepDefinitionType stepType) {
        for (Flow flow : getFlows()) {
            for (Step step : flow.getSteps().values()) {
                if (stepType.equals(step.getStepDefinitionType()) && stepName.equals(step.getName())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     *
     * @param removedStep
     * @return true if any flow has a step with a mapping with the same name as the mapping in the given step
     */
    protected boolean mappingIsReferencedByAFlow(Step removedStep) {
        String mappingName = removedStep.getMappingName();
        if (mappingName == null) {
            return false;
        }
        for (Flow flow: getFlows()) {
            for (Step step : flow.getSteps().values()) {
                if (mappingName.equals(step.getMappingName())) {
                    return true;
                }
            }
        }
        return false;
    }

    protected boolean isCustomMapping(Step removedStep) {
        String modulePath = "/custom-modules/mapping/"+removedStep.getStepDefinitionName()+"/main.sjs";
        return stepDefinitionManager.getStepDefinition(removedStep.getStepDefinitionName(), StepDefinition.StepDefinitionType.MAPPING).getModulePath().equals(modulePath);
    }

    protected void deleteMappingArtifacts(Flow flow, Step removedStep) {
        logger.info("Deleting mapping as it's no longer referenced by any flows: " + removedStep.getName());
        final String mappingName = removedStep.getMappingName();
        mappingManager.deleteMapping(mappingName);
        deleteDocumentsInDirectory(format("/mappings/%s/", mappingName));
    }

    protected void deleteStepDefinitionArtifacts(Step removedStep, StepDefinition.StepDefinitionType stepTypeOfRemovedStep) {
        logger.info("Deleting custom step as it's no longer referenced by any flows: " + removedStep.getName() +
            ". The module associated with this step will not be deleted in case other modules refer to it.");
        StepDefinition stepDef = StepDefinition.create(removedStep.getName(), stepTypeOfRemovedStep);
        stepDefinitionManager.deleteStepDefinition(stepDef);
        deleteDocumentsInDirectory(format("/step-definitions/%s/%s/", stepDef.getType().toString(), stepDef.getName()));
    }

    protected void deleteDocumentsInDirectory(String directory) {
        final String query = format("declareUpdate(); " +
                "cts.uris(null, null, cts.directoryQuery('%s', 'infinity'))." +
                "toArray().forEach(uri => xdmp.documentDelete(uri))",
            directory
        );

        if (logger.isInfoEnabled()) {
            logger.info(format("Deleting documents in directory '%s' in staging database", directory));
        }
        DatabaseClient stagingClient = hubConfig.newStagingClient();
        try {
            stagingClient.newServerEval().javascript(query).evalAs(String.class);
        } finally {
            stagingClient.release();
        }

        if (logger.isInfoEnabled()) {
            logger.info(format("Deleting documents in directory '%s' in final database", directory));
        }
        DatabaseClient finalClient = hubConfig.newFinalClient();
        try {
            finalClient.newServerEval().javascript(query).evalAs(String.class);
        } finally {
            finalClient.release();
        }
    }

    private JsonNode flowScaffolding = null;

    private JsonNode getFlowScaffolding() {
        if (flowScaffolding != null) {
            return flowScaffolding;
        } else {
            String flowScaffoldingSrcFile = "scaffolding/flowName.flow.json";
            InputStream inputStream = FlowManagerImpl.class.getClassLoader()
                .getResourceAsStream(flowScaffoldingSrcFile);
            try {
                this.flowScaffolding = JSONObject.readInput(inputStream);
                return this.flowScaffolding;
            } catch (IOException e) {
                throw new DataHubProjectException("Unable to parse flow json string : " + e.getMessage());
            }
        }
    }
}
