package com.marklogic.gradle.task

import com.marklogic.hub.flow.impl.FlowMigrator

class FlowMigrationTask extends AbstractConfirmableTask {

    @Override
    void executeIfConfirmed() {
        FlowMigrator flowMigrator = new FlowMigrator(getProject().property("hubConfig"))
        flowMigrator.migrateFlows()
    }
}
