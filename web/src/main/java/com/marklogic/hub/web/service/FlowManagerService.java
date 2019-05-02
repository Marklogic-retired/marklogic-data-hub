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
package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONUtils;
import com.marklogic.hub.web.exception.BadRequestException;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.exception.NotFoundException;
import com.marklogic.hub.web.model.FlowJobModel.FlowJobs;
import com.marklogic.hub.web.model.FlowStepModel;
import com.marklogic.hub.web.model.StepModel;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.*;

@Service
public class FlowManagerService {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private FlowRunnerImpl flowRunner;

    @Autowired
    private StepDefinitionManagerService stepDefinitionManagerService;

    @Autowired
    private FlowJobService flowJobService;

    @Autowired
    HubConfigImpl hubConfig;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private Scaffolding scaffolding;

    public List<FlowStepModel> getFlows() {
        FlowRunnerChecker.getInstance(flowRunner);
        List<Flow> flows = flowManager.getFlows();
        List<FlowStepModel> flowSteps = new ArrayList<>();
        for (Flow flow : flows) {
            FlowStepModel fsm = getFlowStepModel(flow, false);
            flowSteps.add(fsm);
        }
        return flowSteps;
    }

    public FlowStepModel createFlow(String flowJson, boolean checkExists) throws IOException {
        JSONObject jsonObject;
        try {
            jsonObject = new JSONObject(flowJson);

            JSONUtils.trimText(jsonObject);
        }
        catch (IOException e) {
            throw new DataHubException("Unable to parse flow json string : " + e.getMessage());
        }

        if (!jsonObject.isExist("name") || StringUtils.isEmpty(jsonObject.getString("name"))) {
            throw new BadRequestException("Flow Name not provided. Flow Name is required.");
        }

        String flowName = jsonObject.getString("name");
        Flow flow = null;
        if (checkExists) {
            if (flowManager.isFlowExisted(flowName)) {
                throw new DataHubException("A Flow with " + flowName + " already exists.");
            }
            flow = new FlowImpl();
            flow.setName(flowName);
        }
        else {
            //for PUT updating
            flow = flowManager.getFlow(flowName);
            if (flow == null) {
                throw new DataHubException("Changing flow name not supported.");
            }
        }
        FlowStepModel.createFlowSteps(flow, jsonObject);
        flowManager.saveFlow(flow);

        FlowStepModel fsm = FlowStepModel.transformFromFlow(flow);

        Path dir = hubConfig.getFlowsDir();
        if (dir.toFile().exists()) {
            watcherService.watch(dir.toString());
        }
        if (checkExists) { //a new flow
            dataHubService.reinstallUserModules(hubConfig, null, null);
        }

        return fsm;
    }

    public FlowStepModel getFlow(String flowName, boolean fromRunFlow) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new NotFoundException(flowName + " not found!");
        }
        FlowStepModel fsm = getFlowStepModel(flow, fromRunFlow);
        return fsm;
    }

    private FlowStepModel getFlowStepModel(Flow flow, boolean fromRunFlow) {
        flowJobService.setupClient();
        FlowStepModel fsm = FlowStepModel.transformFromFlow(flow);
        if (flowRunner.getRunningFlow() != null && flow.getName().equalsIgnoreCase(flowRunner.getRunningFlow().getName())) {
            fsm.setLatestJob(FlowRunnerChecker.getInstance(flowRunner).getLatestJob());
        }
        FlowJobs flowJobs = flowJobService.getJobs(flow.getName());
        flowJobService.release();
        fsm.setJobs(flowJobs, fromRunFlow);
        return fsm;
    }

    public List<String> getFlowNames() {
        return flowManager.getFlowNames();
    }

    public void deleteFlow(String flowName) {
        flowManager.deleteFlow(flowName);
    }

    public List<StepModel> getSteps(String flowName) {
        Flow flow = flowManager.getFlow(flowName);
        Map<String, Step> stepMap = flowManager.getSteps(flow);

        List<StepModel> stepModelList = new ArrayList<>();
        for (String key : stepMap.keySet()) {
            Step step = stepMap.get(key);
            StepModel stepModel = StepModel.transformToWebStepModel(step);
            stepModelList.add(stepModel);
        }

        return stepModelList;
    }

    public StepModel getStep(String flowName, String stepId) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new NotFoundException(flowName + " not found!");
        }
        Step step = flow.getStepById(stepId);
        if (step == null) {
            throw new NotFoundException(stepId + " not found!");
        }
        StepModel stepModel = StepModel.transformToWebStepModel(step);
        return stepModel;
    }

    public StepModel createStep(String flowName, Integer stepOrder, String stepId, String stringStep) {
        StepModel stepModel;
        JsonNode stepJson;
        Flow flow = flowManager.getFlow(flowName);
        Step existingStep = flow.getStepById(stepId);

        if (existingStep == null && !StringUtils.isEmpty(stepId)) {
            throw new NotFoundException("Step " + stepId + " Not Found");
        }

        try {
            stepJson = JSONObject.readInput(stringStep);

            JSONUtils.trimText(stepJson);

            stepModel = StepModel.fromJson(stepJson);
        }
        catch (IOException e) {
            throw new BadRequestException("Error parsing JSON");
        }

        if (stepModel == null) {
            throw new BadRequestException();
        }

        Step step = StepModel.transformToCoreStepModel(stepModel, stepJson);

        if (step.getStepDefinitionType() == null) {
            throw new BadRequestException("Invalid Step Definition Type");
        }

        if (step.getStepDefinitionName() == null) {
            throw new BadRequestException("Invalid Step Definition Name");
        }

        if (stepId != null) {
            if (!stepId.equals(step.getName() + "-" + step.getStepDefinitionType())) {
                throw new BadRequestException("Changing step name or step type not supported.");
            }
        }

        // Only save step if step is of Custom type, for rest use the default steps.
        switch (step.getStepDefinitionType()) {
            case INGESTION:
                StepDefinition defaultIngestDefinition = getDefaultStepDefinitionFromResources("hub-internal-artifacts/step-definitions/ingestion/marklogic/default-ingestion.step.json", StepDefinition.StepDefinitionType.INGESTION);
                Step defaultIngest = defaultIngestDefinition.transformToStep(step.getName(), defaultIngestDefinition, new Step());
                step = StepModel.mergeFields(stepModel, defaultIngest, step);
                break;
            case MAPPING:
                StepDefinition defaultMappingDefinition = getDefaultStepDefinitionFromResources("hub-internal-artifacts/step-definitions/mapping/marklogic/default-mapping.step.json", StepDefinition.StepDefinitionType.MAPPING);
                Step defaultMapping = defaultMappingDefinition.transformToStep(step.getName(), defaultMappingDefinition, new Step());
                step = StepModel.mergeFields(stepModel, defaultMapping, step);
                break;
            case MASTERING:
                StepDefinition defaultMasterDefinition = getDefaultStepDefinitionFromResources("hub-internal-artifacts/step-definitions/mastering/marklogic/default-mastering.step.json", StepDefinition.StepDefinitionType.MASTERING);
                Step defaultMaster = defaultMasterDefinition.transformToStep(step.getName(), defaultMasterDefinition, new Step());
                step = StepModel.mergeFields(stepModel, defaultMaster, step);
                break;
            case CUSTOM:
                if (stepDefinitionManagerService.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType()) != null) {
                    StepDefinition oldStepDefinition = stepDefinitionManagerService.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
                    StepDefinition stepDefinition = oldStepDefinition.transformFromStep(oldStepDefinition, step);
                    stepDefinitionManagerService.saveStepDefinition(stepDefinition);
                }
                else {
                    String stepDefName = step.getStepDefinitionName();
                    StepDefinition.StepDefinitionType stepDefType = StepDefinition.StepDefinitionType.CUSTOM;
                    String modulePath = "/custom-modules/" + stepDefType.toString().toLowerCase() + "/" + stepDefName + "/main.sjs";

                    StepDefinition stepDefinition = StepDefinition.create(stepDefName, stepDefType);
                    stepDefinition = stepDefinition.transformFromStep(stepDefinition, step);

                    scaffolding.createCustomModule(stepDefName, stepDefType.toString());
                    stepDefinition.setModulePath(modulePath);
                    step.setModulePath(modulePath);

                    stepDefinitionManagerService.createStepDefinition(stepDefinition);
                }
                break;
            default:
                throw new BadRequestException("Invalid Step Type");
        }

        Map<String, Step> currSteps = flowManager.getSteps(flow);
        if (stepId != null) {
            String key = getStepKeyInStepMap(flow, stepId);
            if (StringUtils.isNotEmpty(key)) {
                currSteps.put(key, step);
            }
            flowManager.setSteps(flow, currSteps);
        }
        else {
            if (stepOrder == null || stepOrder > currSteps.size()) {
                currSteps.put(String.valueOf(currSteps.size() + 1), step);
            }
            else {
                Map<String, Step> newSteps = new LinkedHashMap<>();
                final Integer[] count = {1};
                Step finalStep = step;
                currSteps.values().forEach(s -> {
                    if (count[0].equals(stepOrder)) {
                        newSteps.put(String.valueOf(count[0]++), finalStep);
                    }
                    newSteps.put(String.valueOf(count[0]), s);
                    ++count[0];
                });
                flowManager.setSteps(flow, newSteps);
            }
        }

        if (existingStep != null && existingStep.isEqual(step)) {
            return StepModel.transformToWebStepModel(existingStep);
        }

        flowManager.saveFlow(flow);
        return StepModel.transformToWebStepModel(step);
    }

    public void deleteStep(String flowName, String stepId) {
        Flow flow = flowManager.getFlow(flowName);
        String key = getStepKeyInStepMap(flow, stepId);

        if (key != null && !key.isEmpty()) {
            try {
                Map<String, Step> stepMap = flowManager.getSteps(flow);
                Step step = stepMap.remove(key);
                flowManager.setSteps(flow, stepMap);
                flowManager.saveFlow(flow);

//                // Don't delete the Step from the filesystem so that we can later on reuse the step.
//                if (step.getType().equals(Step.StepDefinitionType.CUSTOM)) {
//                    stepManagerService.deleteStepDefinition(step);
//                }
            }
            catch (DataHubProjectException e) {
                throw new NotFoundException(e.getMessage());
            }
        }
        else {
            throw new BadRequestException("Invalid Step Id");
        }

    }

    public FlowStepModel runFlow(String flowName, List<String> steps) {
        RunFlowResponse resp = null;
        if (steps == null || steps.size() == 0) {
            resp = flowRunner.runFlow(flowName);
        }
        else {
            Flow flow = flowManager.getFlow(flowName);
            List<String> restrictedSteps = new ArrayList<>();
            steps.forEach((step) -> restrictedSteps.add(this.getStepKeyInStepMap(flow, step)));
            resp = flowRunner.runFlow(flowName, restrictedSteps);
        }
        return getFlow(flowName, true);
    }

    public FlowStepModel stop(String flowName) {
        List<String> jobIds = flowRunner.getQueuedJobIdsFromFlow(flowName);
        Iterator<String> itr = jobIds.iterator();
        if (!itr.hasNext()) {
            throw new BadRequestException("Flow not running.");
        }
        while (itr.hasNext()) {
            flowRunner.stopJob(itr.next());
        }
        return getFlow(flowName, true);
    }


    private String getStepKeyInStepMap(Flow flow, String stepId) {
        // Split on the last occurrence of "-"
        String[] stepStr = stepId.split("-(?!.*-)");

        if (stepStr.length == 2) {
            String name = stepStr[0];
            String type = stepStr[1];
            String[] key = new String[1];

            flowManager.getSteps(flow).forEach((k, v) -> {
                if (name.equals(v.getName()) && type.equalsIgnoreCase(v.getStepDefinitionType().toString())) {
                    key[0] = k;
                }
            });

            return key[0];
        }

        return null;
    }

    private StepDefinition getDefaultStepDefinitionFromResources(String resourcePath, StepDefinition.StepDefinitionType stepDefinitionType) {
        try {
            InputStream in = FlowManagerService.class.getClassLoader().getResourceAsStream(resourcePath);
            JSONObject jsonObject = new JSONObject(IOUtils.toString(in));
            StepDefinition defaultStep = StepDefinition.create(stepDefinitionType.toString(), stepDefinitionType);
            defaultStep.deserialize(jsonObject.jsonNode());

            return defaultStep;
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
