package com.marklogic.hub.dataservices.entitySearch;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.EntitySearchService;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class GetRecordTest extends AbstractHubCoreTest {

    private EntitySearchService service;

    @BeforeEach
    void beforeEach() {
        service = EntitySearchService.on(getHubClient().getFinalClient());
    }

    @Test
    void testGetRecord() {
        ReferenceModelProject project;project = installReferenceModelProject();
        project.setCustomerDocumentMetadata(new DocumentMetadataHandle()
                .withCollections(ReferenceModelProject.CUSTOMER_ENTITY_TYPE)
                .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE)
                .withMetadataValue("datahubCreatedInFlow", "getRecordTestFlow")
                .withMetadataValue("datahubCreatedByStep", "getRecordTestStep"));

        Customer customer1 = new Customer();
        customer1.setCustomerId(1);
        customer1.setName("Jane");
        customer1.setCustomerNumber(123456789);
        customer1.setCustomerSince("2012-05-16");

        project.createCustomerInstance(customer1);
        project.createCustomerInstance(customer1, Format.XML, "doesnt-matter");

        // xml record with metadata
        ObjectNode response = (ObjectNode) service.getRecord("/Customer1.xml");
        assertNotNull(response.get("data"));
        assertEquals("getRecordTestStep", response.get("recordMetadata").get("datahubCreatedByStep").asText());
        assertEquals("getRecordTestFlow", response.get("recordMetadata").get("datahubCreatedInFlow").asText());
        assertTrue(response.get("isHubEntityInstance").asBoolean());
        assertEquals("xml", response.get("recordType").asText());

        // json record with metadata
        response = (ObjectNode) service.getRecord("/Customer1.json");
        assertNotNull(response.get("data"));
        assertEquals("getRecordTestStep", response.get("recordMetadata").get("datahubCreatedByStep").asText());
        assertEquals("getRecordTestFlow", response.get("recordMetadata").get("datahubCreatedInFlow").asText());
        assertTrue(response.get("isHubEntityInstance").asBoolean());
        assertEquals("json", response.get("recordType").asText());

        response = (ObjectNode) service.getRecord("/non-existent-doc.xml");
        assertNull(response.get("data"));
        assertNull(response.get("recordMetadata"));
        assertNull(response.get("isHubEntityInstance"));
        assertNull(response.get("recordType"));
        assertNull(response.get("sources"));
        assertNull(response.get("history"));

        // record with no metadata
        project.setCustomerDocumentMetadata(new DocumentMetadataHandle()
                .withCollections(ReferenceModelProject.CUSTOMER_ENTITY_TYPE)
                .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE));

        Customer customer2 = new Customer();
        customer2.setCustomerId(2);
        customer2.setName("Sally");
        customer2.setCustomerNumber(123456780);
        customer2.setCustomerSince("2012-05-16");
        project.createCustomerInstance(customer2);

        response = (ObjectNode) service.getRecord("/Customer2.json");
        assertNotNull(response.get("data"));
        assertTrue(response.get("recordMetadata").isNull());
        assertTrue(response.get("isHubEntityInstance").asBoolean());
        assertEquals("json", response.get("recordType").asText());
    }

    @Test
    public void testRecordHistoryWithTwoProvenanceRecords() {
        installProjectInFolder("test-projects/provenance-test" );
        String path = "test-projects/provenance-test/data/customers";

        FlowInputs inputs = new FlowInputs("inline");
        inputs.setInputFilePath(getClass().getClassLoader().getResource(path).getPath());
        FlowRunner flowRunner = new FlowRunnerImpl(getHubClient());
        flowRunner.runFlow(inputs);
        flowRunner.awaitCompletion();

        ObjectNode response = (ObjectNode) service.getRecord("/customers/customer1.json");
        verifyHistoryAfterRunningInlineFlow((ArrayNode)response.get("history"));

        inputs.setFlowName("referenced");
        inputs.setInputFilePath(getClass().getClassLoader().getResource(path).getPath());
        flowRunner = new FlowRunnerImpl(getHubClient());
        flowRunner.runFlow(inputs);
        flowRunner.awaitCompletion();

        response = (ObjectNode) service.getRecord("/history-test/customer1.json");
        verifyHistoryAfterRunningReferencedFlow((ArrayNode)response.get("history"));
    }

    @Test
    public void testRecordHistoryTestWithOneProvenanceRecord() {
        installProjectInFolder("test-projects/provenance-test");
        String path = "test-projects/provenance-test/data/customers";

        FlowInputs inputs = new FlowInputs("inline", "1");
        inputs.setInputFilePath(getClass().getClassLoader().getResource(path).getPath());
        FlowRunner flowRunner = new FlowRunnerImpl(getHubClient());
        flowRunner.runFlow(inputs);
        flowRunner.awaitCompletion();

        ObjectNode response = (ObjectNode) service.getRecord("/customers/customer1.json");
        ArrayNode history = (ArrayNode) response.get("history");
        assertEquals(1, history.size());
        assertNotNull(history.get(0).get("updatedTime"));
        assertEquals("inline", history.get(0).get("flow").asText());
        assertEquals("ingest", history.get(0).get("step").asText());
        assertEquals(getHubConfig().getMlUsername(), history.get(0).get("user").asText());

        inputs.setFlowName("referenced");
        inputs.setInputFilePath(getClass().getClassLoader().getResource(path).getPath());
        flowRunner = new FlowRunnerImpl(getHubClient());
        flowRunner.runFlow(inputs);
        flowRunner.awaitCompletion();

        response = (ObjectNode) service.getRecord("/history-test/customer1.json");
        history = (ArrayNode) response.get("history");
        assertEquals(1, history.size());
        assertNotNull(history.get(0).get("updatedTime"));
        assertEquals("referenced", history.get(0).get("flow").asText());
        assertEquals("ingest-customer", history.get(0).get("step").asText());
        assertEquals(getHubConfig().getMlUsername(), history.get(0).get("user").asText());
    }

    @Test
    public void testRecordHistoryTestWithNoProvenanceRecord() {
        ReferenceModelProject project = installReferenceModelProject();
        project.setCustomerDocumentMetadata(new DocumentMetadataHandle()
                .withCollections(ReferenceModelProject.CUSTOMER_ENTITY_TYPE)
                .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE)
                .withMetadataValue("datahubCreatedInFlow", "getRecordTestFlow")
                .withMetadataValue("datahubCreatedByStep", "getRecordTestStep")
                .withMetadataValue("datahubCreatedBy", "test-data-hub-developer")
                .withMetadataValue("datahubCreatedOn", "2020-11-23T19:03:34.399008-08:00"));

        Customer customer1 = new Customer();
        customer1.setCustomerId(1);
        customer1.setName("Jane");
        project.createCustomerInstance(customer1);
        ObjectNode response = (ObjectNode) service.getRecord("/Customer1.json");
        ArrayNode history = (ArrayNode) response.get("history");
        assertEquals(1, history.size());

        assertNotNull(history.get(0).get("updatedTime"));
        assertEquals("getRecordTestFlow", history.get(0).get("flow").asText());
        assertEquals("getRecordTestStep", history.get(0).get("step").asText());
        assertEquals("test-data-hub-developer", history.get(0).get("user").asText());

        // record with no metadata
        project.setCustomerDocumentMetadata(new DocumentMetadataHandle()
                .withCollections(ReferenceModelProject.CUSTOMER_ENTITY_TYPE)
                .withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE));

        Customer customer2 = new Customer();
        customer2.setCustomerId(2);
        customer2.setName("Sally");
        project.createCustomerInstance(customer2);

        response = (ObjectNode) service.getRecord("/Customer2.json");
        history = (ArrayNode) response.get("history");
        assertEquals(0, history.size());
    }

    /**
     * We have had odd intermittent errors where the map and ingest history rows are switched. This is unexpected as
     * the findProvenance function is using orderBy(op.desc('dateTime')) to sort the history rows, and the map step
     * is processed after the ingest step. To prevent this test from causing PRs not to be merged, it's checking to see
     * which row is the map one and which one is the ingest one.
     *
     * @param recordHistory
     */
    private void verifyHistoryAfterRunningInlineFlow(ArrayNode recordHistory) {
        assertEquals(2, recordHistory.size());

        JsonNode mapHistory = recordHistory.get(0);
        JsonNode ingestHistory = recordHistory.get(1);
        if ("ingest".equals(mapHistory.get("step").asText())) {
            logger.warn("Unexpectedly found ingest as the first history row; ingest time: " +
                ingestHistory.get("updatedTime") + "; map time: " + mapHistory.get("updatedTime"));
            mapHistory = recordHistory.get(1);
            ingestHistory = recordHistory.get(0);
        }

        assertNotNull(mapHistory.get("updatedTime"));
        assertEquals("inline", mapHistory.get("flow").asText());
        assertEquals("map", mapHistory.get("step").asText());
        assertEquals(getHubConfig().getMlUsername(), mapHistory.get("user").asText());

        assertNotNull(ingestHistory.get("updatedTime"));
        assertEquals("inline", ingestHistory.get("flow").asText());
        assertEquals("ingest", ingestHistory.get("step").asText());
        assertEquals(getHubConfig().getMlUsername(), ingestHistory.get("user").asText());
    }

    /**
     * See comments on verifyHistoryAfterRunningInlineFlow for an explanation of why the rows may be switched here.
     *
     * @param recordHistory
     */
    private void verifyHistoryAfterRunningReferencedFlow(ArrayNode recordHistory) {
        assertEquals(2, recordHistory.size());

        JsonNode mapHistory = recordHistory.get(0);
        JsonNode ingestHistory = recordHistory.get(1);

        if ("ingest-customer".equals(mapHistory.get("step").asText())) {
            logger.warn("Unexpectedly found ingest-customer as the first history row; ingest time: " +
                ingestHistory.get("updatedTime") + "; map time: " + mapHistory.get("updatedTime"));
            mapHistory = recordHistory.get(1);
            ingestHistory = recordHistory.get(0);
        }

        assertNotNull(mapHistory.get("updatedTime"));
        assertEquals("referenced", mapHistory.get("flow").asText());
        assertEquals("map-customer", mapHistory.get("step").asText());
        assertEquals(getHubConfig().getMlUsername(), mapHistory.get("user").asText());

        assertNotNull(ingestHistory.get("updatedTime"));
        assertEquals("referenced", ingestHistory.get("flow").asText());
        assertEquals("ingest-customer", ingestHistory.get("step").asText());
        assertEquals(getHubConfig().getMlUsername(), ingestHistory.get("user").asText());
    }
}
