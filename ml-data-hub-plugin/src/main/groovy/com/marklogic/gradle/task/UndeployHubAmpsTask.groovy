package com.marklogic.gradle.task


import com.marklogic.hub.deploy.commands.DeployHubAmpsCommand
import org.gradle.api.tasks.TaskAction

class UndeployHubAmpsTask extends HubTask {

    @TaskAction
    void undeployHubAmps() {
        new DeployHubAmpsCommand(getHubConfig()).undo(getCommandContext())
    }
}
