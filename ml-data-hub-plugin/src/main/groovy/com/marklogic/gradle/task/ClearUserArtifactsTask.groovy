package com.marklogic.gradle.task

import com.marklogic.hub.impl.DataHubImpl

class ClearUserArtifactsTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        println "Clearing user artifacts. This requires a user that has update permission on each artifact type."
        new DataHubImpl(getProject().property("hubConfig").newHubClient()).clearUserArtifacts()
        println "Finished clearing user artifacts."
    }

}
