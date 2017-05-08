package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class HubInfoTask extends HubTask {

    @TaskAction
    void dumpHubInfo() {
        print(this.hubConfig.toString());
    }
}
