package com.marklogic.hub.step;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.step.impl.MappingStepRunner;
import org.springframework.beans.factory.annotation.Autowired;

public class StepRunnerFactory {

    @Autowired
    private HubConfig hubConfig;
    private StepRunner stepRunner;

    public StepRunner getStepRunner(Step step) {
        switch (step.getType()) {
            case MAPPING:
                stepRunner = new MappingStepRunner(hubConfig);
            case CUSTOM:
                stepRunner = null;
            case INGEST:
                stepRunner =  null;
        }
        return stepRunner.withFlow(step.getFlow())
            .withStep(step)
            .withOptions(step.getOptions())
            .withBatchSize(step.getBatchSize())
            .withThreadCount(step.getThreadCount())
            .withSourceClient(hubConfig.newStagingClient(step.getStagingDB()))
            .withDestinationDatabase(step.getdestDB());
    }

}
