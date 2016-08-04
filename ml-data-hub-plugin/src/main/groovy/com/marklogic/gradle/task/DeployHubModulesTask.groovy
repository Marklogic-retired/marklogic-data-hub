package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction
import com.marklogic.hub.commands.LoadHubModulesCommand

class DeployHubModulesTask extends HubTask {

    @TaskAction
    void deployHubModules() {
        def cmd = new LoadHubModulesCommand(getHubConfig())
        cmd.execute(getCommandContext())
    }
}
