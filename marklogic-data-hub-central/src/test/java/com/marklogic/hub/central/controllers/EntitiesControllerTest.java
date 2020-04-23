package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.AbstractHubCentralTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class EntitiesControllerTest extends AbstractHubCentralTest {

    @Autowired
    EntitiesController controller;

    @Test
    void test() {
        installReferenceProject();

        Collection<JsonNode> models = controller.getEntityModels();
        assertEquals(2, models.size(), "Expecting Customer and Order");
        for (JsonNode model : models) {
            assertTrue(model.has("info"));
            assertTrue(model.has("definitions"));
        }

        JsonNode customer = controller.getEntity("Customer", true);
        JsonNode properties = customer.get("definitions").get("Customer").get("properties");

        JsonNode shipping = properties.get("shipping");
        assertTrue(shipping.has("subProperties"), "shipping should be expanded to include the Address properties");
        JsonNode shippingProperties = shipping.get("subProperties");
        assertEquals("string", shippingProperties.get("street").get("datatype").asText());
        assertEquals("string", shippingProperties.get("city").get("datatype").asText());
        assertEquals("string", shippingProperties.get("state").get("datatype").asText());

        JsonNode zip = shipping.get("subProperties").get("zip");
        assertTrue(zip.has("subProperties"), "zip should be expanded to include the Zip properties");
        JsonNode zipProperties = zip.get("subProperties");
        assertEquals("string", zipProperties.get("fiveDigit").get("datatype").asText());
        assertEquals("string", zipProperties.get("plusFour").get("datatype").asText());
    }
}
