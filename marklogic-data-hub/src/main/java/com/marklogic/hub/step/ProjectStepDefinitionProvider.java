package com.marklogic.hub.step;

import com.marklogic.hub.StepDefinitionManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Depends on a StepDefinitionManager, which ultimately depends on a HubProject being available so that a step
 * definition can be read from disk. This is marked as a Spring Component so that it is used by default for backwards
 * compatibility purposes.
 */
@Component
public class ProjectStepDefinitionProvider implements StepDefinitionProvider {

    @Autowired
    private StepDefinitionManager stepDefMgr;

    @Override
    public StepDefinition getStepDefinition(String name, StepDefinition.StepDefinitionType type) {
        return stepDefMgr.getStepDefinition(name, type);
    }
}
