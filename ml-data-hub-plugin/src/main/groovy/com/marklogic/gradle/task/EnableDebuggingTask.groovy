package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class EnableDebuggingTask extends HubTask {

    @TaskAction
    void enableDebugging() {
        getDebugging().enable()
    }
}
