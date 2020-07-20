package com.marklogic.hub.gradle.task

import com.marklogic.gradle.task.AbstractConfirmableHubTask
import com.marklogic.hub.hubcentral.migration.HubCentralMigrator

class MigrateProjectForHubCentralTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        new HubCentralMigrator(getProject().property("hubConfig")).migrateUserArtifacts()
    }
}
