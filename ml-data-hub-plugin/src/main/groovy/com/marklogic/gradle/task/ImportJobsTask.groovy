package com.marklogic.gradle.task

import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

class ImportJobsTask extends HubTask {
    @Input
    public String filename

    @TaskAction
    void exportJobs() {
        if (filename == null) {
            filename = project.hasProperty("filename") ? project.property("filename") : "jobexport.zip"
        }
        println("Importing jobs from " + filename)

        def jobManager = getJobManager()
        def dh = getDataHub()
        if (!dh.isInstalled()) {
            println("Data Hub is not installed.")
            return
        }
        def importPath = getHubConfig().hubConfigDir.parent.resolve(filename)
        jobManager.importJobs(importPath)
    }

}
