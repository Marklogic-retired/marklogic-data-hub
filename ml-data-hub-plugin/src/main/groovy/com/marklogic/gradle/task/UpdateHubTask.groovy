package com.marklogic.gradle.task

import com.marklogic.hub.scaffold.Scaffolding
import org.gradle.api.tasks.TaskAction

import java.nio.file.Path
import java.nio.file.Paths

class UpdateHubTask extends HubTask {

    @TaskAction
    void updateHub() {
        if (getFlowManager().getLegacyFlows().size() > 0) {
            def projectDir = getHubConfig().projectDir
            Scaffolding scaffolding = new Scaffolding(projectDir, getFinalClient())

            def updatedCount = 0
            Path entitiesDir = Paths.get(projectDir).resolve("plugins").resolve("entities")
            File[] entityDirs = entitiesDir.toFile().listFiles({pathname -> pathname.isDirectory()} as FileFilter)
            if (entityDirs != null) {
                for (File entityDir : entityDirs) {
                    updatedCount += scaffolding.updateLegacyFlows(entityDir.getName())
                }
            }

            println "Updated " + updatedCount + " legacy flows"
        }
        else {
            println "No updates needed"
        }
    }
}
