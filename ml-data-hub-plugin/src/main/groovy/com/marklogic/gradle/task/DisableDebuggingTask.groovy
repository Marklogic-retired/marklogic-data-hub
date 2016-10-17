package com.marklogic.gradle.task

import com.marklogic.gradle.exception.HubNotInstalledException
import org.gradle.api.tasks.TaskAction

class DisableDebuggingTask extends HubTask {

    @TaskAction
    void disableDebugging() {
        if (!getDataHub().isInstalled()) {
            throw new HubNotInstalledException()
        }
        getDebugging().disable()
    }
}
