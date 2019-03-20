package com.marklogic.hub.web.service;

import com.marklogic.hub.FlowManager;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.step.Step;
import com.marklogic.hub.util.json.JSONObject;
import com.marklogic.hub.web.model.StepModel;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FlowManagerService {

    @Autowired
    private FlowManager flowManager;

    @Autowired
    private HubConfigImpl hubConfig;

    public List<Flow> getFlows() {
        return flowManager.getFlows();
    }

    public Flow createFlow(String flowJson) {
        Flow flow = flowManager.createFlowFromJSON(flowJson);
        if (flow != null && StringUtils.isEmpty(flow.getName())) {
            return null;
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
        int n = 1;
        while (stepMap.containsKey(String.valueOf(n))){
            Step step = stepMap.get(String.valueOf(n));
            StepModel stepModel = new StepModel();

            stepModel.setId(step.getName() + "-" + step.getType());

            stepModel.setType(step.getType());
            stepModel.setName(step.getName());
//            stepModel.setDescription(step.get);
//            stepModel.setSourceDatabase(step.get);
//            stepModel.setTargetDatabase(step.get);
//            stepModel.setConfig(step.get);
            stepModel.setLanguage("zxx");
//            stepModel.setValid(step.get);
//            stepModel.setRunning();
            stepModel.setVersion(String.valueOf(step.getVersion()));
//            stepModel.setSourceCollection(step.get);
//            stepModel.setSourceQuery(step.get);
//            stepModel.setTargetEntity(step.get);

            stepModelList.add(stepModel);

            n++;
        }

        return stepModelList;
    }


    public StepModel createStep(String flowName, String stepJson) {

        StepModel stepModel = null;
        try {
            stepModel = StepModel.fromJson(JSONObject.readInput(stepJson));
        } catch (IOException e) {
            e.printStackTrace();
        }

        Step step = Step.create("dummy", Step.StepType.CUSTOM);

        // TODO: Transform stepModel to step, Save the step on disk, Add the stepJson to Flow

        //stepManagerService.saveStep(step);
        Map<String, Step> stepMap = new HashMap<>();
        stepMap.put("", step);
        Flow flow = flowManager.setSteps(flowName, stepMap);
        flowManager.saveFlow(flow);

        return stepModel;
    }
}
