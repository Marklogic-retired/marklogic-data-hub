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

        println "Fixing datahubCreatedByStep metadata in database: " + database
        new CreatedByStepFixer(getHubConfig().newHubClient()).fixInDatabase(database)
        println "Finished fixing datahubCreatedByStep metadata"
    }
}
