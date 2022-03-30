package com.marklogic.gradle.task

import com.marklogic.hub.hubcentral.HubCentralManager
import org.apache.commons.io.IOUtils
import org.gradle.api.tasks.TaskAction

class ExportProjectTask extends HubTask {

    @TaskAction
    void exportJobs() {
        HubCentralManager hubCentralManager = new HubCentralManager()
        File exportFile = getHubProject().projectDir.resolve("build").resolve("datahub-project.zip").toFile();
        if (!exportFile.getParentFile().exists()) {
            exportFile.getParentFile().mkdirs()
        }
        if (!exportFile.exists()) {
            exportFile.createNewFile()
        }
        FileOutputStream fos
        try {
            fos = new FileOutputStream(exportFile)
            hubCentralManager.writeProjectFilesAsZip(getHubConfig().newHubClient(), fos)
        } finally {
            IOUtils.closeQuietly(fos)
        }
        println("The project has been exported to \"./build/datahub-project.zip\"")
    }
}
