package com.marklogic.gradle.task

import com.marklogic.hub.commands.LoadHubModulesCommand
import org.gradle.api.tasks.TaskAction

class DeployHubModulesTask extends HubTask {

    @TaskAction
    void deployHubModules() {
        def cmd = new LoadHubModulesCommand(getHubConfig())
        cmd.execute(getCommandContext())
    }
}
