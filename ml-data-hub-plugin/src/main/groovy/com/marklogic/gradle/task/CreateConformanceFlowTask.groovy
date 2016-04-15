package com.marklogic.gradle.task

import com.marklogic.hub.flow.FlowType;
import org.gradle.api.tasks.TaskAction

class CreateHarmonizeFlowTask extends CreateFlowTask {

    @TaskAction
    void createHarmonizeFlow() {
        createFlow(FlowType.HARMONIZE)
    }
}
