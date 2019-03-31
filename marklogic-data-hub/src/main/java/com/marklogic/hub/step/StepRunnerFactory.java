package com.marklogic.hub.step;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.impl.QueryStepRunner;
import com.marklogic.hub.step.impl.WriteStepRunner;
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
        return stepRunner.withFlow(flow)
            .withStep(stepNum)
            .withBatchSize(step.getBatchSize())
            .withThreadCount(step.getThreadCount())
            .withSourceClient(hubConfig.newStagingClient(step.getSourceDatabase()))
            .withDestinationDatabase(step.getDestinationDatabase())
            .withOptions(step.getOptions());
    }

}
