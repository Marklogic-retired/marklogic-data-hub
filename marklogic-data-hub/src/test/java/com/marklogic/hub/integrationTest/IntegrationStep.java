package com.marklogic.hub.integrationTest;


import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class IntegrationStep extends AbstractHubCoreTest {

    @BeforeEach
    void setup() {
        installProjectInFolder("integration-test");
    }

    @Test
    public void testIngestStepWithSmallBatchSize() {
        //Count of items collected: 6; will be processed in 3 batches based on batchSize of 2
        //test with batch size 2, JSON files, verify load, mapping, merged and archived collections
        makeInputFilePathsAbsoluteInFlow("CurateCustomerSmallBatchJSON");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("CurateCustomerSmallBatchJSON", "1", "2", "3", "4"));
        RunStepResponse ingestionJob = flowResponse.getStepResponses().get("1");
        assertTrue(ingestionJob.isSuccess(), "ingestion job failed: " + ingestionJob.stepOutput);

        assertEquals(6, getStagingDocCount("loadCustomersJSON"), "There should be 6 doc in loadCustomersJSON collection");
        assertEquals(7, getFinalDocCount("mapCustomersJSON"), "There should be 7 doc in mapCustomersJSON collection");
        assertEquals(1, getFinalDocCount("sm-Customer-merged"), "There should be 1 doc in sm-Customer-merged collection");
        assertEquals(2, getFinalDocCount("sm-Customer-archived"), "There should be 2 doc in sm-Customer-archived collection");
    }

    @Test
    public void testEntireFlowWithJSON() {
        //test with JSON files, verify load, mapping, merged and archived collections
        makeInputFilePathsAbsoluteInFlow("CurateCustomerJSON");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("CurateCustomerJSON", "1", "2", "3", "4"));
        RunStepResponse ingestionJob = flowResponse.getStepResponses().get("1");
        assertTrue(ingestionJob.isSuccess(), "ingestion job failed: " + ingestionJob.stepOutput);

        assertEquals(6, getStagingDocCount("loadCustomersJSON"), "There should be 6 doc in loadCustomersJSON collection");
        assertEquals(7, getFinalDocCount("mapCustomersJSON"), "There should be 6 doc in mapCustomersJSON collection");
        assertEquals(1, getFinalDocCount("sm-Customer-merged"), "There should be 1 doc in sm-Customer-merged collection");
        assertEquals(2, getFinalDocCount("sm-Customer-archived"), "There should be 2 doc in sm-Customer-archived collection");
    }

    @Test
    public void testEntireFlowWithXML() {
        //test with XML files, verify load, mapping, merged and archived collections
        makeInputFilePathsAbsoluteInFlow("CurateCustomerXML");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("CurateCustomerXML", "1", "2", "3"));
        RunStepResponse ingestionJob = flowResponse.getStepResponses().get("1");
        assertTrue(ingestionJob.isSuccess(), "ingestion job failed: " + ingestionJob.stepOutput);
        assertEquals(5, getStagingDocCount("loadCustomersXML"), "There should be 5 doc in loadCustomersXML collection");
        assertEquals(5, getFinalDocCount("mapCustomersXML"), "There should be 6 doc in mapCustomersXML collection");

    }

    @Test
    public void testCustomModule() {
        // Custom module
        makeInputFilePathsAbsoluteInFlow("CurateCustomerXML");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("CurateCustomerXML", "1", "2", "3"));
        RunStepResponse customJob = flowResponse.getStepResponses().get("3");
        assertTrue(customJob.isSuccess(), "custom job failed: " + customJob.stepOutput);
        assertEquals(5, getFinalDocCount("collectionAdder"), "There should be 5 doc in collectionAdder collection");

    }

    @Test
    public void testLoadCSV() {
        //test with ONE SCV File but with 18 successFulEvents
        makeInputFilePathsAbsoluteInFlow("CMSProvider");
        RunFlowResponse flowResponse = runFlow(new FlowInputs("CMSProvider", "1"));
        RunStepResponse ingestionJob = flowResponse.getStepResponses().get("1");
        assertTrue(ingestionJob.isSuccess(), "ingestion job failed: " + ingestionJob.stepOutput);
        assertEquals(18, ingestionJob.getSuccessfulEvents(), "There should be 18 successFulEvents");


    }

}
