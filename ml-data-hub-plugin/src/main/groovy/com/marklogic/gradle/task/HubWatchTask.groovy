package com.marklogic.gradle.task

import com.marklogic.hub.deploy.commands.LoadUserModulesCommand
import org.gradle.api.tasks.TaskAction

/**
 * Runs an infinite loop, and each second, it loads any new/modified modules. Often useful to run with the Gradle "-i" flag
 * so you can see which modules are loaded.
 *
 * Depends on an instance of LoadModulesCommand being in the Gradle Project, which should have been placed there by
 * MarkLogicPlugin. This prevents this class from having to know how to construct a ModulesLoader.
 */
class HubWatchTask extends HubTask {

    long sleepTime = 1000

    @TaskAction
    public void watchModules() {

        LoadUserModulesCommand command = new LoadUserModulesCommand(getHubConfig())
        println "Watching modules in paths: " + getHubConfig().projectDir

        while (true) {
            command.execute(getCommandContext())
            try {
                Thread.sleep(sleepTime);
            } catch (InterruptedException ie) {
                // Ignore
            }
        }
    }
}
