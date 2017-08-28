package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class UpdateHubTask extends HubTask {

    @TaskAction
    void updateHub() {
        if (getFlowManager().getLegacyFlows().size() > 0) {
            def updatedFlows = getFlowManager().updateLegacyFlows()

            println "Legacy Flows Updated:\n\t" + String.join("\n\t", updatedFlows)
        }
        else {
            println "No Legacy Flows to Update"
        }
    }
}
