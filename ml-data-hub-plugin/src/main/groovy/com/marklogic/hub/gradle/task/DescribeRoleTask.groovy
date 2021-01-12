package com.marklogic.hub.gradle.task


import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.dataservices.SecurityService
import com.marklogic.hub.util.JacksonUtil
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class DescribeRoleTask extends HubTask {

    @TaskAction
    void describeRole() {
        def propName = "role"
        def role = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (role == null) {
            throw new GradleException("Please specify a role via -Prole=(name of MarkLogic role to describe)")
        }

        def response = SecurityService.on(getHubConfig().newFinalClient(null)).describeRole(role)
        println JacksonUtil.newWriterWithSeparateLinesForArrayValues().writeValueAsString(response);
    }

}
