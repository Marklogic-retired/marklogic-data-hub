package com.marklogic.gradle.task

import org.gradle.api.GradleException
import org.gradle.api.tasks.TaskAction

/**
 * This is a copy of AbstractConfirmableTask that extends HubTask primarily to avoid warnings now that we're using
 * Gradle 6 to build this project.
 */
abstract class AbstractConfirmableHubTask extends HubTask {

    @TaskAction
    void executeTask() {
        boolean executed = false
        if (project.hasProperty("confirm")) {
            if ("true".equals(project.property("confirm"))) {
                executed = true
                executeIfConfirmed()
            }
        }

        // Throwing an exception so that any tasks that are run after this task are not executed either
        if (!executed) {
            throw new GradleException("To execute this task, set the 'confirm' property to 'true'; e.g. '-Pconfirm=true'")
        }
    }

    abstract void executeIfConfirmed()
}
