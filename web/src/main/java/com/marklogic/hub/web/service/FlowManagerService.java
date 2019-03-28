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
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.exception.BadRequestException;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.exception.NotFoundException;
import com.marklogic.hub.web.model.FlowStepModel;
import com.marklogic.hub.web.model.StepModel;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FlowManagerService {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private FlowRunner flowRunner;

    @Autowired
    private HubConfigImpl hubConfig;

    @Autowired
    private StepManagerService stepManagerService;

    public List<FlowStepModel> getFlows() {
        List<Flow> flows = flowManager.getFlows();
        List<FlowStepModel> flowSteps = new ArrayList<>();
        for (Flow flow : flows) {
            FlowStepModel fsm = FlowStepModel.transformFromFlow(flow);
            flowSteps.add(fsm);
        }
        return flowSteps;
    }

    public FlowStepModel createFlow(String flowJson, boolean checkExists)  {
        JSONObject jsonObject = null;
        try {
            jsonObject = new JSONObject(flowJson);
        } catch (IOException e) {
            throw new DataHubException("Unable to parse flow json string : "+ e.getMessage());
        }
        String flowName = jsonObject.getString("name");
        Flow flow = null;
        if (checkExists) {
            if (flowManager.isFlowExisted(flowName)) {
                throw new DataHubException(flowName + " is existed.");
            }
            flow = new FlowImpl();
            flow.setName(flowName);
        } else if (!checkExists) { //for PUT updating
            flow = flowManager.getFlow(flowName);
            if (flow == null) {
                throw new DataHubException("Flow request payload is invalid.");
            }
        }

        FlowStepModel.createFlowSteps(flow, jsonObject);

        flowManager.saveFlow(flow);

        FlowStepModel fsm = FlowStepModel.transformFromFlow(flow);
        return fsm;
    }

    public FlowStepModel getFlow(String flowName) {
        Flow flow = flowManager.getFlow(flowName);
        FlowStepModel fsm = FlowStepModel.transformFromFlow(flow);
        return fsm;
    }

    public List<String> getFlowNames() {
        return flowManager.getFlowNames();
    }

    public void deleteFlow(String flowName) {
        flowManager.deleteFlow(flowName);
    }

    public List<StepModel> getSteps(String flowName) {
        Map<String, Step> stepMap = flowManager.getSteps(flowName);

        List<StepModel> stepModelList = new ArrayList<>();
        for (String key : stepMap.keySet()) {
            Step step = stepMap.get(key);
            StepModel stepModel = null;

            try {
                stepModel = convertToWebModel(step);
            } catch (IOException e) {
                e.printStackTrace();
            }

            stepModelList.add(stepModel);
        }

        return stepModelList;
    }

    public StepModel createStep(String flowName, Integer stepOrder, String stepId, String stringStep) {
        StepModel stepModel;
        JsonNode stepJson;
        try {
            stepJson = JSONObject.readInput(stringStep);
            stepModel = StepModel.fromJson(stepJson);
        } catch (IOException e) {
            throw new BadRequestException("Error parsing JSON");
        }

        if (stepModel != null) {
            Step step = StepModel.transformToCoreStepModel(stepModel, stepJson);

            // Only save step if step is of Custom type, for rest use the default steps.
            switch (step.getType()) {
                case INGEST:
                    Step defaultIngest = getDefaultStepFromResources("hub-internal-artifacts/steps/ingest/marklogic/default-ingest.step.json", Step.StepType.INGEST);
                    step = StepModel.mergeFields(stepModel, defaultIngest, step);
                    break;
                case MAPPING:
                    Step defaultMapping = getDefaultStepFromResources("hub-internal-artifacts/steps/mapping/marklogic/default-mapping.step.json", Step.StepType.MAPPING);
                    step = StepModel.mergeFields(stepModel, defaultMapping, step);
                    break;
                case CUSTOM:
                    if (stepManagerService.getStep(step.getName(), step.getType()) != null) {
                        stepManagerService.saveStep(step);
                    } else {
                        stepManagerService.createStep(step);
                    }
                    break;
                default:
                    throw new BadRequestException("Invalid Step Type");
            }

            if (stepOrder != null) {
                // Create
                try {
                    Map<String, Step> stepMap = flowManager.getSteps(flowName);
                    if (!stepMap.containsKey(String.valueOf(stepOrder))) {
                        stepMap.put(String.valueOf(stepOrder), step);
                        Flow flow = flowManager.setSteps(flowName, stepMap);
                        flowManager.saveFlow(flow);
                    } else {
                        throw new BadRequestException("Invalid Step Order. A Step is already present at Step Order: " + stepOrder);
                    }
                } catch (DataHubProjectException e) {
                    throw new NotFoundException(e.getMessage());
                }
            } else if (stepId != null) {
                // Save
                try {
                    String key = getStepKeyInStepMap(flowName, stepId);

                    if (key != null && !key.isEmpty()) {
                        Map<String, Step> stepMap = flowManager.getSteps(flowName);
                        stepMap.put(key, step);
                        Flow flow = flowManager.setSteps(flowName, stepMap);
                        flowManager.saveFlow(flow);
                    } else {
                        throw new BadRequestException("Invalid Step Id");
                    }
                } catch (DataHubProjectException e) {
                    throw new NotFoundException(e.getMessage());
                }
            } else {
                //  Create at last
                try {
                    Map<String, Step> stepMap = flowManager.getSteps(flowName);

                    String key = "1";
                    if (stepMap.size() != 0) {
                        key = (String) stepMap.keySet().toArray()[stepMap.size() - 1];
                        key = String.valueOf(Integer.parseInt(key) + 1);
                    }

                    if (!stepMap.containsKey(key)) {
                        stepMap.put(key, step);
                        Flow flow = flowManager.setSteps(flowName, stepMap);
                        flowManager.saveFlow(flow);
                    } else {
                        throw new BadRequestException("Invalid Step Order");
                    }
                } catch (DataHubProjectException e) {
                    throw new NotFoundException(e.getMessage());
                }
            }
        } else {
            throw new BadRequestException();
        }

        return stepModel;
    }

    public void deleteStep(String flowName, String stepId) {
        String key = getStepKeyInStepMap(flowName, stepId);

        if (key != null && !key.isEmpty()) {
            try {
                Map<String, Step> stepMap = flowManager.getSteps(flowName);
                Step step = stepMap.remove(key);
                Flow flow = flowManager.setSteps(flowName, stepMap);
                flowManager.saveFlow(flow);

//                // Don't delete the Step from the filesystem so that we can later on reuse the step.
//                if (step.getType().equals(Step.StepType.CUSTOM)) {
//                    stepManagerService.deleteStep(step);
//                }
            } catch (DataHubProjectException e) {
                throw new NotFoundException(e.getMessage());
            }
        } else {
            throw new BadRequestException("Invalid Step Id");
        }

    }

    public String runFlow(String flowName, String[] steps) {
        RunFlowResponse resp = null;
        if (steps == null) {
            resp = flowRunner.runFlow(flowName);
        } else {
            resp = flowRunner.runFlow(flowName, Arrays.asList(steps));
        }
        return resp.getJobId();
    }

    private StepModel convertToWebModel(Step step) throws IOException {
        StepModel stepModel = new StepModel();

        stepModel.setId(step.getName() + "-" + step.getType());
        stepModel.setType(step.getType());
        stepModel.setName(step.getName());
        stepModel.setDescription(step.getDescription());
        stepModel.setSourceDatabase(step.getSourceDatabase());
        stepModel.setTargetDatabase(step.getDestinationDatabase());

        JSONObject jsonObject = new JSONObject(JSONObject.writeValueAsString(step.getOptions()));
        stepModel.setConfig(jsonObject.jsonNode());

        stepModel.setLanguage(step.getLanguage());

        // TODO: Sending true for now
        stepModel.setValid(true);
        stepModel.setCustomHook(step.getCustomHook());
        stepModel.setVersion(String.valueOf(step.getVersion()));

        return stepModel;
    }

    private String getStepKeyInStepMap(String flowName, String stepId) {
        // Split on the last occurrence of "-"
        String[] stepStr = stepId.split("-(?!.*-)");

        if (stepStr.length == 2) {
            String name = stepStr[0];
            String type = stepStr[1];
            String[] key = new String[1];

            flowManager.getSteps(flowName).forEach((k, v) -> {
                if (name.equals(v.getName()) && type.equals(v.getType().toString())) {
                    key[0] = k;
                }
            });

            return key[0];
        }

        return null;
    }

    private Step getDefaultStepFromResources(String resourcePath, Step.StepType stepType) {
        try {
            InputStream in = FlowManagerService.class.getClassLoader().getResourceAsStream(resourcePath);
            JSONObject jsonObject = new JSONObject(IOUtils.toString(in));
            Step defaultStep = Step.create(stepType.toString(), stepType);
            defaultStep.deserialize(jsonObject.jsonNode());

            return defaultStep;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
