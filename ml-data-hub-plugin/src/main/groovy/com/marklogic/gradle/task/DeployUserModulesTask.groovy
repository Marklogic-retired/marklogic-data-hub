package com.marklogic.gradle.task

import com.marklogic.hub.deploy.commands.LoadUserModulesCommand
import org.gradle.api.tasks.TaskAction

class DeployUserModulesTask extends HubTask {

    @TaskAction
    void deployUserModules() {
        def dh = getDataHub()
        if (!dh.isInstalled()) {
            println("Data Hub is not installed.")
            return
        }
        def cmd = new LoadUserModulesCommand(getHubConfig())
        // TODO: make this user configurable
        cmd.setForceLoad(false);

        cmd.execute(getCommandContext())
    }
}
