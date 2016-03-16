package com.marklogic.gradle.task

import com.marklogic.hub.flow.FlowType;
import org.gradle.api.tasks.TaskAction

class CreateConformanceFlowTask extends CreateFlowTask {

    @TaskAction
    void createConformanceFlow() {
        createFlow(FlowType.CONFORMANCE)
    }
}
