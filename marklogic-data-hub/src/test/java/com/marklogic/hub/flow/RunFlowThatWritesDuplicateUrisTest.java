package com.marklogic.hub.flow;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RunFlowThatWritesDuplicateUrisTest extends AbstractHubCoreTest {

    @Test
    void test() {
        installProjectInFolder("test-projects/simple-custom-step");
        new ReferenceModelProject(getHubClient()).createRawCustomer(1, "Jane");

        Map<String, Object> options = new HashMap<>();
        options.put("sourceQuery", "Sequence.from(['/customer1.json', '/customer1.json'])");
        options.put("sourceQueryIsScript", true);

        RunFlowResponse r = runFlow(new FlowInputs("simpleCustomStepFlow").withOptions(options));
        assertEquals("finished", r.getJobStatus(), "Job should have finished because only one document was written " +
            "to the duplicate URI, instead of a conflicting updates error being thrown; " + r.toJson());
        assertEquals(2, r.getStepResponses().get("1").getSuccessfulEvents(),
            "Both URIs should have been processed, even though only one was written");
        assertEquals(1, getFinalDocCount("simpleCustomStep-output"),
            "Only one doc should have been written to the step output collection");
    }
}
