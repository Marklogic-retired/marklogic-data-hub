package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.AbstractConfirmableHubTask
import com.marklogic.hub.hubcentral.conversion.HubCentralConverter

class ConvertForHubCentralTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        new HubCentralConverter(getProject().property("hubConfig")).convertUserArtifacts()
    }
}
