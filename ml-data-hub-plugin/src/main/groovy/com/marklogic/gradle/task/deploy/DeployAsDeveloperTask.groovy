package com.marklogic.gradle.task.deploy

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.deploy.HubDeployer
import org.gradle.api.tasks.TaskAction

class DeployAsDeveloperTask extends HubTask {

    @TaskAction
    void deployToDhs() {
        println "Deploying resources that a user with the 'data-hub-developer' role is permitted to deploy"
        new HubDeployer().deployAsDeveloper(getHubConfig())
    }
}
