package com.marklogic.gradle.task

import com.marklogic.hub.deploy.commands.ClearDHFModulesCommand
import org.gradle.api.tasks.TaskAction

class ClearDHFModulesTask extends HubTask {

    @TaskAction
    void clearModules() {
        println "Clearing DHF modules from modules database"

        def cmd = new ClearDHFModulesCommand(getHubConfig(), getDataHub())
        cmd.execute(getCommandContext())

        println "Finished clearing DHF modules from modules database"
    }

}
