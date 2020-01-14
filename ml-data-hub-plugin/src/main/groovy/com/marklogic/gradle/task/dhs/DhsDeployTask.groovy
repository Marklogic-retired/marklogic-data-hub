package com.marklogic.gradle.task.dhs

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.dhs.DhsDeployer
import org.gradle.api.tasks.TaskAction

class DhsDeployTask extends HubTask {

    @TaskAction
    void deployToDhs() {
        new DhsDeployer().deployToDhs(getHubConfig())
    }
}
