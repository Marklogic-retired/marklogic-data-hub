package com.marklogic.hub.flow.connected;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.contentpump.bean.MlcpBean;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DocumentMetadataHelper;
import com.marklogic.hub.mlcp.MlcpRunner;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class RunConnectedStepsViaMlcpTest extends AbstractHubCoreTest {

    public static final String MAPPING_STEP_NAME = "mapCustomer";
    public static final String INGESTION_STEP_NAME = "ingestCustomer";
    public static final String FLOW_NAME = "ingestAndMap";
    private File projectDataDir;
    private String mlcpOutput;

    @Test
    void ingestAndMapWithOptions() {
        int recordCount = 250;

        installProject();
        writeTestDocumentsToProjectDirectory(recordCount);
        runFlowWithTransformParam("flow-name=" + FLOW_NAME + ",options={\"permissions\":\"data-hub-operator,read,data-hub-developer,update\"}");

        verifyMlcpOutputShowsSuccess(recordCount);
        verifyIngestedDataInStaging(recordCount);
        verifyMappedDataInFinal(recordCount);
    }

    @Test
    void ingestAndErrorStep() {
        int recordCount = 10;

        installProject();
        writeTestDocumentsToProjectDirectory(recordCount);
        runFlowWithTransformParam("flow-name=ingestAndErrorStep");

        verifyMlcpOutputShowsFailure(recordCount);
        assertEquals(0, getStagingDocCount(INGESTION_STEP_NAME));
        assertEquals(0, getFinalDocCount(MAPPING_STEP_NAME));
    }

    @Test
    void invalidFlowName() {
        int recordCount = 1;
        writeTestDocumentsToProjectDirectory(recordCount);
        runFlowWithTransformParam("flow-name=flowDoesntExist");

        verifyMlcpOutputContains("OUTPUT_RECORDS_FAILED: 1");
        verifyMlcpOutputContains("TransformWriter - Failed document RESTAPI-SRVEXERR: Extension Error:  code: 404 message: flow with name 'flowDoesntExist' not found");
    }

    @Test
    void invalidOptionsString() {
        int recordCount = 1;

        installProject();
        writeTestDocumentsToProjectDirectory(recordCount);

        runFlowWithTransformParam("flow-name=" + FLOW_NAME + ",options={\"hello\":world}");
        verifyMlcpOutputContains("OUTPUT_RECORDS_FAILED: 1");
        verifyMlcpOutputContains("TransformWriter - Failed document RESTAPI-SRVEXERR: Extension Error:  code: 400 message: Could not parse JSON options");
    }

    private void installProject() {
        installProjectFromUnitTestFolder("data-hub/5/flow/ingestAndMapConnected");
    }

    private void writeTestDocumentsToProjectDirectory(int count) {
        projectDataDir = getHubProject().getProjectDir().resolve("temp-data").toFile();
        projectDataDir.mkdirs();
        for (int i = 1; i <= count; i++) {
            String json = format("{\"customerId\":\"%d\"}", i);
            try {
                FileCopyUtils.copy(json.getBytes(), new File(projectDataDir, "customer" + i + ".json"));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    private void runFlowWithTransformParam(String transformParam) {
        MlcpBean mlcpBean = new MlcpBean();
        mlcpBean.setInput_file_path(projectDataDir.getAbsolutePath());
        mlcpBean.setOutput_uri_replace(".*data,'/data'");
        mlcpBean.setTransform_module("/data-hub/5/transforms/mlcp-flow-transform.sjs");
        mlcpBean.setTransform_param(transformParam);
        this.mlcpOutput = new MlcpRunner(getHubConfig(), mlcpBean).runAndReturnOutput();
    }

    private void verifyMlcpOutputShowsSuccess(int recordCount) {
        verifyMlcpOutputContains("INPUT_RECORDS: " + recordCount);
        verifyMlcpOutputContains("OUTPUT_RECORDS: " + recordCount);
        verifyMlcpOutputContains("OUTPUT_RECORDS_COMMITTED: " + recordCount);
        verifyMlcpOutputContains("OUTPUT_RECORDS_FAILED: 0");
    }

    private void verifyIngestedDataInStaging(int recordCount) {
        assertEquals(recordCount, getStagingDocCount(INGESTION_STEP_NAME));

        // Grab one doc and do a quick sanity check on it
        final String uri = "/data/customer105.json";

        JsonNode doc = getStagingDoc(uri);
        assertEquals("105", doc.get("envelope").get("instance").get("customerId").asText());

        DocumentMetadataHelper metadata = getMetadata(getHubClient().getStagingClient(), uri);
        metadata.assertInCollections(INGESTION_STEP_NAME);
        metadata.assertHasPermissions("data-hub-operator", DocumentMetadataHandle.Capability.READ);
        metadata.assertHasPermissions("data-hub-developer", DocumentMetadataHandle.Capability.UPDATE);
        metadata.assertDataHubMetadata(getHubClient().getUsername(), FLOW_NAME, INGESTION_STEP_NAME);
    }

    private void verifyMappedDataInFinal(int recordCount) {
        assertEquals(recordCount, getFinalDocCount(MAPPING_STEP_NAME));

        // Grab one doc and do a quick sanity check on it
        final String uri = "/data/customer207.json";

        JsonNode doc = getFinalDoc(uri);
        assertEquals(207, doc.get("envelope").get("instance").get("Customer").get("customerId").asInt());

        DocumentMetadataHelper metadata = getMetadata(getHubClient().getFinalClient(), uri);
        metadata.assertInCollections(MAPPING_STEP_NAME);
        metadata.assertHasPermissions("data-hub-operator", DocumentMetadataHandle.Capability.READ);
        metadata.assertHasPermissions("data-hub-developer", DocumentMetadataHandle.Capability.UPDATE);
        metadata.assertDataHubMetadata(getHubClient().getUsername(), FLOW_NAME, MAPPING_STEP_NAME);
    }

    private void verifyMlcpOutputShowsFailure(int recordCount) {
        verifyMlcpOutputContains("INPUT_RECORDS: " + recordCount);
        verifyMlcpOutputContains("OUTPUT_RECORDS: " + recordCount);
        verifyMlcpOutputContains("OUTPUT_RECORDS_FAILED: " + recordCount);

        // This is MLCP's way of logging an error for a particular document
        verifyMlcpOutputContains("TransformWriter - Failed document Error: Intentional error for testing");

        // This seems like an MLCP bug, as the DHF transform is throwing an error, but MLCP  is still counting
        // each record as committed.
        verifyMlcpOutputContains("OUTPUT_RECORDS_COMMITTED: " + recordCount);
    }

    private void verifyMlcpOutputContains(String text) {
        String message = format("Did not find text '%s' in mlcpOutput: %s", text, mlcpOutput);
        assertTrue(mlcpOutput.contains(text), message);
    }
}
