package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.hubcentral.HubCentralManager
import org.apache.commons.io.FileUtils
import org.apache.commons.io.IOUtils
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class PullConfigurationFilesTask extends HubTask {

    @TaskAction
    void pullConfigurationFiles() {

        HubCentralManager hubCentralManager = new HubCentralManager()
        File zipFile
        FileOutputStream fos
        println "Downloading project files"
        try{
            zipFile = File.createTempFile("datahub-project", ".zip")
            fos = new FileOutputStream(zipFile)
            hubCentralManager.writeProjectArtifactsAsZip(getHubConfig().newHubClient(), fos)
        }
        catch (Exception e){
            throw new GradleException("Unable to download project files", e)
        }
        finally {
            IOUtils.closeQuietly(fos)
        }

        println "Applying project files from downloaded project file"
        hubCentralManager.applyHubCentralZipToProject(getHubProject(), zipFile)
        FileUtils.deleteQuietly(zipFile)
    }
}
