package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.util.CreatedByStepFixer
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class PreviewFixCreatedByStepTask extends HubTask {

    @TaskAction
    void previewFixCreatedByStepTask() {
        def propName = "database"
        def database = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (database == null) {
            throw new GradleException("Please specify a database via -Pdatabase=(name of staging or final database)")
        }

        def results = new CreatedByStepFixer(getHubConfig().newHubClient()).previewFixingDocuments(database)
        if (results.getLeft() == 0) {
            println "There are no documents in the " + database + " database whose datahubCreatedByStep metadata key " +
                "is a step definition name instead of a step name."
        } else {
            println "There are " + results.getLeft() + " documents in the " + database + " database whose datahubCreatedByStep metadata " +
                "key is a step definition name instead of a step name. The hubFixCreatedByStep task will change these values " +
                "to step names if provenance data exists to determine the step name."
            println "Example of a document URI that should be fixed: " + results.getRight()
        }
    }

}
