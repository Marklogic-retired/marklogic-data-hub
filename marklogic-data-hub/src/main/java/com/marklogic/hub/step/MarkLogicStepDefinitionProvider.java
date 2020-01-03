package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.hub.dataservices.StepDefinitionService;

/**
 * Implementation that retrieves step definitions from MarkLogic via a data service.
 */
public class MarkLogicStepDefinitionProvider implements StepDefinitionProvider {

    private StepDefinitionService service;

    public MarkLogicStepDefinitionProvider(DatabaseClient databaseClient) {
        this.service = StepDefinitionService.on(databaseClient);
    }

    @Override
    public StepDefinition getStepDefinition(String name, StepDefinition.StepDefinitionType type) {
        JsonNode json = service.getStepDefinition(name, type.name());
        StepDefinition step = StepDefinition.create(name, type);
        step.deserialize(json);
        return step;
    }
}
