package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.flow.FlowInputs;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class GetPrimaryEntityTypesTest extends AbstractHubCoreTest {

    @Test
    void referenceModelWithOneCustomerLoaded() {
        installReferenceModelProject().createRawCustomer(1, "Customer One");
        runFlow(new FlowInputs("echoFlow").withJobId("echoFlow-test"));

        ArrayNode entityTypes = (ArrayNode) ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes(Boolean.TRUE);
        assertEquals(2, entityTypes.size(), "Expecting an entry for Customer and for Order");
        // The entity types are sorted alphabetically.
        JsonNode customerNode = entityTypes.get(0);
        assertEquals("Customer", customerNode.get("entityName").asText());
        assertEquals("http://example.org/Customer-0.0.1/Customer", customerNode.get("entityTypeId").asText());
        assertEquals("1", customerNode.get("entityInstanceCount").asText());
        assertEquals("echoFlow-test", customerNode.get("latestJobId").asText());
        assertTrue(customerNode.has("latestJobDateTime"));
        assertEquals("Customer", customerNode.get("model").get("info").get("title").asText());

        JsonNode orderNode = entityTypes.get(1);
        assertEquals("Order", orderNode.get("entityName").asText());
        assertEquals("0", orderNode.get("entityInstanceCount").asText());
        assertEquals("http://marklogic.com/example/Order-0.0.1/Order", orderNode.get("entityTypeId").asText());
        assertFalse(orderNode.has("latestJobId"), "Job data shouldn't exist since no flows have been run for this entity");
        assertFalse(orderNode.has("latestJobDateTime"));
        assertEquals("Order", orderNode.get("model").get("info").get("title").asText(), "Verifying that the model is included");
    }

    @Test
    void noEntityModelsExist() {
        ArrayNode entityTypes = (ArrayNode) ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes(Boolean.TRUE);
        assertNotNull(entityTypes);
        assertEquals(0, entityTypes.size());
    }
}
