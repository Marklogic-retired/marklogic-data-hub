package com.marklogic.hub.step;

/**
 * Abstracts how a StepDefinition is provided to a client so that it can come from MarkLogic, from a filesystem, or from
 * other location.
 */
public interface StepDefinitionProvider {

    StepDefinition getStepDefinition(String name, StepDefinition.StepDefinitionType type);

}
