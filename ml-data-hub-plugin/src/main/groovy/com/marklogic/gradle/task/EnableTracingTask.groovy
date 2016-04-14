package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class EnableTracingTask extends DefaultTask {

    @TaskAction
    void enableTracing() {
        getTracing().enable()
    }
}
