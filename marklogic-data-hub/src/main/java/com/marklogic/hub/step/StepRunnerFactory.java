package com.marklogic.hub.step;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.step.impl.MappingStepRunner;
import org.springframework.beans.factory.annotation.Autowired;

public class StepRunnerFactory {

    @Autowired
    private HubConfig hubConfig;
    
    public StepRunner getStepRunner(Step step) {
        switch (step.getType()) {
            case MAPPING:
                return new MappingStepRunner(hubConfig);
            case CUSTOM:
                return null;
            case INGEST:
                return null;
        }
        return null;
    }

}
