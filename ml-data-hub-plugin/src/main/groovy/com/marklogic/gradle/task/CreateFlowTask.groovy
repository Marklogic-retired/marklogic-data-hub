package com.marklogic.gradle.task

import com.fasterxml.jackson.databind.ObjectMapper
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.hub.FlowManager
import com.marklogic.hub.dataservices.ArtifactService
import com.marklogic.hub.impl.FlowManagerImpl
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction
import org.springframework.util.FileCopyUtils

class CreateFlowTask extends HubTask {

    @TaskAction
    void createFlow() {
        def propName = "flowName"
        def flowName = project.hasProperty(propName) ? project.property(propName).toString() : null
        if (flowName == null) {
            throw new FlowNameRequiredException()
        }

        def withInlineSteps = project.hasProperty("withInlineSteps") ? Boolean.parseBoolean(project.property("withInlineSteps")) : false

        FlowManager flowManager = getFlowManager()
        if (flowManager.getLocalFlow(flowName) != null) {
            throw new GradleException("A flow with a name of '${flowName}' already exists")
        }
        def file;
        if (withInlineSteps) {
            file = getScaffolding().createDefaultFlow(flowName)
            println "Created new flow at: " + file.getAbsolutePath()
            println "IMPORTANT: The flow contains step templates with " +
                "example values, such as 'inputFilePath' and 'entity-name'. The flow will not run as is. " +
                "You MUST customize the steps for your project before running the flow."
        } else {
            // Not using FlowImpl because that generates at least one property - version - which doesn't do anything and
            // thus will confuse the user. User only needs a few things to get started here.
            def json = '{\n' +
                '  "name" : "' + flowName + '",\n' +
                '  "description" : "Flow description",\n' +
                '  "steps" : { }\n' +
                '}\n'
            file = ((FlowManagerImpl)flowManager).getFileForLocalFlow(flowName)
            FileCopyUtils.copy(json.getBytes(), file)
            println "Created new flow at: " + file.getAbsolutePath()
        }
        ObjectMapper mapper = new ObjectMapper()
        try{
            ArtifactService service = ArtifactService.on(hubConfig.newStagingClient(null))
            service.setArtifact("flow", flowName, mapper.readTree(file))
            println "The flow '" + flowName + "' has been written to staging and final databases."
        }
        catch (Exception e){
            println "Unable to write flow to database;cause: " + e.getMessage()
        }
    }
}
