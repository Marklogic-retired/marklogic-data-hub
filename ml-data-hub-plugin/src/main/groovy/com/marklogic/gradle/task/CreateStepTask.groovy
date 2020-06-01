package com.marklogic.gradle.task

import com.marklogic.hub.impl.ScaffoldingImpl
import org.apache.commons.lang3.tuple.Pair
import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

class CreateStepTask extends HubTask {

    @TaskAction
    void createStep() {
        if (!project.hasProperty("stepName") || !project.hasProperty("stepType")) {
            throw new GradleException("Please specify a step name and step type via -PstepName=MyStepName and -PstepType=(ingestion|mapping)")
        }

        Pair<File, String> results = new ScaffoldingImpl(getHubConfig()).createStepFile(project.property("stepName"), project.property("stepType"))
        println "Created step file at: " + results.getLeft().getAbsolutePath()
        if (results.getRight() != null) {
            println results.getRight()
        }
    }

}
