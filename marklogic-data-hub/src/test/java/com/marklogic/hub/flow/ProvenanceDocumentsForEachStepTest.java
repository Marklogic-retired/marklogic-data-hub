package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class ProvenanceDocumentsForEachStepTest extends AbstractHubCoreTest {
    @Test
    void verifyProvenanceDocumentsAreGeneratedForEachStep() {
        installProjectInFolder("test-projects/addSources-step-definition-test");
        FlowInputs inputs = new FlowInputs("addSourcesFlow", "1", "2");
        addAbsoluteInputFilePath(inputs, "data");
        runFlow(inputs);
        assertEquals(2, getDocCount(HubConfig.DEFAULT_JOB_NAME, "http://marklogic.com/provenance-services/record"),
                "Two provenance records should be generated for ingesting 1 document each in each different step");
    }
}
