package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubTestBase;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.*;

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
    private final static String CUSTOMER_DOC = "{\n" +
        "\t\"envelope\": {\n" +
        "\t\t\"instance\": {\n" +
        "\t\t\t\"id\": \"10260\",\n" +
        "\t\t\t\"Order\": \"123\"\n" +
        "\t\t},\n" +
        "\t\t\"attachments\": null\n" +
        "\t}\n" +
        "}";
    private final static String CUSTOMER_URI = "/entities/CustomerType.entity.json";

    private DatabaseClient client;
    private MappingValidator mgr;

    @BeforeEach
    public void setup() {
        client = adminHubConfig.newStagingClient(adminHubConfig.getDbName(DatabaseKind.FINAL));
        client.newJSONDocumentManager().write(
            CUSTOMER_URI,
            new DocumentMetadataHandle().withCollections("http://marklogic.com/entity-services/models"),
            new StringHandle(CUSTOMER_MODEL).withFormat(Format.JSON)
        );
        client.newJSONDocumentManager().write(
            "/validate/test.json",
            new StringHandle(CUSTOMER_DOC).withFormat(Format.JSON)
        );

        mgr = new MappingValidator(client);
    }

    @AfterEach
    public void teardown() {
        client.newJSONDocumentManager().delete(CUSTOMER_URI);
        client.newJSONDocumentManager().delete("/validate/test.json");
        client.release();
    }

    @Test
    public void validMapping() {
        if(versions.isVersionCompatibleWithES()){
            JsonNode response = mgr.validateJsonMapping("{\n" +
                "  \"targetEntityType\": \"http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType\",\n" +
                "  \"properties\": {\n" +
                "    \"id\": {\n" +
                "      \"sourcedFrom\": \"id\"\n" +
                "    }\n" +
                "  }\n" +
                "}", "/validate/test.json");

            assertNull(response.get("properties").get("id").get("errorMessage"),
                "The mapping is valid, and thus there shouldn't be an errorMessage property");
            System.out.println(response);
            assertTrue(response.get("properties").get("id").get("output").textValue().equals("10260"));
        }
    }

    @Test
    public void invalidMapping() {
        if(versions.isVersionCompatibleWithES()) {
            JsonNode response = mgr.validateJsonMapping("{\n" +
                "  \"targetEntityType\": \"http://marklogic.com/data-hub/example/CustomerType-0.0.1/CustomerType\",\n" +
                "  \"properties\": {\n" +
                "    \"id\": {\n" +
                "      \"sourcedFrom\": \"concat(id, ')\"\n" +
                "    }\n" +
                "  }\n" +
                "}", "/validate/test.json");

            assertEquals("Invalid XPath expression: concat(id, ')", response.get("properties").get("id").get("errorMessage").asText(),
                "The id mapping expression has an error, and thus it should be reported");
        }
    }
}
