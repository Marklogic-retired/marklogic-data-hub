package com.marklogic.gradle.task

import com.marklogic.gradle.exception.FlowAlreadyPresentException
import com.marklogic.gradle.exception.FlowNameRequiredException
import com.marklogic.hub.FlowManager
import com.marklogic.hub.flow.Flow
import org.gradle.api.tasks.TaskAction

class CreateFlowTask extends HubTask {

    @TaskAction
    void createFlow() {
        def propName = "flowName"
        def propDesc = "description"
        def propIdentifier = "identifier"

        def flowName = project.hasProperty(propName) ? project.property(propName) : null
        def flowDesc = project.hasProperty(propDesc) ? project.property(propDesc) : null
        def flowIdentifier = project.hasProperty(propIdentifier) ? project.property(propIdentifier) : null

        if (flowName == null) {
            throw new FlowNameRequiredException()
        }

        FlowManager flowManager = getFlowManager()
        if (flowManager.getFlow(flowName.toString()) == null) {
            Flow flow = flowManager.createFlow(flowName.toString())

            if (flowDesc) {
                flow.setDescription(flowDesc.toString())
            }
            if (flowIdentifier) {
                flow.setIdentifier(flowIdentifier.toString())
            }

            flowManager.saveFlow(flow)
        } else {
            throw new FlowAlreadyPresentException()
        }
    }
}
