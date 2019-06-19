package com.marklogic.gradle.task.dhs

import com.marklogic.gradle.task.HubTask
import org.gradle.api.tasks.TaskAction

class DhsDeployTask extends HubTask {

    @TaskAction
    void deployToDhs() {
        getDataHub().dhsInstall(null)
    }
}
