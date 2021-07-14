package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.HubTask
import com.marklogic.hub.impl.DataHubImpl
import org.gradle.api.tasks.TaskAction

class DeployToReplicaTask extends HubTask {

    @TaskAction
    void deployToReplica() {
        new DataHubImpl(getHubConfig()).deployToReplicaClusterOnPremise()
    }
}
