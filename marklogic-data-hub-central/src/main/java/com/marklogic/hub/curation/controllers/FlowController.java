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
package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.ScaffoldingImpl;
import com.marklogic.hub.impl.StepDefinitionManagerImpl;
import com.marklogic.hub.central.exceptions.DataHubException;
import com.marklogic.hub.central.models.HubConfigSession;
import com.marklogic.hub.central.models.StepModel;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.EnumUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/api/flows")
public class FlowController {

    @Autowired
    HubConfigSession hubConfig;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlows() {
        List<Flow> flows = getFlowManager().getFlows();
        return new ResponseEntity<>(flows, HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public Flow createFlow(@RequestBody String flowJson) {
        FlowManager flowManager = getFlowManager();
        JSONObject jsonObject = processPayload(flowJson);

        String flowName = jsonObject.getString("name");
        Flow flow;

        if (flowManager.isFlowExisted(flowName)) {
            throw new DataHubException("A Flow with " + flowName + " already exists.");
        }
        flow = new FlowImpl();
        flow.setName(flowName);

        flow.deserialize(jsonObject.jsonNode());
        flowManager.saveFlow(flow);
        return flow;
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> updateFlow(@PathVariable String flowName, @RequestBody String flowJson) {
        Flow flow = updateFlow(flowJson);
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlow(@PathVariable String flowName) {
        Flow flow = getFlowManager().getFlow(flowName);
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteFlow(@PathVariable String flowName) {
        getFlowManager().deleteFlow(flowName);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.GET)
    @ResponseBody
    public List<StepModel> getSteps(@PathVariable String flowName) {
        return getStepsToWebModel(flowName);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.GET)
    @ResponseBody
    public StepModel getStep(@PathVariable String flowName, @PathVariable String stepId) {
        FlowManager flowManager = getFlowManager();
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

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> createStep(@PathVariable String flowName, @RequestParam(value = "stepOrder", required = false) Integer stepOrder, @RequestBody String stepJson) {
        StepModel stepModel = createStep(flowName, stepOrder, null, stepJson);
        return new ResponseEntity<>(stepModel, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> createStep(@PathVariable String flowName, @PathVariable String stepId, @RequestBody String stepJson) {
        StepModel stepModel = createStep(flowName, null, stepId, stepJson);
        return new ResponseEntity<>(stepModel, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteStep(@PathVariable String flowName, @PathVariable String stepId) {
        FlowManager flowManager = getFlowManager();
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
        // only updating local, since the artifact service updated the flow in MarkLogic
        updateFlow(newFlow.toString(), true);
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
        // only updating local, since the artifact service updated the flow in MarkLogic
        updateFlow(newFlow.toString(), true);
        return new ResponseEntity<>(newFlow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public RunFlowResponse runFlow(@PathVariable String flowName, @RequestBody(required = false) List<String> steps) {
        FlowManager flowManager = getFlowManager();
        FlowRunnerImpl flowRunner = newFlowRunner();
        if (steps == null || steps.size() == 0) {
            return flowRunner.runFlow(flowName);
        }
        else {
            Flow flow = flowManager.getFlow(flowName);
            List<String> restrictedSteps = new ArrayList<>();
            steps.forEach((step) -> restrictedSteps.add(this.getStepKeyInStepMap(flow, step)));
            return flowRunner.runFlow(flowName, restrictedSteps);
        }
    }

    @RequestMapping(value = "/{flowName}/stop", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> stopFlow(@PathVariable String flowName) {
        FlowRunnerImpl flowRunner = newFlowRunner();
        List<String> jobIds = flowRunner.getQueuedJobIdsFromFlow(flowName);
        Iterator<String> itr = jobIds.iterator();
        if (!itr.hasNext()) {
            throw new BadRequestException("Flow not running.");
        }
        while (itr.hasNext()) {
            flowRunner.stopJob(itr.next());
        }
        return getFlow(flowName);
    }

    protected ArtifactService getArtifactService() {
        DatabaseClient dataServicesClient = hubConfig.newStagingClient(null);
        return ArtifactService.on(dataServicesClient);
    }


    public Flow updateFlow(String flowJson) {
        return updateFlow(flowJson, false);
    }

    public Flow updateFlow(String flowJson, boolean onlyUpdateLocal) {
        FlowManager flowManager = getFlowManager();
        //for PUT updating
        JSONObject jsonObject = processPayload(flowJson);

        String flowName = jsonObject.getString("name");
        Flow flow;
        flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new DataHubException("Either the flow "+ flowName +" doesn't exist or an attempt to change flow name " +
                "is made which is prohibited ");
        }
        flow.deserialize(jsonObject.jsonNode());
        if (onlyUpdateLocal) {
            flowManager.saveLocalFlow(flow);
        } else {
            flowManager.saveFlow(flow);
        }
        return flow;
    }

    private JSONObject processPayload(String flowJson) {
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

    public StepModel createStep(String flowName, Integer stepOrder, String stepId, String stringStep) {
        FlowManager flowManager = getFlowManager();
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

    private List<StepModel> getStepsToWebModel(String flowName) {
        Flow flow =  getFlowManager().getFlow(flowName);
        Map<String, Step> stepMap = flow.getSteps();

        List<StepModel> stepModelList = new ArrayList<>();
        for (String key : stepMap.keySet()) {
            Step step = stepMap.get(key);
            StepModel stepModel = transformStepToWebModel(step);
            stepModelList.add(stepModel);
        }

        return stepModelList;
    }

    /*
The core and web models for steps are different, webModel has 'modulePath' which provides the uri of the main.sjs
whereas it is not present in the core step model. Hence the following 2 transform methods additionally are meant to
set modulePaths in 'StepModel' and 'StepDefinition' .
 */
    private StepModel transformStepToWebModel(Step step) {
        StepModel stepModel = StepModel.transformToWebStepModel(step);
        StepDefinition stepDef = getStepDefinitionManager().getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
        stepModel.setModulePath(stepDef.getModulePath());
        return stepModel;
    }

    private Step upsertStepDefinition(StepModel stepModel, Step step) {
        StepDefinitionManager stepDefinitionManager = getStepDefinitionManager();
        if (stepDefinitionManager.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType()) != null) {
            String stepType = step.getStepDefinitionType().toString().toLowerCase();
            if(!(step.getStepDefinitionName().equalsIgnoreCase("default-" + stepType) || "entity-services-mapping".equalsIgnoreCase(step.getStepDefinitionName()))) {
                StepDefinition oldStepDefinition = stepDefinitionManager.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
                StepDefinition stepDefinition = transformFromStep(oldStepDefinition, step, stepModel);
                stepDefinitionManager.saveStepDefinition(stepDefinition);
            }
        }
        else {
            String stepDefName = step.getStepDefinitionName();
            StepDefinition.StepDefinitionType stepDefType = step.getStepDefinitionType();
            String modulePath = "/custom-modules/" + stepDefType.toString().toLowerCase() + "/" + stepDefName + "/main.sjs";

            StepDefinition stepDefinition = StepDefinition.create(stepDefName, stepDefType);
            stepDefinition = transformFromStep(stepDefinition, step, stepModel);

            getScaffolding().createCustomModule(stepDefName, stepDefType.toString());
            stepDefinition.setModulePath(modulePath);
            stepDefinitionManager.saveStepDefinition(stepDefinition);
        }
        return step;
    }

    private StepDefinition transformFromStep(StepDefinition stepDefinition, Step step, StepModel stepModel) {
        StepDefinition newStepDefinition = stepDefinition.transformFromStep(stepDefinition, step);
        newStepDefinition.setModulePath(stepModel.getModulePath());
        return newStepDefinition;
    }

    protected Scaffolding getScaffolding() {
        return new ScaffoldingImpl(this.hubConfig.getHubConfigImpl());
    }

    protected StepDefinitionManagerImpl getStepDefinitionManager() {
        return new StepDefinitionManagerImpl(this.hubConfig.getHubConfigImpl());
    }

    protected FlowManager getFlowManager() {
        return new FlowManagerImpl(this.hubConfig.getHubConfigImpl());
    }

    protected FlowRunnerImpl newFlowRunner() {
        return new FlowRunnerImpl(this.hubConfig.getHubConfigImpl());
    }
}
