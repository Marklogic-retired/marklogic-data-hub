package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class ExportProjectTask extends HubTask {

    @TaskAction
    void exportJobs() {
        File exportFile = getHubProject().projectDir.resolve("build").resolve("datahub-project.zip").toFile();
        getHubConfig().getHubProject().exportProject(exportFile);
        println("The project has been exported to \"./build/datahub-project.zip\"")
    }
}
