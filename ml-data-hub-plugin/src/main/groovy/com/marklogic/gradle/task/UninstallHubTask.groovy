package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class UninstallHubTask extends HubTask {

    @TaskAction
    void unInstallHub() {
        getDataHub().uninstall()
    }
}
