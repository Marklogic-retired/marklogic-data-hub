package com.marklogic.hub.step;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.impl.QueryStepRunner;
import com.marklogic.hub.step.impl.WriteStepRunner;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class StepRunnerFactory {

    @Autowired
    private HubConfig hubConfig;
    private StepRunner stepRunner;

    public StepRunner getStepRunner(Flow flow, String stepNum) {
        Map<String,Step> steps = flow.getSteps();
        Step step = steps.get(stepNum);

        switch (step.getType()) {
            case MAPPING:
                stepRunner = new QueryStepRunner(hubConfig);
                break;
            case INGEST:
                stepRunner = new WriteStepRunner(hubConfig);
                break;
            default:
                stepRunner = new QueryStepRunner(hubConfig);
        }
        stepRunner = stepRunner.withFlow(flow)
            .withStep(stepNum);
        if(step.getBatchSize() != 0) {
            stepRunner.withBatchSize(step.getBatchSize());
        }
        if(step.getBatchSize() != 0) {
            stepRunner.withThreadCount(step.getThreadCount());
        }
        if(StringUtils.isNotEmpty(step.getSourceDatabase())) {
            stepRunner.withSourceClient(hubConfig.newStagingClient(step.getSourceDatabase()));
        }
        if(StringUtils.isNotEmpty(step.getDestinationDatabase())){
            stepRunner.withDestinationDatabase(step.getDestinationDatabase());
        }
        return stepRunner;
    }
}
