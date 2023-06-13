package com.marklogic.hub.step;

import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.HubClientConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.HubClientImpl;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.impl.StepDefinitionManagerImpl;
import com.marklogic.hub.step.impl.QueryStepRunner;
import com.marklogic.hub.step.impl.ScriptStepRunner;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.step.impl.WriteStepRunner;
import org.apache.commons.lang3.StringUtils;

import java.util.Map;
import java.util.Optional;

public class StepRunnerFactory {

    private final HubClient hubClient;
    private final HubProject hubProject;
    private final StepDefinitionProvider stepDefinitionProvider;

    /**
     * The one difference between this and the HubClient-based constructor is that by having access to a HubProject
     * via HubConfig, the WriteStepRunner instances created by this class will be able to resolve relative file input
     * paths based on the project directory. If that capability is not needed, then use the constructor that only
     * requires a HubClient.
     *
     * @param hubConfig
     */
    public StepRunnerFactory(HubConfig hubConfig) {
        this.hubClient = hubConfig.newHubClient();
        this.hubProject = hubConfig.getHubProject();
        this.stepDefinitionProvider = new StepDefinitionManagerImpl(hubClient, hubConfig.getHubProject());
    }

    public StepRunnerFactory(HubClient hubClient) {
        this.hubClient = hubClient;
        this.stepDefinitionProvider = new MarkLogicStepDefinitionProvider(hubClient.getStagingClient());
        // add Hub Project, if we can determine it from our hub client implementation
        HubClientConfig clientConfig =  hubClient instanceof HubClientImpl ? ((HubClientImpl) hubClient).getHubClientConfig(): null;
        this.hubProject = clientConfig instanceof HubConfigImpl ? ((HubConfigImpl) clientConfig).getHubProject(): null;
    }

    public StepRunner getStepRunner(Flow flow, String stepNum)  {

        Map<String, Step> steps = flow.getSteps();
        Step step = steps.get(stepNum);
        StepDefinition stepDef = stepDefinitionProvider.getStepDefinition(step.getStepDefinitionName(), step.getStepDefinitionType());

        StepRunner stepRunner;
        if (StepDefinition.StepDefinitionType.INGESTION.equals(step.getStepDefinitionType())) {
            stepRunner = new WriteStepRunner(hubClient, hubProject);
        } else if (((TextNode) step.getOptions().get("sourceQueryIsScript")).asBoolean()) {
            stepRunner = new QueryStepRunner(hubClient);
        } else {
            stepRunner = new ScriptStepRunner(hubClient);
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
                    targetDatabase = hubClient.getDbName(DatabaseKind.STAGING);
                } else {
                    targetDatabase = hubClient.getDbName(DatabaseKind.FINAL);
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
