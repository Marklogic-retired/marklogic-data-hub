package com.marklogic.gradle.task.deploy

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.dhs.DhsDeployer
import com.marklogic.hub.impl.HubConfigImpl
import org.gradle.api.tasks.TaskAction

class DeployAsDeveloperTask extends HubTask {

    @TaskAction
    void deployToDhs() {
        DhsDeployer dhsDeployer = new DhsDeployer()
        dhsDeployer.checkCompatibility(getHubConfig())

        println "Deploying resources that a user with the 'data-hub-developer' role is permitted to deploy"
        dhsDeployer.deployAsDeveloper(getHubConfig() as HubConfigImpl)
    }
}
