package com.marklogic.gradle.task

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

class UninstallHubTask extends DefaultTask {

    @TaskAction
    void unInstallHub() {
        getDataHub().uninstall()
    }

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    DataHub getDataHub() {
        getProject().property("dataHub")
    }

}
