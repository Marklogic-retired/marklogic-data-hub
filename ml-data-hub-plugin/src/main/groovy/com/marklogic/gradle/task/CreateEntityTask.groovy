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
        def userlandPath = new File(getHubConfig().modulesPath)
        println "entityName: " + entityName
        println "userlandPath: " + userlandPath.toString()
        Scaffolding.createEntity(entityName, userlandPath)
    }

    HubConfig getHubConfig() {
        getProject().property("hubConfig")
    }
}
