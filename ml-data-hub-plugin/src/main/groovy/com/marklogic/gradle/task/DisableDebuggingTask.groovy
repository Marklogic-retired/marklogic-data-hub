package com.marklogic.gradle.task

import com.marklogic.gradle.exception.HubNotInstalledException
import org.gradle.api.tasks.TaskAction

class DisableDebuggingTask extends HubTask {

    @TaskAction
    void disableDebugging() {
        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }
        getDebugging().disable()
    }
}
