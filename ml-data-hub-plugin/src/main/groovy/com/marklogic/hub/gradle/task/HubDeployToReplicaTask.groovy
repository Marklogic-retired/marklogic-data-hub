package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.dhs.DhsDeployer
import org.gradle.api.tasks.TaskAction

class HubDeployToReplicaTask extends HubTask {

    @TaskAction
    void hubDeployToReplica() {
        new DhsDeployer().deployToReplica(getHubConfig())
    }
}
