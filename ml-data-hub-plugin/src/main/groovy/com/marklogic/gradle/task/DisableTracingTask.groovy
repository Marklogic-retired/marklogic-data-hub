package com.marklogic.gradle.task

import com.marklogic.gradle.exception.HubNotInstalledException
import org.gradle.api.tasks.TaskAction

class DisableTracingTask extends HubTask {

    @TaskAction
    void disableTracing() {
        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }
        getTracing().disable()
    }
}
