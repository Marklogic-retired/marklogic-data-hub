package com.marklogic.hub.gradle.task


import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.hubcentral.HubCentralManager
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class ApplyProjectZipTask extends HubTask {

    @TaskAction
    void applyProjectZip() {
        def propName = "file"
        def file = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (file == null) {
            throw new GradleException("Please specify the path to a zip file via -Pfile=./path/to/file.zip")
        }

        println "Applying project files from zip at: " + file
        new HubCentralManager().applyHubCentralZipToProject(getHubProject(), new File(file))
    }
}
