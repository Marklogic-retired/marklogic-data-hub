package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class EnableTracingTask extends HubTask {

    @TaskAction
    void enableTracing() {
        getTracing().enable()
    }
}
