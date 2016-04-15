package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class InstallHubTask extends HubTask {

    @TaskAction
    void installHub() {
        getDataHub().install()
    }
}
