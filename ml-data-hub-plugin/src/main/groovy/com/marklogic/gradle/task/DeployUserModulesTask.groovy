package com.marklogic.gradle.task

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

class DeployUserModulesTask extends DefaultTask {

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

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    DataHub getDataHub() {
        getProject().property("dataHub")
    }

}
