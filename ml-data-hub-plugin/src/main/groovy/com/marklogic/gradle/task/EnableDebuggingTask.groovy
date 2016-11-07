package com.marklogic.gradle.task

import com.marklogic.gradle.exception.HubNotInstalledException
import org.gradle.api.tasks.TaskAction

class EnableDebuggingTask extends HubTask {

    @TaskAction
    void enableDebugging() {
        if (!isHubInstalled()) {
            throw new HubNotInstalledException()
        }

        getDebugging().enable()
    }
}
