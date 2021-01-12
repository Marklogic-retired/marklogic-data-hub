package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.deploy.commands.CreateGranularPrivilegesCommand
import org.gradle.api.tasks.TaskAction

class PrintInheritableRolesTask extends HubTask {

    @TaskAction
    void printInheritableRoles() {
        println "The following DHF and MarkLogic roles can be inherited by a custom role created by a user with the data-hub-security-admin role: "
        println ""
        List<String> roles = CreateGranularPrivilegesCommand.ROLES_THAT_CAN_BE_INHERITED
        Collections.sort(roles)
        println roles
    }
}
