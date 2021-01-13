package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.hubcentral.HubCentralManager
import org.apache.commons.io.IOUtils
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class PullChangesTask extends HubTask {

    @TaskAction
    void pullConfigurationFiles() {
        HubCentralManager hubCentralManager = new HubCentralManager()
        File zipFile
        FileOutputStream fos
        try {
            zipFile = File.createTempFile("hub-central-project", ".zip")
            println "Downloading user configuration files to: " + zipFile
            fos = new FileOutputStream(zipFile)
            hubCentralManager.writeHubCentralFilesAsZip(getHubConfig().newHubClient(), fos)
        }
        catch (Exception e) {
            throw new GradleException("Unable to download user configuration files; cause: " + e.getMessage(), e)
        }
        finally {
            IOUtils.closeQuietly(fos)
        }

        println "Applying downloaded user configuration files to project"
        hubCentralManager.applyHubCentralZipToProject(getHubProject(), zipFile)
    }
}
