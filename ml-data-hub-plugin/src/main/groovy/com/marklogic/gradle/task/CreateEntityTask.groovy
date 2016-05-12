package com.marklogic.gradle.task

import com.marklogic.hub.Scaffolding;
import com.marklogic.hub.HubConfig;

import org.gradle.api.DefaultTask
import org.gradle.api.tasks.TaskAction

class CreateEntityTask extends DefaultTask {

    @TaskAction
    void createEntity() {
        def propName = "entityName"
        def entityName = project.hasProperty(propName) ? project.property(propName) : null
        if (entityName == null) {
            println "entityName property is required."
            return
        }
        def projectDir = getHubConfig().projectDir
        println "entityName: " + entityName
        println "projectDir: " + projectDir.toString()
        Scaffolding scaffolding = new Scaffolding(projectDir)
        scaffolding.createEntity(entityName)
    }

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }
}
