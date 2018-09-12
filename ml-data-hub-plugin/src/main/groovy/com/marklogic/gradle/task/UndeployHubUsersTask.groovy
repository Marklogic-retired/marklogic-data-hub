package com.marklogic.gradle.task

import com.marklogic.gradle.task.MarkLogicTask
import org.gradle.api.tasks.TaskAction

class UndeployHubUsersTask extends MarkLogicTask {

    @TaskAction
    void undeployUsers() {
        undeployWithCommandWithClassName("DeployHubUsersCommand")
    }
}
