package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.AbstractHubCentralTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

public class MappingControllerTest extends AbstractHubCentralTest {

    @Autowired
    MappingController controller;

    static final String MAPPING_CONFIG_1 = "{\n" +
        "  \"name\": \"TestCustomerMapping\",\n" +
        "  \"targetEntityType\": \"http://example.org/Customer-0.0.1/Customer\",\n" +
        "  \"description\": \"TestCustomerMapping does ...\",\n" +
        "  \"selectedSource\":\"query\",\n" +
        "  \"sourceQuery\": \"cts.CollectionQuery('RAW-CUSTOMER')\",\n" +
        "  \"collections\": []\n" +
        "}";

    static final String MAPPING_CONFIG_2 = "{\n" +
        "  \"name\": \"TestOrderMapping1\",\n" +
        "  \"targetEntityType\": \"http://marklogic.com/example/Order-0.0.1/Order\",\n" +
        "  \"description\": \"TestOrderMapping1 does ...\",\n" +
        "  \"selectedSource\": \"collection\",\n" +
        "  \"sourceQuery\": \"\",\n" +
        "  \"collections\": [\"RAW-ORDER\"]\n" +
        "}";

    static final String MAPPING_CONFIG_3 = "{\n" +
        "  \"name\" : \"TestOrderMapping2\",\n" +
        "  \"targetEntityType\" : \"http://marklogic.com/example/Order-0.0.1/Order\",\n" +
        "  \"description\" : \"TestOrderMapping2 does ...\",\n" +
        "  \"selectedSource\": \"query\",\n" +
        "  \"sourceQuery\": \"cts.CollectionQuery('RAW-ORDER')\",\n" +
        "  \"collections\": []\n" +
        "}";

    static final String MAPPING_SETTINGS = "{\n"
        + "    \"artifactName\" : \"TestCustomerMapping\",\n"
        + "    \"additionalCollections\" : [ \"Collection1\", \"Collection2\" ],\n"
        + "    \"targetDatabase\" : \"data-hub-STAGING\",\n"
        + "    \"permissions\" : \"data-hub-load-data-reader,read,data-hub-load-data-writer,update\",\n"
        + "     \"provenanceGranularity\": \"coarse-grained\",\n"
        + "    \"customHook\" : {\n"
        + "          \"module\" : \"\",\n"
        + "          \"parameters\" : \"\",\n"
        + "          \"user\" : \"\",\n"
        + "          \"runBefore\" : false\n"
        + "    }}";

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
    void testMappingConfigs() {
        installReferenceModelProject();

        controller.updateMapping(readJsonObject(MAPPING_CONFIG_1), "TestCustomerMapping");
        controller.updateMapping(readJsonObject(MAPPING_CONFIG_2), "TestOrderMapping1");
        controller.updateMapping(readJsonObject(MAPPING_CONFIG_3), "TestOrderMapping2");

        ArrayNode configsGroupbyEntity = controller.getMappings().getBody();

        assertEquals(2, configsGroupbyEntity.size(), "Should have two entries - one for Customer, one for Order.");

        configsGroupbyEntity.forEach(e -> {
            if ("Order".equals(e.get("entityType").asText())) {
                verifyOrderMappings(e);
            } else {
                verifyCustomerMappings(e);
            }
        });
    }

    private void verifyOrderMappings(JsonNode node) {
        assertEquals("Order", node.get("entityType").asText());
        assertEquals("http://marklogic.com/example/Order-0.0.1/Order", node.get("entityTypeId").asText());
        assertEquals(2, node.get("artifacts").size());
        node.get("artifacts").forEach(mapping -> {
            if ("TestOrderMapping1".equals(mapping.get("name").asText())) {
                assertEquals("http://marklogic.com/example/Order-0.0.1/Order", mapping.get("targetEntityType").asText());
            } else {
                assertEquals("TestOrderMapping2", mapping.get("name").asText());
                assertEquals("http://marklogic.com/example/Order-0.0.1/Order", mapping.get("targetEntityType").asText());
            }
        });
    }

    private void verifyCustomerMappings(JsonNode node) {
        assertEquals("Customer", node.get("entityType").asText());
        assertEquals("http://example.org/Customer-0.0.1/Customer", node.get("entityTypeId").asText());
        assertEquals(2, node.get("artifacts").size());
        node.get("artifacts").forEach(mapping -> {
            if ("SimpleCustomerMapping".equals(mapping.get("name").asText())) {
                assertEquals("http://example.org/Customer-0.0.1/Customer", mapping.get("targetEntityType").asText());
            } else {
                assertEquals("TestCustomerMapping", mapping.get("name").asText());
                assertEquals("http://example.org/Customer-0.0.1/Customer", mapping.get("targetEntityType").asText());
            }
        });
    }

    @Test
    public void testMappingSettings() {
        installReferenceModelProject();
        controller.updateMapping(readJsonObject(MAPPING_CONFIG_1), "TestCustomerMapping");

        JsonNode result = controller.getMappingSettings("TestCustomerMapping").getBody();
        // Check for defaults
        assertEquals("TestCustomerMapping", result.get("artifactName").asText());
        assertEquals(2, result.get("collections").size());
        assertEquals("TestCustomerMapping", result.get("collections").get(0).asText());
        assertEquals("Customer", result.get("collections").get(1).asText());

        ObjectNode settings = readJsonObject(MAPPING_SETTINGS);

        controller.updateMappingSettings(settings, "TestCustomerMapping");

        result = controller.getMappingSettings("TestCustomerMapping").getBody();
        assertEquals("TestCustomerMapping", result.get("artifactName").asText());
        assertEquals(2, result.get("additionalCollections").size());
        assertEquals("Collection2", result.get("additionalCollections").get(1).asText());
        assertEquals("data-hub-STAGING", result.get("targetDatabase").asText());
        assertTrue(result.has("permissions"), "missing permissions");
        assertTrue(result.has("customHook"), "missing customHook");

        controller.deleteMapping("TestCustomerMapping");

        assertThrows(FailedRequestException.class, () -> controller.getMapping("TestCustomerMapping"));
    }

    @Test
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
    void testGetMappingFunctions() {
        ObjectNode result = controller.getMappingFunctions().getBody();
        assertTrue(result.size() > 100, "Should have at least 100 functions");
        assertTrue(result.get("sum") != null, "Should have function 'sum'");
        assertEquals("sum(xs:anyAtomicType*)", result.get("sum").get("signature").asText(), "Signature should be sum(xs:anyAtomicType*)");
        assertTrue(result.get("doc") != null, "Should have function 'doc'");
        assertTrue(result.get("current-dateTime") != null, "Should have function 'current-dateTime'");
        assertTrue(result.get("fn:sum") == null, "'fn:' has been stripped from the function name and signature");
    }

    /**
     * Verifies that the structured properties of Customer - Address and Zip - are merged into the Customer to make
     * life easy for the mapping tool.
     */
    @Test
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
