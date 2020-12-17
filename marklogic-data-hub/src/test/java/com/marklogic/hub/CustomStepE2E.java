package com.marklogic.hub;

import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CustomStepE2E extends AbstractHubCoreTest {

    @BeforeEach
    void setup(){
        installProjectInFolder("mapping-test");
    }

    @Test
    public void testCustomStep() {
        makeInputFilePathsAbsoluteInFlow("Admissions");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("Admissions", "1", "2", "3", "4"));
        RunStepResponse ingestionJob = flowResponse.getStepResponses().get("3");
        assertTrue(ingestionJob.isSuccess(), "Custom ingestion job failed: " + ingestionJob.stepOutput);
        assertEquals(806, getStagingDocCount("LabsCore"), "There should be 806 doc in LabsCore collection");
        assertEquals(372, getFinalDocCount("CompletedAdmissions"), "There should be 372 doc in CompletedAdmissions collection");

        runFlow(new FlowInputs("Admissions", "5"));
        assertEquals(372, getFinalDocCount("mdm-content"), "There should be 372 doc in mdm-content collection");
    }

    @Test
    void runStepWithoutMainModule(){
        runInModules("xdmp:document-delete(\"/custom-modules/ingestion/LabsCore/main.sjs\")");
        makeInputFilePathsAbsoluteInFlow("Admissions");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("Admissions", "2"));
        RunStepResponse ingestionStepResp = flowResponse.getStepResponses().get("2");
        assertEquals(false, ingestionStepResp.isSuccess());
        assertTrue(ingestionStepResp.getStepOutput().get(0).contains("Unable to access module: /custom-modules/ingestion/LabsCore/main.sjs. Verify that this module is in your modules database and that your user account has a role that grants read and execute permission to this module."));

    }

    @Test
    void runMainWithCompilationError() throws IOException {
        String resourceName = "mapping-test/modules/root/custom-modules/ingestion/LabsCore/main.sjs";
        String module = getResource(resourceName);
        //This is done to introduce a compilation error in the sjs module.
        StringHandle handle = new StringHandle(module.replaceFirst("options", "options{}"));
        getHubClient().getModulesClient().newTextDocumentManager().write("/custom-modules/ingestion/LabsCore/main.sjs", buildMetadataWithModulePermissions()
            , handle);
        makeInputFilePathsAbsoluteInFlow("Admissions");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("Admissions", "2"));
        RunStepResponse ingestionStepResp = flowResponse.getStepResponses().get("2");
        assertEquals(false, ingestionStepResp.isSuccess());
        assertTrue(ingestionStepResp.getStepOutput().get(0).contains("Unable to run module: /custom-modules/ingestion/LabsCore/main.sjs"));
    }
}
