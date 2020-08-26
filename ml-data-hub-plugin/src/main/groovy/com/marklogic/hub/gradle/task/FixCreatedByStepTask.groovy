package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.util.CreatedByStepFixer
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class FixCreatedByStepTask extends HubTask {

    @TaskAction
    void fixCreatedByStep() {
        def propName = "database"
        def database = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (database == null) {
            throw new GradleException("Please specify a database via -Pdatabase=(name of staging or final database)")
        }

        CreatedByStepFixer fixer = new CreatedByStepFixer(getHubConfig().newHubClient())

        // Allows a client to customize the threadCount for performance reasons, if desiredß
        if (project.hasProperty("threadCount")) {
            String val = project.property("threadCount").toString()
            try {
                fixer.setThreadCount(Integer.parseInt(val))
            } catch (e) {
                println "Unable to apply threadCount property, could not parse value as a number: " + val
            }
        }

        println "Fixing datahubCreatedByStep metadata in database: " + database
        println "Only documents with the necessary provenance data to determine the correct step name will be fixed"
        fixer.fixInDatabase(database)
        println "Finished fixing datahubCreatedByStep metadata"
    }
}
