package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class RunFlowTask extends HubTask {

    @TaskAction
    void runFlow() {
        def entityName = project.hasProperty("entityName") ? project.property("entityName") : null
        if (entityName == null) {
            println "entityName property is required."
            return
        }
        def flowName = project.hasProperty("flowName") ? project.property("flowName") : null
        if (flowName == null) {
            println "flowName property is required."
            return
        }
        def flowType = project.hasProperty("flowType") ?
            FlowType.getFlowType(project.property("flowType")) : null

        def batchSize = project.hasProperty("batchSize") ?
            Integer.parseInt(project.property("batchSize")) : 100

        if (!getDataHub().isInstalled()) {
            println("Data Hub is not installed.")
            return
        }

        def fm = getFlowManager()
        def flow = fm.getFlow(entityName, flowName, flowType)
        if (flow) {
            println("Running Flow: [" + entityName + ":" + flowName + "] with batch size: " + batchSize)
            fm.runFlow(flow, batchSize)
        }
        else {
            println("Flow Not Found: [" + entityName + ":" + flowName + "]")
        }
    }
}
