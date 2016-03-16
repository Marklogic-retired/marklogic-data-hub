package com.marklogic.gradle.task

import com.marklogic.hub.flow.FlowType;
import org.gradle.api.tasks.TaskAction

class CreateInputFlowTask extends CreateFlowTask {

    @TaskAction
    void createInputFlow() {
        createFlow(FlowType.INPUT)
    }
}
