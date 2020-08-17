package com.marklogic.gradle.task

import com.marklogic.hub.impl.FlowManagerImpl
import org.apache.commons.lang3.tuple.Pair
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class AddStepToFlowTask extends HubTask {

    @TaskAction
    void createStep() {
        String flowName = project.hasProperty("flowName") ? project.property("flowName").toString() : null
        String stepName =  project.hasProperty("stepName") ? project.property("stepName").toString() : null
        String stepType =  project.hasProperty("stepType") ? project.property("stepType").toString() : null

        if (flowName == null || stepName == null || stepType == null) {
            throw new GradleException("Please specify a flow name, step name and step type via -PflowName=myFlowName -PstepName=MyStepName and -PstepType=(ingestion|mapping|custom)")
        }
        Pair<File, String> results = new FlowManagerImpl(getHubConfig()).addStepToFlow(flowName, stepName, stepType)

        if (results.getRight() != null) {
            println results.getRight()
        }
        println "Updated flow file is at: " + results.getLeft().getAbsolutePath()
    }

}
