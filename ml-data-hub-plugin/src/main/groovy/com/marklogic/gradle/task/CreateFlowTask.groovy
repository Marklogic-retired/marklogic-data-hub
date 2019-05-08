package com.marklogic.gradle.task

import com.marklogic.gradle.exception.FlowAlreadyPresentException
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.hub.FlowManager
import com.marklogic.hub.flow.Flow
import com.marklogic.hub.scaffold.Scaffolding
import org.gradle.api.tasks.TaskAction

class CreateFlowTask extends HubTask {

    @TaskAction
    void createFlow() {
        def propName = "flowName"
        def propEmptySteps = "emptySteps"

        def flowName = project.hasProperty(propName) ? project.property(propName) : null
        if (flowName == null) {
            throw new FlowNameRequiredException()
        }

        def emptySteps = project.hasProperty(propEmptySteps) ? Boolean.parseBoolean(project.property(propEmptySteps) as String) : false

        FlowManager flowManager = getFlowManager()
        if (flowManager.getFlow(flowName.toString()) == null) {
            if (emptySteps) {
                Flow flow = flowManager.createFlow(flowName.toString())
                flowManager.saveFlow(flow)
            }
            else {
                Scaffolding scaffolding = getScaffolding()
                scaffolding.createDefaultFlow(flowName.toString())

                println "IMPORTANT: Your new flow configuration file \"flows/" + flowName + ".flow.json\" contains step templates with " +
                    "example values, such as 'inputFilePath' and 'entity-name'. The flow will not run as is. " +
                    "You MUST customize the steps for your project before running the flow."
            }
        }
        else {
            throw new FlowAlreadyPresentException()
        }
    }
}
