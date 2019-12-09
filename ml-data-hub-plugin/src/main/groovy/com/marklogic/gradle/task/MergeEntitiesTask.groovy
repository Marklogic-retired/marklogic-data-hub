package com.marklogic.gradle.task

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class MergeEntitiesTask extends HubTask  {
    @TaskAction
    void mergeDocs() {
        def propName = "mergeURIs"
        def mergeURIs = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (mergeURIs == null) {
            throw new GradleException("mergeURIs is a required parameter. Supply the parameter with -PmergeURIs=URI1,URI2,...n")
        }
        def flowName = project.hasProperty('flowName') ? project.property('flowName').toString() : null
        if (flowName == null) {
            throw new GradleException("flowName is a required parameter. Supply the parameter with -PflowName=myFlow")
        }
        def stepNumber = project.hasProperty('stepNumber') ? project.property('stepNumber').toString() : '1'
        def preview = project.hasProperty('preview') ? project.property('preview').asBoolean() : Boolean.FALSE
        def options = (JsonNode) (project.hasProperty('options') ? new ObjectMapper().readTree(project.property('options').toString()) : new ObjectMapper().readTree('{}'))
        println "mergeURIs: " + mergeURIs
        println "flowName: " + flowName
        println "stepNumber: " + stepNumber
        println "preview: " + preview
        println "options: " + options

        def mergeResponse = getMasteringManager().merge(Arrays.asList(mergeURIs.split(',')), flowName, stepNumber, preview, options);
        println mergeResponse.toString()
    }
}
