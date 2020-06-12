package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.AbstractConfirmableTask
import com.marklogic.hub.flow.impl.FlowMigrator

class DeleteInstalledLegacyMappingsTask extends AbstractConfirmableTask {

    @Override
    void executeIfConfirmed() {
        new FlowMigrator(getProject().property("hubConfig")).deleteInstalledLegacyMappings()
    }

}
