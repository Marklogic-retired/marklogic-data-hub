package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class DeployUserModulesTask extends HubTask {

    @TaskAction
    void deployUserModules() {
        def dh = getDataHub()
        if (!dh.isInstalled()) {
            println("Data Hub is not installed.")
            return
        }

        def pathToUserModules = new File(getHubConfig().modulesPath)
        dh.installUserModules(pathToUserModules)
    }
}
