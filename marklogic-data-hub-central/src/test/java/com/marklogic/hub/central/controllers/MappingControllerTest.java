package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.AbstractHubCentralTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class MappingControllerTest extends AbstractHubCentralTest {

    @Autowired
    MappingController controller;

    static final String VALID_MAPPING = "{\n" +
        "    \"targetEntityType\": \"http://marklogic.com/data-hub/example/Customer-0.0.1/Customer\",\n" +
        "    \"properties\": {\n" +
        "        \"id\": {\n" +
        "            \"sourcedFrom\": \"concat(id, 'A')\"\n" +
        "        }\n" +
        "    }\n" +
        "}";

    static final String INVALID_MAPPING = "{\n" +
        "    \"targetEntityType\": \"http://marklogic.com/data-hub/example/Customer-0.0.1/Customer\",\n" +
        "    \"properties\": {\n" +
        "        \"id\": {\n" +
        "            \"sourcedFrom\": \"concat(id, ')\"\n" +
        "        }\n" +
        "    }\n" +
        "}";

    static final String TEST_ENTITY_MODEL = "{\n" +
        "    \"info\": {\n" +
        "        \"title\": \"Customer\",\n" +
        "        \"version\": \"0.0.1\",\n" +
        "        \"description\": \"A customer\",\n" +
        "        \"baseUri\": \"http://marklogic.com/data-hub/example/\"\n" +
        "    },\n" +
        "    \"definitions\": {\n" +
        "        \"Customer\": {\n" +
        "            \"primaryKey\": \"id\",\n" +
        "            \"required\": [],\n" +
        "            \"properties\": {\n" +
        "                \"id\": {\n" +
        "                    \"datatype\": \"string\",\n" +
        "                    \"collation\": \"http://marklogic.com/collation/codepoint\"\n" +
        "                }\n" +
        "            }\n" +
        "        }\n" +
        "    }\n" +
        "}";

    static final String TEST_ENTITY_INSTANCE = "{\n" +
        "    \"envelope\": {\n" +
        "        \"instance\": {\n" +
        "            \"id\": \"100\"\n" +
        "        },\n" +
        "        \"attachments\": null\n" +
        "    }\n" +
        "}";

    @Test
    @WithMockUser(roles = "readMapping")
    void testValidateMappings() {
        DatabaseClient databaseClient = getHubClient().getFinalClient();
        databaseClient.newJSONDocumentManager().write(
            "/test/entities/Customer.entity.json",
            new DocumentMetadataHandle().withCollections("http://marklogic.com/entity-services/models"),
            new StringHandle(TEST_ENTITY_MODEL).withFormat(Format.JSON)
        );
        databaseClient.newJSONDocumentManager().write(
            "/test/customer100.json",
            new StringHandle(TEST_ENTITY_INSTANCE).withFormat(Format.JSON)
        );

        ObjectNode result = controller.testMapping(readJsonObject(VALID_MAPPING), "/test/customer100.json", getHubClient().getDbName(DatabaseKind.FINAL)).getBody();
        assertEquals("concat(id, 'A')", result.get("properties").get("id").get("sourcedFrom").asText(), "SourcedFrom should be concat(id, 'A')");
        assertEquals("100A", result.get("properties").get("id").get("output").asText(), "outpus should be 100A");

        ObjectNode errorResult = controller.testMapping(readJsonObject(INVALID_MAPPING), "/test/customer100.json", getHubClient().getDbName(DatabaseKind.FINAL)).getBody();
        assertEquals("concat(id, ')", errorResult.get("properties").get("id").get("sourcedFrom").asText(), "SourcedFrom should be concat(id, ')");
        assertEquals("Invalid XPath expression: concat(id, ')", errorResult.get("properties").get("id").get("errorMessage").asText(), "errorMessage should be Invalid XPath expression: concat(id, ')");
    }

    @Test
    @WithMockUser(roles = {"readMapping","writeMapping"})
    void testGetMappingFunctions() {
        ObjectNode result = controller.getMappingFunctions().getBody();
        assertTrue(result.size() > 100, "Should have at least 100 functions");
        assertTrue(result.get("sum") != null, "Should have function 'sum'");
        assertEquals("sum(xs:anyAtomicType*)", result.get("sum").get("signature").asText(), "Signature should be sum(xs:anyAtomicType*)");
        assertTrue(result.get("doc") != null, "Should have function 'doc'");
        assertTrue(result.get("current-dateTime") != null, "Should have function 'current-dateTime'");
        assertTrue(result.get("parseDateTime") != null, "Should have function 'parseDateTime'");
        assertTrue(result.get("fn:sum") == null, "'fn:' has been stripped from the function name and signature");
    }

    /**
     * Verifies that the structured properties of Customer - Address and Zip - are merged into the Customer to make
     * life easy for the mapping tool.
     */
    @Test
    @WithMockUser(roles = {"readMapping","writeMapping"})
    void getEntityForMapping() {
        installReferenceModelProject();

        JsonNode customer = controller.getEntityForMapping("Customer");
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
