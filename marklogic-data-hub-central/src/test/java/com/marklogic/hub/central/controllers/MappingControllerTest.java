package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.central.AbstractMvcTest;
import com.marklogic.hub.test.ReferenceModelProject;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class MappingControllerTest extends AbstractMvcTest {

    static final String VALID_MAPPING = "{\n" +
        "    \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\",\n" +
        "    \"properties\": {\n" +
        "        \"name\": {\n" +
        "            \"sourcedFrom\": \"concat(name, 'A')\"\n" +
        "        }\n" +
        "    }\n" +
        "}";

    static final String INVALID_MAPPING = "{\n" +
        "    \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\",\n" +
        "    \"properties\": {\n" +
        "        \"name\": {\n" +
        "            \"sourcedFrom\": \"concat(name, ')\"\n" +
        "        }\n" +
        "    }\n" +
        "}";

    @Test
    void testValidateMappings() throws Exception {
        runAsDataHubDeveloper();
        ReferenceModelProject project = installOnlyReferenceModelEntities();
        project.createRawCustomer(1, "Jane");

        loginAsTestUserWithRoles("hub-central-mapping-reader");

        postJson("/api/artifacts/mapping/validation?uri=/customer1.json&db=data-hub-STAGING", VALID_MAPPING)
            .andExpect(status().isOk())
            .andDo(response -> {
                JsonNode result = parseJsonResponse(response);
                System.out.println("RESULT: " + result);
                assertEquals("concat(name, 'A')", result.get("properties").get("name").get("sourcedFrom").asText());
                assertEquals("JaneA", result.get("properties").get("name").get("output").asText());
            });

        postJson("/api/artifacts/mapping/validation?uri=/customer1.json&db=data-hub-STAGING", INVALID_MAPPING)
            .andDo(response -> {
                JsonNode errorResult = parseJsonResponse(response);
                assertEquals("concat(name, ')", errorResult.get("properties").get("name").get("sourcedFrom").asText());
                assertEquals("Invalid XPath expression: concat(name, ')", errorResult.get("properties").get("name").get("errorMessage").asText());
            });
    }

    /**
     * This is just a smoke test to verify we get a response; the real tests are ML unit tests.
     */
    @Test
    void testGetMappingFunctions() throws Exception {
        loginAsTestUserWithRoles("hub-central-mapping-reader");
        getJson("/api/artifacts/mapping/functions").andExpect(status().isOk()).andDo(result -> {
            JsonNode response = parseJsonResponse(result);
            assertTrue(response.size() > 100, "Should have at least 100 functions");
            assertEquals("abs", response.get(0).get("functionName").asText(), "Should be sorted and have 'abs' as the first function");
        });
    }

    /**
     * Verifies that the structured properties of Customer - Address and Zip - are merged into the Customer to make
     * life easy for the mapping tool.
     */
    @Test
    void getEntityForMapping() throws Exception {
        runAsDataHubDeveloper();
        installReferenceModelProject();

        loginAsTestUserWithRoles("hub-central-mapping-writer");

        getJson("/api/artifacts/mapping/entity/Customer").andExpect(status().isOk()).andDo(result -> {
            JsonNode customer = parseJsonResponse(result);
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
        });
    }
}
