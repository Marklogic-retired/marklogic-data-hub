package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubTest;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GetPrimaryEntityTypesTest extends AbstractHubTest {

    @Test
    void referenceModelWithOneCustomerLoaded() {
        givenTheReferenceModelProjectIsLoaded();
        givenASingleCustomerDocument();
        givenACustomerFlowHasBeenRun();

        ArrayNode entityTypes = (ArrayNode) ModelsService.on(adminHubConfig.newFinalClient(null)).getPrimaryEntityTypes();
        assertEquals(2, entityTypes.size(), "Expecting an entry for Customer and for Order");
        // The order of types isn't guaranteed here
        entityTypes.forEach(entityType -> {
            String name = entityType.get("entityName").asText();
            if ("Order".equals(name)) {
                assertEquals("0", entityType.get("entityInstanceCount").asText());
                assertFalse(entityType.has("latestJobId"), "Job data shouldn't exist since no flows have been run for this entity");
                assertFalse(entityType.has("latestJobDateTime"));
                assertEquals("Order", entityType.get("model").get("info").get("title").asText(), "Verifying that the model is included");
            } else {
                assertEquals("Customer", name);
                assertEquals("1", entityType.get("entityInstanceCount").asText());
                assertEquals("echoFlow-test", entityType.get("latestJobId").asText());
                assertTrue(entityType.has("latestJobDateTime"));
                assertEquals("Customer", entityType.get("model").get("info").get("title").asText());
            }
        });
    }

    @Test
    void noEntityModelsExist() {
        resetProject();
        ArrayNode entityTypes = (ArrayNode) ModelsService.on(adminHubConfig.newFinalClient(null)).getPrimaryEntityTypes();
        assertNotNull(entityTypes);
        assertEquals(0, entityTypes.size());
    }

    private void givenTheReferenceModelProjectIsLoaded() {
        resetProject();
        loadReferenceModelProject();
    }

    private void givenASingleCustomerDocument() {
        JSONDocumentManager mgr = adminHubConfig.newFinalClient().newJSONDocumentManager();
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode customer1 = mapper.createObjectNode();
        customer1.put("name", "Customer One");
        DocumentMetadataHandle metadata = new DocumentMetadataHandle()
            .withCollections("customer-input")
            .withPermission("data-hub-operator", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);
        mgr.write("/customer/customer-1.json", metadata, new JacksonHandle(customer1));
    }

    private void givenACustomerFlowHasBeenRun() {
        runAsDataHubOperator();

        FlowInputs inputs = new FlowInputs("echoFlow");
        inputs.setJobId("echoFlow-test");

        FlowRunner flowRunner = new FlowRunnerImpl(host, adminHubConfig.getMlUsername(), adminHubConfig.getMlPassword());
        flowRunner.runFlow(inputs);
        flowRunner.awaitCompletion();
    }
}
