package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class InitProjectTask extends HubTask {

    @TaskAction
    void initProject() {
        getDataHub().initProject()

        println("\n\n############################################")
        println("# Your Data Hub Framework Project is ready.")
        println("############################################\n")
        println(" - Set username and password")
        println("     There are several ways to do this. The easiest is to set mlUsername and mlPassword in gradle.properties.")
        println("     For other approaches see: https://github.com/marklogic-community/marklogic-data-hub/wiki/Password-Management\n")
        println(" - To deploy your application into MarkLogic...")
        println("     gradle mlDeploy\t# this will bootstrap your application")
        println("     gradle mlLoadModules\t# this will load your custom plugins into MarkLogic\n")
        println(" - Full list of gradle tasks:")
        println("     https://github.com/marklogic-community/marklogic-data-hub/wiki/Gradle-Tasks\n")
        println(" - Curious about the project structure?")
        println("     Look here: https://github.com/marklogic-community/marklogic-data-hub/wiki/Project-Directory-Structure")
    }
}
