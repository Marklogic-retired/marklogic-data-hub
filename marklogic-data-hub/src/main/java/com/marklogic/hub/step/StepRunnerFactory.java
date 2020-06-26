package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.impl.QueryStepRunner;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.step.impl.WriteStepRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
public class StepRunnerFactory {

    @Autowired
    private HubConfig hubConfig;

    private HubClient hubClient;

    @Autowired
    private StepDefinitionProvider stepDefinitionProvider;

    public StepRunnerFactory() {
    }

    public StepRunnerFactory(HubClient hubClient) {
        this.hubClient = hubClient;
        this.stepDefinitionProvider = new MarkLogicStepDefinitionProvider(hubClient.getStagingClient());
    }

    public StepRunner getStepRunner(Flow flow, String stepNum)  {

        Map<String, Step> steps = flow.getSteps();
        Step step = steps.get(stepNum);
        StepDefinition stepDef = stepDefinitionProvider.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());

        final HubClient theHubClient = hubClient != null ? hubClient : hubConfig.newHubClient();

        StepRunner stepRunner;
        if (StepDefinition.StepDefinitionType.INGESTION.equals(step.getStepDefinitionType())) {
            stepRunner = hubConfig != null ? new WriteStepRunner(hubConfig.newHubClient(), hubConfig.getHubProject()) : new WriteStepRunner(hubClient, null);
        } else {
            stepRunner = new QueryStepRunner(theHubClient);
        }

        stepRunner = stepRunner.withFlow(flow)
            .withStep(stepNum);

        int batchSize = 100;
        if((Optional.ofNullable(step.getBatchSize()).orElse(0) != 0)) {
            batchSize = step.getBatchSize();
        }
        else if(flow.getBatchSize() != 0) {
            batchSize = flow.getBatchSize();
        }
        else if(stepDef!=null && stepDef.getBatchSize() != 0) {
            batchSize = stepDef.getBatchSize();
        }
        stepRunner.withBatchSize(batchSize);

        int threadCount = 4;
        if((Optional.ofNullable(step.getThreadCount()).orElse(0) != 0)) {
            threadCount = step.getThreadCount();
        }
        else if(flow.getThreadCount() != 0) {
            threadCount = flow.getThreadCount();
        }
        else if(stepDef != null && stepDef.getThreadCount() !=0 ){
            threadCount = stepDef.getThreadCount();
        }

        stepRunner.withThreadCount(threadCount);

        if (stepRunner instanceof WriteStepRunner) {
            String targetDatabase;
            if (step.getOptions().get("targetDatabase") != null) {
                targetDatabase = ((TextNode) step.getOptions().get("targetDatabase")).asText();
            } else if (stepDef.getOptions().get("targetDatabase") != null) {
                targetDatabase = ((TextNode) stepDef.getOptions().get("targetDatabase")).asText();
            } else {
                if (StepDefinition.StepDefinitionType.INGESTION.equals(step.getStepDefinitionType())) {
                    targetDatabase = theHubClient.getDbName(DatabaseKind.STAGING);
                } else {
                    targetDatabase = theHubClient.getDbName(DatabaseKind.FINAL);
                }
            }
            ((WriteStepRunner)stepRunner).withDestinationDatabase(targetDatabase);
        }

        //For ingest flow, set stepDef.
        if(StepDefinition.StepDefinitionType.INGESTION.equals(step.getStepDefinitionType())) {
            ((WriteStepRunner)stepRunner).withStepDefinition(stepDef);
        }
        return stepRunner;
    }
}
