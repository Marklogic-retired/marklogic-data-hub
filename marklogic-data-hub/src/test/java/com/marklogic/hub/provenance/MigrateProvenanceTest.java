package com.marklogic.hub.provenance;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class MigrateProvenanceTest  extends ProvenanceTest {
    @Test
    void migrateProvenanceRecords() {
        installProjectAndRunFlow();
        ProvenanceManager provenanceManager = new ProvenanceManager(getHubClient());
        assertEquals(2, getJobsDocCount(provenanceCollection),
                "Jobs should have 2 provenance records");
        assertEquals(0, getFinalDocCount(provenanceCollection), "No provenance records should exist in Final yet.");
        provenanceManager.migrateProvenanceRecords();
        assertEquals(2, getFinalDocCount(provenanceCollection), "2 provenance records should be in Final now.");
        assertEquals(2, getJobsDocCount(provenanceCollection),
                "Jobs should still have 2 provenance records since hubDeleteProvenance hasn't been run yet. " +
                "Records are preserved for user verification of migrated data and to allow calculating PROV IDs of referenced PROV records throughout migration");
    }
}