package com.marklogic.gradle.task

import com.marklogic.gradle.task.MarkLogicTask
import org.gradle.api.tasks.TaskAction

class UndeployHubAmpsTask extends MarkLogicTask {

    @TaskAction
    void undeployRoles() {
        undeployWithCommandWithClassName("DeployHubAmpsCommand")
    }
}
