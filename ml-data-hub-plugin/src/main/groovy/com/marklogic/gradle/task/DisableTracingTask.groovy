package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class DisableTracingTask extends HubTask {

    @TaskAction
    void disableTracing() {
        getTracing().disable()
    }
}
