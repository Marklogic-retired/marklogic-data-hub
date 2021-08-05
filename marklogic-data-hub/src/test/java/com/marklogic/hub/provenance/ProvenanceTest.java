package com.marklogic.hub.provenance;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.FlowInputs;

public class ProvenanceTest  extends AbstractHubCoreTest {

    String provenanceCollection = "http://marklogic.com/provenance-services/record";

    protected void installProjectAndRunFlow() {
        installProjectInFolder("test-projects/provenance-test" );
        String path = "test-projects/provenance-test/data/customers";
        FlowInputs flowInputs = new FlowInputs();
        flowInputs.setFlowName("referenced");
        flowInputs.setInputFilePath(readFileFromClasspath(path).getAbsolutePath());
        runSuccessfulFlow(flowInputs);
    }
}
