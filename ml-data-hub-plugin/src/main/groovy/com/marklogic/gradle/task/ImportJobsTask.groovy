package com.marklogic.gradle.task

import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

class ImportJobsTask extends HubTask {
    @Input
    public String jobIds
    public String importFilename

    @TaskAction
    void exportJobs() {
        if (importFilename == null) {
            importFilename = project.hasProperty("filename") ? project.property("filename") : "jobexport.zip"
        }
        println("Importing jobs from " + importFilename)

        def jobManager = getJobManager()
        def dh = getDataHub()
        if (!dh.isInstalled()) {
            println("Data Hub is not installed.")
            return
        }
        def importPath = getHubConfig().hubConfigDir.resolve(importFilename)
        def jobImportResponse = jobManager.importJobs(importPath)
        print jobImportResponse
    }

}
