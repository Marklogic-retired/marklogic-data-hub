package com.marklogic.hub.dataservices.models;

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

        ArrayNode entityTypes = (ArrayNode) ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes();
        assertEquals(2, entityTypes.size(), "Expecting an entry for Customer and for Order");
        // The order of types isn't guaranteed here
        entityTypes.forEach(entityType -> {
            String name = entityType.get("entityName").asText();
            if ("Order".equals(name)) {
                assertEquals("0", entityType.get("entityInstanceCount").asText());
                assertEquals("http://marklogic.com/example/Order-0.0.1/Order", entityType.get("entityTypeId").asText());
                assertFalse(entityType.has("latestJobId"), "Job data shouldn't exist since no flows have been run for this entity");
                assertFalse(entityType.has("latestJobDateTime"));
                assertEquals("Order", entityType.get("model").get("info").get("title").asText(), "Verifying that the model is included");
            } else {
                assertEquals("Customer", name);
                assertEquals("http://example.org/Customer-0.0.1/Customer", entityType.get("entityTypeId").asText());
                assertEquals("1", entityType.get("entityInstanceCount").asText());
                assertEquals("echoFlow-test", entityType.get("latestJobId").asText());
                assertTrue(entityType.has("latestJobDateTime"));
                assertEquals("Customer", entityType.get("model").get("info").get("title").asText());
            }
        });
    }

    @Test
    void noEntityModelsExist() {
        ArrayNode entityTypes = (ArrayNode) ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes();
        assertNotNull(entityTypes);
        assertEquals(0, entityTypes.size());
    }
}
