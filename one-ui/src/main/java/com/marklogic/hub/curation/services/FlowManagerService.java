package com.marklogic.hub.curation.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.oneui.exceptions.DataHubException;
import com.marklogic.hub.oneui.models.StepModel;
import com.marklogic.hub.scaffold.Scaffolding;
import com.marklogic.hub.step.StepDefinition;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.util.json.JSONUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.EnumUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.ws.rs.BadRequestException;
import javax.ws.rs.NotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FlowManagerService {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private FlowRunnerImpl flowRunner;

    @Autowired
    private StepDefinitionManager stepDefinitionManager;

    @Autowired
    private Scaffolding scaffolding;

    public Flow updateFlow(String flowJson) {
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
        flowManager.saveFlow(flow);
        return flow;
    }

    public Flow createFlow(String flowJson) {
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

    public Flow getFlow(String flowName) {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new NotFoundException(flowName + " not found!");
        }
        return flow;
    }

    public void deleteFlow(String flowName) {
        flowManager.deleteFlow(flowName);
    }

    public List<Flow> getFlows() {
        return flowManager.getFlows();
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

    private Step mergeDefaultStepDefinitionIntoStep(StepModel stepModel, Step step) {
        String stepType = step.getStepDefinitionType().toString().toLowerCase();
        StepDefinition defaultStepDefinition = getDefaultStepDefinitionFromResources("hub-internal-artifacts/step-definitions/" + stepType + "/marklogic/"+ step.getStepDefinitionName() +".step.json", step.getStepDefinitionType());
        Step defaultStep = defaultStepDefinition.transformToStep(step.getName(), defaultStepDefinition, new Step());
        return StepModel.mergeFields(stepModel, defaultStep, step);
    }

    private Step upsertStepDefinition(StepModel stepModel, Step step) {
        if (stepDefinitionManager.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType()) != null) {
            String stepType = step.getStepDefinitionType().toString().toLowerCase();
            if(step.getStepDefinitionName().equalsIgnoreCase("default-" + stepType) || "entity-services-mapping".equalsIgnoreCase(step.getStepDefinitionName())) {
                step = mergeDefaultStepDefinitionIntoStep(stepModel, step);
            }
            else {
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

            scaffolding.createCustomModule(stepDefName, stepDefType.toString());
            stepDefinition.setModulePath(modulePath);
            stepDefinitionManager.saveStepDefinition(stepDefinition);
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

    /*
    The core and web models for steps are different, webModel has 'modulePath' which provides the uri of the main.sjs
    whereas it is not present in the core step model. Hence the following 2 transform methods additionally are meant to
    set modulePaths in 'StepModel' and 'StepDefinition' .
     */
    private StepModel transformStepToWebModel(Step step) {
        StepModel stepModel = StepModel.transformToWebStepModel(step);
        StepDefinition stepDef = stepDefinitionManager.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());
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


    /**
     * This is synchronized because Coverity is reporting that flowManagerService is being modified without proper
     * synchronization when it's invoked by FlowController.
     *
     * @param flowName
     * @param steps
     * @return
     */
    public synchronized RunFlowResponse runFlow(String flowName, List<String> steps) {
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

    public Flow stop(String flowName) {
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

}
