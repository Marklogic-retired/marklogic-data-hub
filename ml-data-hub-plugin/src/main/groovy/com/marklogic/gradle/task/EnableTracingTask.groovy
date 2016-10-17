package com.marklogic.gradle.task

import com.marklogic.gradle.exception.HubNotInstalledException
import org.gradle.api.tasks.TaskAction

class EnableTracingTask extends HubTask {

    @TaskAction
    void enableTracing() {
        if (!getDataHub().isInstalled()) {
            throw new HubNotInstalledException()
        }
        getTracing().enable()
    }
}
