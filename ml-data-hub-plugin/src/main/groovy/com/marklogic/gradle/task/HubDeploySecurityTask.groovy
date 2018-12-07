package com.marklogic.gradle.task

import com.marklogic.appdeployer.command.Command
import com.marklogic.appdeployer.impl.SimpleAppDeployer
import com.marklogic.hub.impl.DataHubImpl
import org.gradle.api.tasks.TaskAction

/**
 * This task is needed so that hubPreInstallCheck can depend on something that deploys all security resources except
 * for amps - those can't be deployed until the modules database has been deployed. This code then mirrors what
 * DataHubImpl.install in terms of getting the list of security commands (minus the one for amps) and executing them.
 */
class HubDeploySecurityTask extends HubTask {

    @TaskAction
    void deploySecurity() {
        DataHubImpl dataHub = (DataHubImpl) getDataHub()
        List<Command> securityCommands = dataHub.getSecurityCommandList()
        def manageClient = getProject().property("mlManageClient")
        def adminManager = getProject().property("mlAdminManager")
        SimpleAppDeployer appDeployer = new SimpleAppDeployer(manageClient, adminManager)
        appDeployer.setCommands(securityCommands)
        appDeployer.deploy(getHubConfig().getAppConfig())
    }
}
