package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.StepDefinitionManagerImpl;
import com.marklogic.hub.step.impl.QueryStepRunner;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.step.impl.WriteStepRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class StepRunnerFactory {

    @Autowired
    private HubConfig hubConfig;

    @Autowired
    private StepDefinitionProvider stepDefinitionProvider;

    private StepRunner stepRunner;
    private int batchSize = 100;
    private int threadCount = 4;
    private String sourceDatabase;
    private String targetDatabase;

    public StepRunnerFactory() {
    }

    public StepRunnerFactory(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
    }

    public StepRunner getStepRunner(Flow flow, String stepNum)  {
        Map<String, Step> steps = flow.getSteps();
        Step step = steps.get(stepNum);
        StepDefinition stepDef = stepDefinitionProvider.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());

        switch (step.getStepDefinitionType()) {
            case INGESTION:
                stepRunner = new WriteStepRunner(hubConfig);
                break;
            default:
                stepRunner = new QueryStepRunner(hubConfig);
        }
        stepRunner = stepRunner.withFlow(flow)
            .withStep(stepNum);

        if(step.getBatchSize() != 0) {
            batchSize = step.getBatchSize();
        }
        else if(flow.getBatchSize() != 0) {
            batchSize = flow.getBatchSize();
        }
        else if(stepDef!=null && stepDef.getBatchSize() != 0) {
            batchSize = stepDef.getBatchSize();
        }
        stepRunner.withBatchSize(batchSize);

        if(step.getThreadCount() != 0) {
            threadCount = step.getThreadCount();
        }
        else if(flow.getThreadCount() != 0) {
            threadCount = flow.getThreadCount();
        }
        else if(stepDef != null && stepDef.getThreadCount() !=0 ){
            threadCount = stepDef.getThreadCount();
        }

        stepRunner.withThreadCount(threadCount);

        if(step.getOptions().get("sourceDatabase") != null) {
            sourceDatabase = ((TextNode)step.getOptions().get("sourceDatabase")).asText();
        }
        else if(stepDef.getOptions().get("sourceDatabase") != null) {
            sourceDatabase = ((TextNode)stepDef.getOptions().get("sourceDatabase")).asText();
        }
        else {
            sourceDatabase = hubConfig.getDbName(DatabaseKind.STAGING);
        }
        stepRunner.withSourceClient(hubConfig.newStagingClient(sourceDatabase));

        if(step.getOptions().get("targetDatabase") != null) {
            targetDatabase = ((TextNode)step.getOptions().get("targetDatabase")).asText();
        }
        else if(stepDef.getOptions().get("targetDatabase") != null) {
            targetDatabase = ((TextNode)stepDef.getOptions().get("targetDatabase")).asText();
        }
        else {
            if(StepDefinition.StepDefinitionType.INGESTION.equals(step.getStepDefinitionType())) {
                targetDatabase = hubConfig.getDbName(DatabaseKind.STAGING);
            }
            else {
                targetDatabase = hubConfig.getDbName(DatabaseKind.FINAL);
            }
        }

        stepRunner.withDestinationDatabase(targetDatabase);

        //For ingest flow, set stepDef.
        if(StepDefinition.StepDefinitionType.INGESTION.equals(step.getStepDefinitionType())) {
            ((WriteStepRunner)stepRunner).withStepDefinition(stepDef);
        }
        return stepRunner;
    }

    public void setStepDefinitionProvider(StepDefinitionProvider stepDefinitionProvider) {
        this.stepDefinitionProvider = stepDefinitionProvider;
    }
}
