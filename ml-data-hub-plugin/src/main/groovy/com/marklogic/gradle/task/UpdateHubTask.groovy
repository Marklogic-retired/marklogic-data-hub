package com.marklogic.gradle.task

import com.marklogic.hub.DataHub
import org.gradle.api.tasks.TaskAction

class UpdateHubTask extends HubTask {

    @TaskAction
    void updateHub() {
        if (getFlowManager().getLegacyFlows().size() > 0) {
            def updatedFlows = new ArrayList<String>()
            new DataHub(hubConfig).upgradeHub(updatedFlows)

            println "Legacy Flows Updated:\n\t" + String.join("\n\t", updatedFlows)
        }
        else {
            println "No Legacy Flows to Update"
        }
    }
}
