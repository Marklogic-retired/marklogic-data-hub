package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class DeleteHubModuleTimestampsFileTask extends HubTask {

    @TaskAction
    void deleteFile() {
        File f = hubConfig.getUserModulesDeployTimestampFile();
        if (f.exists()) {
            println "Deleting " + f.getAbsolutePath() + "\n"
            f.delete()
        }
    }
}
