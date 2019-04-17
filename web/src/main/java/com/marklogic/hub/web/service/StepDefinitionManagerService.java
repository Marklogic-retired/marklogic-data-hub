package com.marklogic.hub.web.service;

import com.marklogic.hub.StepDefinitionManager;
import com.marklogic.hub.step.StepDefinition;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StepDefinitionManagerService {

    @Autowired
    private StepDefinitionManager stepDefinitionManager;

    public StepDefinition getStepDefinition(String stepName, StepDefinition.StepDefinitionType stepDefinitionType) {
        return stepDefinitionManager.getStepDefinition(stepName, stepDefinitionType);
    }

    public void createStepDefinition(StepDefinition stepDefinition) {
        stepDefinitionManager.saveStepDefinition(stepDefinition);
    }

    public void saveStepDefinition(StepDefinition stepDefinition) {
        stepDefinitionManager.saveStepDefinition(stepDefinition, true);
    }

    public void deleteStepDefinition(StepDefinition stepDefinition) {
        stepDefinitionManager.deleteStepDefinition(stepDefinition);
    }
}
