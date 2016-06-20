package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class InitProjectTask extends HubTask {

    @TaskAction
    void initProject() {
        getDataHub().initProject()
    }
}
