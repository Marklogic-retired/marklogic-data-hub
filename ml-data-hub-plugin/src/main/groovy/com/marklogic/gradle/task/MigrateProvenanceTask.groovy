package com.marklogic.gradle.task

import com.marklogic.hub.provenance.ProvenanceManager

class MigrateProvenanceTask extends AbstractConfirmableHubTask {

    @Override
    void executeIfConfirmed() {
        new ProvenanceManager(getHubConfig().newHubClient()).migrateProvenanceRecords();
        println "Provenance migration has completed! Once you have reviewed the migrated provenance, you may remove" +
                " the old provenance with the hubDeleteProvenance task by specifying -PprovenanceDatabase=data-hub-JOBS -PretainDuration=PT0S."
    }
}
