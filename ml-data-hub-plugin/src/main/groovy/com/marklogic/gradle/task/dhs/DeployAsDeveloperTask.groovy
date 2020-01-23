package com.marklogic.gradle.task.dhs

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.dhs.DhsDeployer
import org.gradle.api.tasks.TaskAction

class DeployAsDeveloperTask extends HubTask {

    @TaskAction
    void deployToDhs() {
        new DhsDeployer().deployAsDeveloper(getHubConfig())
    }
}
