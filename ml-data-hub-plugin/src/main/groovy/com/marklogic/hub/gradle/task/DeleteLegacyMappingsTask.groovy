package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.AbstractConfirmableHubTask
import com.marklogic.hub.hubcentral.conversion.FlowConverter

class DeleteLegacyMappingsTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        new FlowConverter(getProject().property("hubConfig")).deleteLegacyMappings()
    }

}
