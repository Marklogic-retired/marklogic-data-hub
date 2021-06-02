package com.marklogic.hub.provenance;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.FlowInputs;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DeleteProvenanceTest extends AbstractHubCoreTest {

    String provenanceCollection = "http://marklogic.com/provenance-services/record";

    @Test
    void deleteAllProvenanceRecords() {
        installProjectAndRunFlow();
        ProvenanceManager provenanceManager = new ProvenanceManager(getHubClient());
        provenanceManager.deleteProvenanceRecords("P1D");
        assertEquals(2, getJobsDocCount(provenanceCollection),
                "Because the duration means nothing from the past day should be deleted, the provenance "
                        + "should still exist");
        provenanceManager.deleteProvenanceRecords("PT0S");
        assertEquals(0, getJobsDocCount(provenanceCollection));
    }

    @Test
    void invalidDuration() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            new ProvenanceManager(getHubClient()).deleteProvenanceRecords("incorrect duration");
        }, "Should throw IllegalArgumentException when an invalid duration is provided.");

        assertEquals("retainDuration must be a duration in the format of PnYnM or PnDTnHnMnS", ex.getMessage());
    }

    @Test
    void testAsUserWhoCannotDeleteJobs() {
        runAsTestUserWithRoles("data-hub-common");
        ProvenanceManager provenanceManager = new ProvenanceManager(getHubClient());
        assertThrows(RuntimeException.class, () -> provenanceManager.deleteProvenanceRecords("PT0S"));
    }

    private void installProjectAndRunFlow() {
        installProjectInFolder("test-projects/provenance-test" );
        String path = "test-projects/provenance-test/data/customers";
        FlowInputs flowInputs = new FlowInputs();
        flowInputs.setFlowName("referenced");
        flowInputs.setInputFilePath(readFileFromClasspath(path).getAbsolutePath());
        runSuccessfulFlow(flowInputs);
    }
}
