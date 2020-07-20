package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.AbstractConfirmableHubTask
import com.marklogic.hub.hubcentral.migration.FlowMigrator

class DeleteInstalledLegacyMappingsTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        new FlowMigrator(getProject().property("hubConfig")).deleteInstalledLegacyMappings()
    }

}
