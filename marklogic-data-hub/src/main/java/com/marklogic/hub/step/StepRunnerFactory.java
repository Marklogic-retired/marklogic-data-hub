package com.marklogic.hub.step;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.step.impl.QueryStepRunner;
import com.marklogic.hub.step.impl.WriteStepRunner;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

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
            case INGEST:
                stepRunner =  null;
            default:
                stepRunner = new QueryStepRunner(hubConfig);
        }
        return stepRunner.withFlow(flow)
            .withStep(stepNum)
            .withBatchSize(step.getBatchSize())
            .withThreadCount(step.getThreadCount())
            .withSourceClient(hubConfig.newStagingClient(step.getSourceDB()))
            .withDestinationDatabase(step.getDestDB());
    }

}
