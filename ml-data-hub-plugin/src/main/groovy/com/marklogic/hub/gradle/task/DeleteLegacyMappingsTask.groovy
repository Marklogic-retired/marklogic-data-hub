package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.AbstractConfirmableHubTask
import com.marklogic.hub.hubcentral.migration.FlowMigrator

class DeleteLegacyMappingsTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        new FlowMigrator(getProject().property("hubConfig")).deleteLegacyMappings()
    }

}
