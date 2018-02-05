package com.marklogic.gradle.task

import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

import java.nio.file.Path

class ExportJobsTask extends HubTask {
    @Input
    public String jobIds
    public String exportFilename

    @TaskAction
    void exportJobs() {
        if (exportFilename == null) {
            exportFilename = project.hasProperty("filename") ? project.property("filename") : "jobexport.zip"
        }
        if (jobIds == null) {
            jobIds = project.hasProperty("jobIds") ? project.property("jobIds") : null
        }
        if (jobIds == null) {
            println("Exporting all jobs to " + exportFilename)
        }
        else {
            println("Exporting jobs: " + jobIds + " to " + exportFilename)
        }

        def jobManager = getJobManager()
        def dh = getDataHub()
        if (!dh.isInstalled()) {
            println("Data Hub is not installed.")
            return
        }
        def exportPath = getHubConfig().hubConfigDir.getParent().resolve(exportFilename)
        def jobExportResponse = jobManager.exportJobs(exportPath, jobIds)
        print jobExportResponse
    }

}
