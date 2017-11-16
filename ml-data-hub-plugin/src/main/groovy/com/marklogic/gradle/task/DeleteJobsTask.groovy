package com.marklogic.gradle.task

import com.marklogic.gradle.exception.JobIdsRequiredException
import com.marklogic.hub.job.JobDeleteResponse
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

class DeleteJobsTask extends HubTask {

    @Input
    public String jobIds

    @TaskAction
    void deleteJobs() {
        if (jobIds == null) {
            jobIds = project.hasProperty("jobIds") ? project.property("jobIds") : null
        }
        if (jobIds == null) {
            throw new JobIdsRequiredException()
        }

        println("Deleting jobs: " + jobIds)
        def jobManager = getJobManager()
        def dh = getDataHub()
        if (!dh.isInstalled()) {
            println("Data Hub is not installed.")
            return
        }
        def jobDeleteResponse = jobManager.deleteJobs(jobIds)
        print jobDeleteResponse
    }

}
