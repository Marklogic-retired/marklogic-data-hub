package com.marklogic.gradle.task

import com.marklogic.gradle.exception.EntityNameRequiredException
import com.marklogic.hub.scaffold.Scaffolding
import org.gradle.api.tasks.TaskAction

class CreateEntityTask extends HubTask {

    @TaskAction
    void createEntity() {
        def propName = "entityName"
        def entityName = project.hasProperty(propName) ? project.property(propName) : null
        if (entityName == null) {
            throw new EntityNameRequiredException()
        }
        def projectDir = getHubConfig().projectDir
        println "entityName: " + entityName
        println "projectDir: " + projectDir.toString()
        Scaffolding scaffolding = new Scaffolding(projectDir, getFinalClient())
        scaffolding.createEntity(entityName)
    }
}
