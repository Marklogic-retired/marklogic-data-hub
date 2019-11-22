package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.JacksonHandle;

public class MarkLogicStepDefinitionProvider implements StepDefinitionProvider {

    private DatabaseClient databaseClient;

    public MarkLogicStepDefinitionProvider(DatabaseClient databaseClient) {
        this.databaseClient = databaseClient;
    }

    @Override
    public StepDefinition getStepDefinition(String name, StepDefinition.StepDefinitionType type) {
        // TODO Support custom step definitions
        String uri = String.format("/step-definitions/%s/marklogic/%s.step.json", type.name().toLowerCase(), name);
        JsonNode json = databaseClient.newJSONDocumentManager().read(uri, new JacksonHandle()).get();
        StepDefinition step = StepDefinition.create(name, type);
        step.deserialize(json);
        return step;
    }
}
