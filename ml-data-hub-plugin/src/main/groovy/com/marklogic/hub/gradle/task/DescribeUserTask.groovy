package com.marklogic.hub.gradle.task


import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.dataservices.SecurityService
import com.marklogic.hub.util.JacksonUtil
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class DescribeUserTask extends HubTask {

    @TaskAction
    void describeUser() {
        def propName = "user"
        def user = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (user == null) {
            throw new GradleException("Please specify a user via -Puser=(name of MarkLogic user to describe)")
        }

        def response = SecurityService.on(getHubConfig().newFinalClient(null)).describeUser(user)
        println JacksonUtil.newWriterWithSeparateLinesForArrayValues().writeValueAsString(response);
    }
}
