package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class DisableDebuggingTask extends HubTask {

    @TaskAction
    void disableDebugging() {
        getDebugging().disable()
    }
}
