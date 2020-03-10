package com.marklogic.gradle.task.deploy

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.dhs.DhsDeployer
import org.gradle.api.tasks.TaskAction

class DeployAsSecurityAdminTask extends HubTask {

    @TaskAction
    void deployToDhs() {
        new DhsDeployer().deployAsSecurityAdmin(getHubConfig())
    }

}
