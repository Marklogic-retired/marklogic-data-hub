package com.marklogic.gradle.task

import com.marklogic.gradle.task.MarkLogicTask
import org.gradle.api.tasks.TaskAction

class UndeployHubPrivilegesTask extends MarkLogicTask {

    @TaskAction
    void undeployPrivileges() {
        undeployWithCommandWithClassName("DeployHubPrivilegesCommand")
    }
}
