package com.marklogic.gradle.task

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

import java.nio.file.Paths

class DeleteHubModuleTimestampsFileTask extends DefaultTask {

    public static final String USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES = "user-modules-deploy-timestamps.properties";
    public static final String USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES = "user-content-deploy-timestamps.properties";


    @TaskAction
    void deleteFiles() {
        File f = Paths.get(".tmp", USER_MODULES_DEPLOY_TIMESTAMPS_PROPERTIES).toFile()
        if (f.exists()) {
            println "Deleting " + f.getAbsolutePath() + "\n"
            f.delete()
        }

        f = Paths.get(".tmp", USER_CONTENT_DEPLOY_TIMESTAMPS_PROPERTIES).toFile()
        if (f.exists()) {
            println "Deleting " + f.getAbsolutePath() + "\n"
            f.delete()
        }
    }
}
