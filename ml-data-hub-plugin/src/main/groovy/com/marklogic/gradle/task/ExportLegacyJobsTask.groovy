/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *  
 */

package com.marklogic.gradle.task

import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

class ExportLegacyJobsTask extends HubTask {
    @Input
    public String[] jobIds
    public String filename

    @TaskAction
    void exportJobs() {
        if (filename == null) {
            filename = project.hasProperty("filename") ? project.property("filename") : "jobexport.zip"
        }
        if (jobIds == null) {
            if (project.hasProperty("jobIds")) {
                jobIds = project.property("jobIds").split(",")
            }
        }
        if (jobIds == null) {
            println("Exporting all jobs to " + filename)
        }
        else {
            println("Exporting jobs: " + jobIds + " to " + filename)
        }

        def jobManager = getJobManager()
        def dh = getDataHub()
        if (!isHubInstalled()) {
            println("Data Hub is not installed.")
            return
        }
        def exportPath = getHubConfig().hubProject.projectDir.resolve(filename)
        def jobExportResponse = jobManager.exportJobs(exportPath, jobIds)
        print jobExportResponse
    }

}
