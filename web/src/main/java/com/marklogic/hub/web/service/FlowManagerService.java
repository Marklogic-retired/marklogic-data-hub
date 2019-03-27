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

import com.marklogic.hub.FlowManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.exception.BadRequestException;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.exception.NotFoundException;
import com.marklogic.hub.web.model.StepModel;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

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

    public List<Flow> getFlows() {
        return flowManager.getFlows();
    }

    public Flow createFlow(String flowJson, boolean checkExists) {
        Flow flow = flowManager.createFlowFromJSON(flowJson);
        if (flow != null && StringUtils.isEmpty(flow.getName())) {
            return null;
        }
        if (checkExists && flowManager.isFlowExisted(flow.getName())) {
            throw new DataHubException(flow.getName() + " is existed.");
        }
        flowManager.saveFlow(flow);
        return flow;
    }

    public Flow getFlow(String flowName) {
        return flowManager.getFlow(flowName);
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

    public StepModel createStep(String flowName, Integer stepOrder, String stepId, String stepJson) {
        StepModel stepModel = null;
        try {
            stepModel = StepModel.fromJson(JSONObject.readInput(stepJson));
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (stepModel != null) {
            Step step = convertToCoreModel(stepModel);

            // Only save step if step is of Custom type, for rest use the default steps.
            if (step.getType().equals(Step.StepType.CUSTOM)) {
                if (stepManagerService.getStep(step.getName(), step.getType()) != null) {
                    stepManagerService.saveStep(step);
                } else {
                    stepManagerService.createStep(step);
                }
            } else if (step.getType().equals(Step.StepType.INGEST)) {
                try {
                    InputStream in = FlowManagerService.class.getClassLoader().getResourceAsStream("hub-internal-artifacts/steps/ingest/marklogic/default-ingest.step.json");
                    JSONObject jsonObject = new JSONObject(IOUtils.toString(in));
                    Step defaultIngest = Step.create("defaultIngest", Step.StepType.INGEST);
                    defaultIngest.deserialize(jsonObject.jsonNode());
                    mergeOptions(stepModel, defaultIngest);
                    mergeOtherFields(defaultIngest, step);
                    step = defaultIngest;
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }


            } else if (step.getType().equals(Step.StepType.MAPPING)) {
                try {
                    InputStream in = FlowManagerService.class.getClassLoader().getResourceAsStream("hub-internal-artifacts/steps/mapping/marklogic/default-mapping.step.json");
                    JSONObject jsonObject = new JSONObject(IOUtils.toString(in));
                    Step defaultMapping = Step.create("defaultMapping", Step.StepType.MAPPING);
                    defaultMapping.deserialize(jsonObject.jsonNode());
                    mergeOptions(stepModel, defaultMapping);
                    mergeOtherFields(defaultMapping, step);
                    step = defaultMapping;
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }

            if (stepOrder != null) {
                // Create
                try {
                    Map<String, Step> stepMap = flowManager.getSteps(flowName);
                    stepMap.put(String.valueOf(stepOrder), step);
                    Flow flow = flowManager.setSteps(flowName, stepMap);
                    flowManager.saveFlow(flow);
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

                    stepMap.put(key, step);
                    Flow flow = flowManager.setSteps(flowName, stepMap);
                    flowManager.saveFlow(flow);
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

                // Don't delete the Step from the filesystem so that we can later on reuse the step.
//            if (step.getType().equals(Step.StepType.CUSTOM)) {
//                stepManagerService.deleteStep(step);
//            }
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

    private Step convertToCoreModel(StepModel stepModel) {
        Step step = Step.create("dummy", Step.StepType.CUSTOM);

        step.setName(stepModel.getName());
        step.setType(stepModel.getType());
        step.setSourceDatabase(stepModel.getSourceDatabase());
        step.setDestinationDatabase(stepModel.getTargetDatabase());
        step.setCustomHook(stepModel.getCustomHook());
        step.setDescription(stepModel.getDescription());

        if (stepModel.getVersion() != null) {
            step.setVersion(Integer.parseInt(stepModel.getVersion()));
        }

        JSONObject jsonObject = new JSONObject(stepModel.toJson());
        step.setOptions(jsonObject.getMap("config"));

        return step;
    }

    private void mergeOptions(StepModel stepModel, Step step) {
        if (stepModel.getConfig() != null) {
            Iterator<String> iterator = stepModel.getConfig().fieldNames();
            while (iterator.hasNext()) {
                String key = iterator.next();
                step.getOptions().put(key, stepModel.getConfig().get(key));
            }
        }
    }

    private void mergeOtherFields(Step defaultStep, Step step) {
        if (step.getName() != null) {
            defaultStep.setName(step.getName());
        }

        if (step.getType() != null) {
            defaultStep.setType(step.getType());
        }

        if (step.getDestinationDatabase() != null) {
            defaultStep.setDestinationDatabase(step.getDestinationDatabase());
        }

        if (step.getSourceDatabase() != null) {
            defaultStep.setSourceDatabase(step.getSourceDatabase());
        }

        if (step.getVersion() != null) {
            defaultStep.setVersion(step.getVersion());
        }

        if (step.getDescription() != null) {
            defaultStep.setDescription(step.getDescription());
        }

        if (step.getCustomHook() != null) {
            defaultStep.setCustomHook(step.getCustomHook());
        }

        if (step.getIdentifier() != null) {
            defaultStep.setIdentifier(step.getIdentifier());
        }
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
}
