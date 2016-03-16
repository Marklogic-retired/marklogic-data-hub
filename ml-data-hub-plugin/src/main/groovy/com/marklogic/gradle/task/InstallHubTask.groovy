package com.marklogic.gradle.task

import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

class InstallHubTask extends DefaultTask {

    @TaskAction
    void installHub() {
        getDataHub().install()
    }

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }

    DataHub getDataHub() {
        getProject().property("dataHub")
    }

}
