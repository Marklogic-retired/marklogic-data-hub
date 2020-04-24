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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONUtils;
import org.apache.commons.lang3.EnumUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/flows")
public class FlowController extends BaseController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlows() {
        List<Flow> flows = new ArrayList<>();
        getArtifactService().getList("flow").iterator().forEachRemaining(flow -> {
            FlowImpl f = new FlowImpl();
            f.deserialize(flow);
            flows.add(f);
        });
        return new ResponseEntity<>(flows, HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public Flow createFlow(@RequestBody String flowJson) {
        JSONObject jsonObject = processPayload(flowJson);
        String flowName = jsonObject.getString("name");
        Flow flow = new FlowImpl();
        flow.setName(flowName);
        flow.deserialize(jsonObject.jsonNode());
        getArtifactService().setArtifact("flow", flowName, processPayload(flowJson).jsonNode());
        return flow;
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> updateFlow(@PathVariable String flowName, @RequestBody String flowJson) {
        JSONObject jsonObject = processPayload(flowJson);
        Flow flow = getFlow(flowName).getBody();
        if (flow == null) {
            throw new DataHubException("Either the flow " + flowName + " doesn't exist or an attempt to change flow name " +
                "is made which is prohibited ");
        }
        flow.deserialize(jsonObject.jsonNode());
        getArtifactService().setArtifact("flow", flowName, jsonObject.jsonNode());
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Flow> getFlow(@PathVariable String flowName) {
        Flow flow = new FlowImpl();
        flow.deserialize(getArtifactService().getArtifact("flow", flowName));
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteFlow(@PathVariable String flowName) {
        getArtifactService().deleteArtifact("flow", flowName);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.GET)
    @ResponseBody
    public List<Step> getSteps(@PathVariable String flowName) {
        Flow flow = getFlow(flowName).getBody();
        Map<String, Step> stepMap = flow.getSteps();

        List<Step> stepList = new ArrayList<>();
        for (String key : stepMap.keySet()) {
            Step step = stepMap.get(key);
            stepList.add(step);
        }

        return stepList;
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.GET)
    @ResponseBody
    public Step getStep(@PathVariable String flowName, @PathVariable String stepId) {
        Flow flow = getFlow(flowName).getBody();
        if (flow == null) {
            throw new NotFoundException(flowName + " not found.");
        }

        Step step = flow.getStep(getStepKeyInStepMap(flow, stepId));
        if (step == null) {
            throw new NotFoundException(stepId + " not found.");
        }

        return step;
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> createStep(@PathVariable String flowName, @RequestParam(value = "stepOrder", required = false) Integer stepOrder, @RequestBody String stepJson) {
        Step step = createStep(flowName, stepOrder, null, stepJson);
        return new ResponseEntity<>(step, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> createStep(@PathVariable String flowName, @PathVariable String stepId, @RequestBody String stepJson) {
        Step step = createStep(flowName, null, stepId, stepJson);
        return new ResponseEntity<>(step, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteStep(@PathVariable String flowName, @PathVariable String stepId) {
        Flow flow = getFlow(flowName).getBody();
        String key = getStepKeyInStepMap(flow, stepId);

        if (StringUtils.isEmpty(key)) {
            throw new BadRequestException("Invalid Step Id");
        }

        FlowManagerImpl.removeStepFromFlow(flow, key);
        getArtifactService().setArtifact("flow", flowName, JSONUtils.convertArtifactToJson(flow));
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}/link/{artifactType}/{artifactName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> linkArtifact(@PathVariable String flowName, @PathVariable String stepId, @PathVariable String artifactType, @PathVariable String artifactName) {
        return linkArtifact(flowName, stepId, artifactType, artifactName, null);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}/link/{artifactType}/{artifactName}/{artifactVersion}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> linkArtifact(@PathVariable String flowName, @PathVariable String stepId, @PathVariable String artifactType, @PathVariable String artifactName, @PathVariable String artifactVersion) {
        JsonNode newFlow = getArtifactService().linkToStepOptions(flowName, stepId, artifactType, artifactName, artifactVersion);
        return new ResponseEntity<>(newFlow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}/link/{artifactType}/{artifactName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> removeLinkToArtifact(@PathVariable String flowName, @PathVariable String stepId, @PathVariable String artifactType, @PathVariable String artifactName) {
        return removeLinkToArtifact(flowName, stepId, artifactType, artifactName, null);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}/link/{artifactType}/{artifactName}/{artifactVersion}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> removeLinkToArtifact(@PathVariable String flowName, @PathVariable String stepId, @PathVariable String artifactType, @PathVariable String artifactName, @PathVariable String artifactVersion) {
        JsonNode newFlow = getArtifactService().removeLinkToStepOptions(flowName, stepId, artifactType, artifactName, artifactVersion);
        return new ResponseEntity<>(newFlow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public RunFlowResponse runFlow(@PathVariable String flowName, @RequestBody(required = false) List<String> steps) {
        FlowInputs inputs = new FlowInputs(flowName);
        if (steps != null && !steps.isEmpty()) {
            Flow flow = getFlow(flowName).getBody();
            List<String> restrictedSteps = new ArrayList<>();
            steps.forEach((step) -> restrictedSteps.add(this.getStepKeyInStepMap(flow, step)));
            inputs.setSteps(restrictedSteps);
        }
        return newFlowRunner().runFlow(inputs);
    }

    private ArtifactService getArtifactService() {
        return ArtifactService.on(getHubClient().getStagingClient());
    }

    private JSONObject processPayload(String flowJson) {
        JSONObject jsonObject;
        try {
            jsonObject = new JSONObject(flowJson);

            JSONUtils.trimText(jsonObject, "separator");
        } catch (IOException e) {
            throw new DataHubException("Unable to parse flow json string : " + e.getMessage());
        }

        if (!jsonObject.isExist("name") || StringUtils.isEmpty(jsonObject.getString("name"))) {
            throw new BadRequestException("Flow Name not provided. Flow Name is required.");
        }
        return jsonObject;
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

    public Step createStep(String flowName, Integer stepOrder, String stepId, String stringStep) {
        JsonNode stepJson;
        Flow flow = getFlow(flowName).getBody();
        Step existingStep = flow.getStep(getStepKeyInStepMap(flow, stepId));
        if (existingStep == null && !StringUtils.isEmpty(stepId)) {
            throw new NotFoundException("Step " + stepId + " Not Found");
        }

        try {
            stepJson = JSONObject.readInput(stringStep);
            JSONUtils.trimText(stepJson, "separator");

        } catch (IOException e) {
            throw new BadRequestException("Error parsing JSON");
        }
        Step step = Step.deserialize(stepJson);

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
        if (!EnumUtils.isValidEnumIgnoreCase(StepDefinition.StepDefinitionType.class, step.getStepDefinitionType().toString())) {
            throw new BadRequestException("Invalid Step Type");
        }

        Map<String, Step> currSteps = flow.getSteps();
        if (stepId != null) {
            String key = getStepKeyInStepMap(flow, stepId);
            if (StringUtils.isNotEmpty(key)) {
                currSteps.put(key, step);
            }
            flow.setSteps(currSteps);
        } else {
            if (stepOrder == null || stepOrder > currSteps.size()) {
                currSteps.put(String.valueOf(currSteps.size() + 1), step);
            } else {
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
            return existingStep;
        }

        getArtifactService().setArtifact("flow", flowName, JSONUtils.convertArtifactToJson(flow));
        return step;
    }

    /**
     * Included for testing purposes.
     *
     * @return
     */
    protected FlowRunner newFlowRunner() {
        return new FlowRunnerImpl(getHubClient());
    }
}
