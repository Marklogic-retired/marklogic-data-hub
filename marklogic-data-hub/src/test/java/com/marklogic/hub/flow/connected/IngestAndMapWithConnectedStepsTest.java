package com.marklogic.hub.flow.connected;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.ResourceNotFoundException;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.DocumentMetadataHelper;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * These tests are focused on ensuring that the REST extension works correctly. Exhaustive tests of connected steps
 * are expected to be done via marklogic-unit-test tests.
 */
public class IngestAndMapWithConnectedStepsTest extends AbstractHubCoreTest {

    @Test
    void jsonContent() {
        installProjectFromUnitTestFolder("data-hub/5/flow/ingestAndMapConnected");

        HubFlowRunnerResource.Input input = new HubFlowRunnerResource.Input("ingestAndMap");
        input.addContent("/customer1.json").put("customerId", "1");
        input.addContent("/customer2.json").put("customerId", "2");

        verifyResults(newResource().runFlow(input));
    }

    @Test
    void xmlContent() {
        final String flowName = "ingestXmlAndMap";
        final String ingestStep = "ingestXmlCustomer";
        final String mapStep = "mapXmlCustomer";

        installProjectFromUnitTestFolder("data-hub/5/flow/ingestAndMapConnected");

        String input = format("<input><flowName>%s</flowName>", flowName);
        input += "<content><uri>/customer1.xml</uri><value><customerId>1</customerId></value></content>";
        input += "<content><uri>/customer2.xml</uri><value><customerId>2</customerId></value></content>";
        input += "</input>";

        RunFlowResponse response = newResource().runFlowWithXmlInput(input);
        verifyFlowResponseFields(response);
        verifyIngestResponse(response, flowName, ingestStep);
        verifyMapResponse(response, flowName, mapStep);
        verifyStagingMetadata("/customer1.xml", flowName, ingestStep);
        verifyStagingMetadata("/customer2.xml", flowName, ingestStep);
        verifyFinalMetadata("/customer1.xml", flowName, mapStep);
        verifyFinalMetadata("/customer2.xml", flowName, mapStep);

        Fragment doc = getStagingXmlDoc("/customer1.xml");
        assertEquals("1", doc.getElementValue("/es:envelope/es:instance/customerId"));
        doc = getStagingXmlDoc("/customer2.xml");
        assertEquals("2", doc.getElementValue("/es:envelope/es:instance/customerId"));
        doc = getFinalXmlDoc("/customer1.xml");
        assertEquals("1", doc.getElementValue("/es:envelope/es:instance/Customer/customerId"));
        doc = getFinalXmlDoc("/customer2.xml");
        assertEquals("2", doc.getElementValue("/es:envelope/es:instance/Customer/customerId"));
    }

    @Test
    void xmlIngestedAsJson() {
        installProjectFromUnitTestFolder("data-hub/5/flow/ingestAndMapConnected");

        // Verify options are handled correctly by adjust the source format of the ingestion step
        String input = "<input><flowName>ingestAndMap</flowName>";
        input += "<options>{\"sourceFormat\":\"xml\"}</options>";
        input += "<content><uri>/customer1.json</uri><value><customerId>1</customerId></value></content>";
        input += "<content><uri>/customer2.json</uri><value><customerId>2</customerId></value></content>";
        input += "</input>";

        verifyResults(newResource().runFlowWithXmlInput(input));
    }

    @Test
    void jsonNoContent() {
        installProjectFromUnitTestFolder("data-hub/5/flow/ingestAndMapConnected");

        HubFlowRunnerResource.Input input = new HubFlowRunnerResource.Input("ingestAndMap");
        verifyNoContentResults(newResource().runFlow(input));
    }

    @Test
    void xmlNoContent() {
        installProjectFromUnitTestFolder("data-hub/5/flow/ingestAndMapConnected");

        String input = "<input><flowName>ingestAndMap</flowName>";
        input += "<options>{\"sourceFormat\":\"xml\"}</options>";
        input += "</input>";

        verifyNoContentResults(newResource().runFlowWithXmlInput(input));
    }

    @Test
    void missingFlowName() {
        final String expectedNotFoundText = "flow with name '' not found";
        ResourceNotFoundException notFoundError = assertThrows(ResourceNotFoundException.class,
            () -> newResource().runFlowWithXmlInput("<input><noFlowName/></input>"));
        assertTrue(notFoundError.getMessage().contains(expectedNotFoundText), "Unexpected message: " + notFoundError.getMessage());

        notFoundError = assertThrows(ResourceNotFoundException.class,
            () -> newResource().runFlow(new HubFlowRunnerResource.Input("")));
        assertTrue(notFoundError.getMessage().contains(expectedNotFoundText), "Unexpected message: " + notFoundError.getMessage());
    }

    @Test
    void malformedOptionsInXmlRequest() {
        final String input = "<input><flowName>ingestAndMap</flowName>"
            + "<options>{malformed-json}</options>"
            + "</input>";
        FailedRequestException ex = assertThrows(FailedRequestException.class, () -> newResource().runFlowWithXmlInput(input));
        assertTrue(ex.getMessage().contains("Could not parse JSON options"));
    }

    private HubFlowRunnerResource newResource() {
        return new HubFlowRunnerResource(getHubClient().getStagingClient());
    }

    private void verifyResults(RunFlowResponse response) {
        verifyFlowResponseFields(response);
        verifyIngestResponse(response, "ingestAndMap", "ingestCustomer");
        verifyMapResponse(response, "ingestAndMap", "mapCustomer");
        verifyJsonDocs();
    }

    private void verifyFlowResponseFields(RunFlowResponse response) {
        assertNotNull("job123", response.getJobId());
        assertEquals("finished", response.getJobStatus());
        assertEquals("2", response.getLastAttemptedStep());
        assertEquals("2", response.getLastCompletedStep());
        assertEquals(getHubClient().getUsername(), response.getUser());
        assertNotNull(response.getStartTime());
        assertNotNull(response.getEndTime());
    }

    private void verifyIngestResponse(RunFlowResponse runFlowResponse, String flowName, String stepName) {
        RunStepResponse ingestResponse = runFlowResponse.getStepResponses().get("1");
        assertEquals(flowName, ingestResponse.getFlowName());
        assertEquals(stepName, ingestResponse.getStepName());
        assertEquals("default-ingestion", ingestResponse.getStepDefinitionName());
        assertEquals("ingestion", ingestResponse.getStepDefinitionType());
        assertNull(ingestResponse.getTargetEntityType());
        assertEquals(getHubClient().getDbName(DatabaseKind.STAGING), ingestResponse.getTargetDatabase());
        assertNull(ingestResponse.getStepOutput());
        assertNull(ingestResponse.getFullOutput());
        assertEquals("completed step 1", ingestResponse.getStatus());
        assertEquals(2, ingestResponse.getTotalEvents());
        assertEquals(2, ingestResponse.getSuccessfulEvents());
        assertEquals(0, ingestResponse.getFailedEvents());
        assertEquals(1, ingestResponse.getSuccessfulBatches());
        assertEquals(0, ingestResponse.getFailedBatches());
        assertTrue(ingestResponse.isSuccess());
        assertNotNull(ingestResponse.getStepStartTime());
        assertNotNull(ingestResponse.getStepEndTime());
    }

    private void verifyMapResponse(RunFlowResponse runFlowResponse, String flowName, String stepName) {
        RunStepResponse mapResponse = runFlowResponse.getStepResponses().get("2");
        assertEquals(flowName, mapResponse.getFlowName());
        assertEquals(stepName, mapResponse.getStepName());
        assertEquals("entity-services-mapping", mapResponse.getStepDefinitionName());
        assertEquals("mapping", mapResponse.getStepDefinitionType());
        assertEquals("http://example.org/Customer-0.0.1/Customer", mapResponse.getTargetEntityType());
        assertEquals(getHubClient().getDbName(DatabaseKind.FINAL), mapResponse.getTargetDatabase());
        assertNull(mapResponse.getStepOutput());
        assertNull(mapResponse.getFullOutput());
        assertEquals("completed step 2", mapResponse.getStatus());
        assertEquals(2, mapResponse.getTotalEvents());
        assertEquals(2, mapResponse.getSuccessfulEvents());
        assertEquals(0, mapResponse.getFailedEvents());
        assertEquals(1, mapResponse.getSuccessfulBatches());
        assertEquals(0, mapResponse.getFailedBatches());
        assertTrue(mapResponse.isSuccess());
        assertNotNull(mapResponse.getStepStartTime());
        assertNotNull(mapResponse.getStepEndTime());
    }

    private void verifyJsonDocs() {
        final String flowName = "ingestAndMap";

        JsonNode doc = getStagingDoc("/customer1.json");
        assertEquals("1", doc.get("envelope").get("instance").get("customerId").asText());
        verifyStagingMetadata("/customer1.json", flowName, "ingestCustomer");

        doc = getStagingDoc("/customer2.json");
        assertEquals("2", doc.get("envelope").get("instance").get("customerId").asText());
        verifyStagingMetadata("/customer2.json", flowName, "ingestCustomer");

        doc = getFinalDoc("/customer1.json");
        assertEquals(1, doc.get("envelope").get("instance").get("Customer").get("customerId").asInt());
        verifyFinalMetadata("/customer1.json", flowName, "mapCustomer");

        doc = getFinalDoc("/customer2.json");
        assertEquals(2, doc.get("envelope").get("instance").get("Customer").get("customerId").asInt());
        verifyFinalMetadata("/customer2.json", flowName, "mapCustomer");
    }

    private void verifyStagingMetadata(String uri, String flowName, String stepName) {
        DocumentMetadataHelper metadata = getMetadata(getHubClient().getStagingClient(), uri);
        metadata.assertInCollections("ingestCustomer");
        metadata.assertHasPermissions("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        metadata.assertDataHubMetadata(getHubClient().getUsername(), flowName, stepName);
    }

    private void verifyFinalMetadata(String uri, String flowName, String stepName) {
        DocumentMetadataHelper metadata = getMetadata(getHubClient().getFinalClient(), uri);
        metadata.assertInCollections("mapCustomer");
        metadata.assertHasPermissions("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        metadata.assertDataHubMetadata(getHubClient().getUsername(), flowName, stepName);
    }

    private void verifyNoContentResults(RunFlowResponse response) {
        assertEquals("finished", response.getJobStatus(), "A flow can still finish successfully without processing any content");
        assertEquals(0, response.getStepResponses().get("1").getTotalEvents());
        assertEquals(0, response.getStepResponses().get("2").getTotalEvents());
    }
}
