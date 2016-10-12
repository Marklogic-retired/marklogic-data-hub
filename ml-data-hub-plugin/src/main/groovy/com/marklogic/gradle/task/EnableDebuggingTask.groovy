package com.marklogic.gradle.task

import com.marklogic.gradle.exception.HubNotInstalledException
import org.gradle.api.tasks.TaskAction

class EnableDebuggingTask extends HubTask {

    @TaskAction
    void enableDebugging() {
        if (!getDataHub().isInstalled()) {
            throw new HubNotInstalledException()
        }

        getDebugging().enable()
    }
}
