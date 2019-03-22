package com.marklogic.hub.web.service;

import com.marklogic.hub.StepManager;
import com.marklogic.hub.step.Step;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StepManagerService {

    @Autowired
    private StepManager stepManager;

    public Step getStep(String stepName, Step.StepType stepType) {
        return stepManager.getStep(stepName, stepType);
    }

    public void createStep(Step step) {
        stepManager.saveStep(step);
    }

    public void saveStep(Step step) {
        stepManager.saveStep(step, true);
    }

    public void deleteStep(Step step) {
        stepManager.deleteStep(step);
    }
}
