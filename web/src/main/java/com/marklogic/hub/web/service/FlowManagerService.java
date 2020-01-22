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
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONUtils;
import com.marklogic.hub.validate.CustomStepValidator;
import com.marklogic.hub.web.exception.BadRequestException;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.exception.NotFoundException;
import com.marklogic.hub.web.model.FlowStepModel;
import com.marklogic.hub.web.model.StepModel;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.EnumUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FlowManagerService {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    public static final String FLOW_FILE_EXTENSION = ".flow.json";

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private FlowRunnerImpl flowRunner;

    @Autowired
    private StepDefinitionManagerService stepDefinitionManagerService;

    @Autowired
    HubConfigImpl hubConfig;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private Scaffolding scaffolding;

    @Autowired
    private AsyncFlowService asyncFlowService;

    private CustomStepValidator customStepValidator = null;

    public List<FlowStepModel> getFlows() {
        return asyncFlowService.getFlows(true);
    }

    public FlowStepModel createFlow(String flowJson, boolean checkExists) throws IOException {
        JSONObject jsonObject;
        try {
            jsonObject = new JSONObject(flowJson);

            JSONUtils.trimText(jsonObject, "separator");
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
        return fsm;
    }

    public FlowStepModel getFlow(String flowName, boolean fromRunFlow) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new NotFoundException(flowName + " not found!");
        }
        FlowStepModel fsm = asyncFlowService.getFlowStepModel(flow, fromRunFlow, null);
        return fsm;
    }

    public List<String> getFlowNames() {
        return flowManager.getFlowNames();
    }

    public JsonNode validateStep(String flowName, String stepId){
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new NotFoundException("Could not find a flow with a name of " + flowName);
        }
        String stepNum = getStepKeyInStepMap(flow, stepId);
        return getCustomStepValidator().validate(flowName, stepNum);
    }

    public void deleteFlow(String flowName) {
        flowManager.deleteFlow(flowName);
        dataHubService.deleteDocument("/flows/" + flowName + FLOW_FILE_EXTENSION, DatabaseKind.STAGING);
        dataHubService.deleteDocument("/flows/" + flowName + FLOW_FILE_EXTENSION, DatabaseKind.FINAL);
    }

    public List<StepModel> getSteps(String flowName) {
        Flow flow = flowManager.getFlow(flowName);
        Map<String, Step> stepMap = flow.getSteps();

        List<StepModel> stepModelList = new ArrayList<>();
        for (String key : stepMap.keySet()) {
            Step step = stepMap.get(key);
            StepModel stepModel = transformStepToWebModel(step);
            stepModelList.add(stepModel);
        }

        return stepModelList;
    }

    public StepModel getStep(String flowName, String stepId) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new NotFoundException(flowName + " not found.");
        }

        Step step = flow.getStep(getStepKeyInStepMap(flow, stepId));
        if (step == null) {
            throw new NotFoundException(stepId + " not found.");
        }

        return transformStepToWebModel(step);
    }

    public StepModel createStep(String flowName, Integer stepOrder, String stepId, String stringStep) {
        StepModel stepModel;
        JsonNode stepJson;
        Flow flow = flowManager.getFlow(flowName);
        Step existingStep = flow.getStep(getStepKeyInStepMap(flow, stepId));

        if (existingStep == null && !StringUtils.isEmpty(stepId)) {
            throw new NotFoundException("Step " + stepId + " Not Found");
        }

        try {
            stepJson = JSONObject.readInput(stringStep);

            JSONUtils.trimText(stepJson, "separator");

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
        if(!EnumUtils.isValidEnumIgnoreCase(StepDefinition.StepDefinitionType.class, step.getStepDefinitionType().toString())) {
            throw new BadRequestException("Invalid Step Type");
        }

        step = upsertStepDefinition(stepModel, step);

        Map<String, Step> currSteps = flow.getSteps();
        if (stepId != null) {
            String key = getStepKeyInStepMap(flow, stepId);
            if (StringUtils.isNotEmpty(key)) {
                currSteps.put(key, step);
            }
            flow.setSteps(currSteps);
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
                flow.setSteps(newSteps);
            }
        }

        if (existingStep != null && existingStep.isEqual(step)) {
            return transformStepToWebModel(existingStep);
        }

        flowManager.saveFlow(flow);
        return transformStepToWebModel(step);
    }

    protected Step mergeDefaultStepDefinitionIntoStep(StepModel stepModel, Step step) {
        String stepType = step.getStepDefinitionType().toString().toLowerCase();
        StepDefinition defaultStepDefinition = getDefaultStepDefinitionFromResources("hub-internal-artifacts/step-definitions/" + stepType + "/marklogic/"+ step.getStepDefinitionName() +".step.json", step.getStepDefinitionType());
        Step defaultStep = defaultStepDefinition.transformToStep(step.getName(), defaultStepDefinition, new Step());
        return StepModel.mergeFields(stepModel, defaultStep, step);
    }

    protected Step upsertStepDefinition(StepModel stepModel, Step step) {
        if (stepDefinitionManagerService.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType()) != null) {
            String stepType = step.getStepDefinitionType().toString().toLowerCase();
            if(step.getStepDefinitionName().equalsIgnoreCase("default-" + stepType) || "entity-services-mapping".equalsIgnoreCase(step.getStepDefinitionName())) {
                step = mergeDefaultStepDefinitionIntoStep(stepModel, step);
            }
            else {
                StepDefinition oldStepDefinition = stepDefinitionManagerService.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
                StepDefinition stepDefinition = transformFromStep(oldStepDefinition, step, stepModel);
                stepDefinitionManagerService.saveStepDefinition(stepDefinition);
            }
        }
        else {
            String stepDefName = step.getStepDefinitionName();
            StepDefinition.StepDefinitionType stepDefType = step.getStepDefinitionType();
            String modulePath = "/custom-modules/" + stepDefType.toString().toLowerCase() + "/" + stepDefName + "/main.sjs";

            StepDefinition stepDefinition = StepDefinition.create(stepDefName, stepDefType);
            stepDefinition = transformFromStep(stepDefinition, step, stepModel);

            scaffolding.createCustomModule(stepDefName, stepDefType.toString());
            stepDefinition.setModulePath(modulePath);
            stepDefinitionManagerService.createStepDefinition(stepDefinition);
        }
        return step;
    }

    public void deleteStep(String flowName, String stepId) {
        Flow flow = flowManager.getFlow(flowName);
        String key = getStepKeyInStepMap(flow, stepId);

        if (StringUtils.isEmpty(key)) {
            throw new BadRequestException("Invalid Step Id");
        }

        try {
            flowManager.deleteStep(flow, key);
        }
        catch (DataHubProjectException e) {
            throw new NotFoundException(e.getMessage());
        }
    }

    /**
     * This is synchronized because Coverity is reporting that flowManagerService is being modified without proper
     * synchronization when it's invoked by FlowController.
     *
     * @param flowName
     * @param steps
     * @return
     */
    public synchronized FlowStepModel runFlow(String flowName, List<String> steps) {
        if (steps == null || steps.size() == 0) {
            flowRunner.runFlow(flowName);
        }
        else {
            Flow flow = flowManager.getFlow(flowName);
            List<String> restrictedSteps = new ArrayList<>();
            steps.forEach((step) -> restrictedSteps.add(this.getStepKeyInStepMap(flow, step)));
            flowRunner.runFlow(flowName, restrictedSteps);
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
        return getFlow(flowName, false);
    }

    /*
    The core and web models for steps are different, webModel has 'modulePath' which provides the uri of the main.sjs
    whereas it is not present in the core step model. Hence the following 2 transform methods additionally are meant to
    set modulePaths in 'StepModel' and 'StepDefinition' .
     */
    private StepModel transformStepToWebModel(Step step) {
        StepModel stepModel = StepModel.transformToWebStepModel(step);
        StepDefinition stepDef = stepDefinitionManagerService.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
        stepModel.setModulePath(stepDef.getModulePath());
        return stepModel;
    }

    private StepDefinition transformFromStep(StepDefinition stepDefinition, Step step, StepModel stepModel) {
        StepDefinition newStepDefinition = stepDefinition.transformFromStep(stepDefinition, step);
        newStepDefinition.setModulePath(stepModel.getModulePath());
        return newStepDefinition;
    }

    private String getStepKeyInStepMap(Flow flow, String stepId) {
        if (flow == null || StringUtils.isEmpty(stepId)) {
            return null;
        }

        // Split on the last occurrence of "-"
        String[] stepStr = stepId.split("-(?!.*-)");

        if (stepStr.length == 2) {
            String name = stepStr[0];
            String type = stepStr[1];
            String[] key = new String[1];

            flow.getSteps().forEach((k, v) -> {
                if (name.equals(v.getName()) && type.equalsIgnoreCase(v.getStepDefinitionType().toString())) {
                    key[0] = k;
                }
            });

            return key[0];
        }

        return null;
    }

    private StepDefinition getDefaultStepDefinitionFromResources(String resourcePath, StepDefinition.StepDefinitionType stepDefinitionType) {
        try (InputStream in = FlowManagerService.class.getClassLoader().getResourceAsStream(resourcePath)) {
            JSONObject jsonObject = new JSONObject(IOUtils.toString(in));
            StepDefinition defaultStep = StepDefinition.create(stepDefinitionType.toString(), stepDefinitionType);
            defaultStep.deserialize(jsonObject.jsonNode());
            return defaultStep;
        }
        catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private synchronized CustomStepValidator getCustomStepValidator() {
        if (customStepValidator == null) {
            customStepValidator = new CustomStepValidator(hubConfig.newStagingClient());
        }
        return customStepValidator;
    }
}
