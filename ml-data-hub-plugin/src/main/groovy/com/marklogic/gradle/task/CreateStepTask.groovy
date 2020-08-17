package com.marklogic.gradle.task

import com.marklogic.hub.impl.ScaffoldingImpl
import org.apache.commons.lang3.tuple.Pair
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class CreateStepTask extends HubTask {

    @TaskAction
    void createStep() {
        String stepDefName = project.hasProperty("stepDefName") ? project.property("stepDefName").toString() : null
        String stepName =  project.hasProperty("stepName") ? project.property("stepName").toString() : null
        String stepType =  project.hasProperty("stepType") ? project.property("stepType").toString() : null
        String entityType = project.hasProperty("entityType") ? project.property("entityType").toString() : null

        if (stepName == null || stepType == null) {
            throw new GradleException("Please specify a step name and step type via -PstepName=MyStepName and -PstepType=(ingestion|mapping|custom|matching|merging)")
        }
        if("mastering".equalsIgnoreCase(stepType)){
            throw new GradleException("Creating mastering steps is not supported. Matching and merging steps are recommended instead.")
        }
        if ("mapping".equalsIgnoreCase(stepType)){
            if(entityType == null){
                throw new GradleException("Please specify an entity type for the mapping step")
            }
        }
        if(stepDefName != null) {
            if(!("ingestion".equalsIgnoreCase(stepType) || "custom".equalsIgnoreCase(stepType))) {
                throw new GradleException("Cannot specify step definition name for '" + stepType + "' steps")
            }
        }
        Pair<File, String> results = new ScaffoldingImpl(getHubConfig()).createStepFile(stepName, stepType, stepDefName, entityType)

        if (results.getRight() != null) {
            println results.getRight()
        }
        println "Step file is at: " + results.getLeft().getAbsolutePath()
    }

}
