package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class ValidateMappingTest extends HubTestBase {

    private final static String CUSTOMER_MODEL = "{\n" +
        "  \"info\" : {\n" +
        "    \"title\" : \"CustomerType\",\n" +
        "    \"version\" : \"0.0.1\",\n" +
        "    \"description\" : \"A customer\",\n" +
        "    \"baseUri\": \"http://marklogic.com/data-hub/example/\"\n" +
        "  },\n" +
        "  \"definitions\" : {\n" +
        "    \"CustomerType\" : {\n" +
        "      \"primaryKey\": \"id\",\n" +
        "      \"required\" : [ ],\n" +
        "      \"properties\" : {\n" +
        "        \"id\" : {\n" +
        "          \"datatype\" : \"string\",\n" +
        "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
        "        }\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "}\n";

    private final static String CUSTOMER_URI = "/entities/CustomerType.entity.json";

    private DatabaseClient client;
    private MappingValidator mgr;

    @BeforeEach
    public void setup() {
        client = adminHubConfig.newStagingClient();
        client.newJSONDocumentManager().write(
            CUSTOMER_URI,
            new DocumentMetadataHandle().withCollections("http://marklogic.com/entity-services/models"),
            new StringHandle(CUSTOMER_MODEL).withFormat(Format.JSON)
        );

        mgr = new MappingValidator(client);
    }

    @AfterEach
    public void teardown() {
        client.newJSONDocumentManager().delete(CUSTOMER_URI);
        client.release();
    }

    @Test
    public void validMapping() {
        JsonNode response = mgr.validateJsonMapping("{\n" +
            "  \"targetEntityType\": \"http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType\",\n" +
            "  \"properties\": {\n" +
            "    \"id\": {\n" +
            "      \"sourcedFrom\": \"id\"\n" +
            "    }\n" +
            "  }\n" +
            "}");

        assertNull(response.get("properties").get("id").get("errorMessage"),
            "The mapping is valid, and thus there shouldn't be an errorMessage property");
    }

    @Test
    public void invalidMapping() {
        JsonNode response = mgr.validateJsonMapping("{\n" +
            "  \"targetEntityType\": \"http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType\",\n" +
            "  \"properties\": {\n" +
            "    \"id\": {\n" +
            "      \"sourcedFrom\": \"concat(id, ')\"\n" +
            "    }\n" +
            "  }\n" +
            "}");

        assertEquals("Invalid XPath expression: concat(id, ')", response.get("properties").get("id").get("errorMessage").asText(),
            "The id mapping expression has an error, and thus it should be reported");
    }
}
