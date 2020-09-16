package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class SaveModelTest extends AbstractHubCoreTest {

    private ModelsService service;

    @BeforeEach
    void beforeEach() {
        service = ModelsService.on(getHubClient().getFinalClient());
    }

    @Test
    void modelHasLanguageInIt() throws Exception {
        final String json = "{\n" +
            "  \"info\" : {\n" +
            "    \"title\" : \"LanguageTest\"\n" +
            "  },\n" +
            " \"language\": \"zxx\",\n" +
            "  \"definitions\" : {\n" +
            "    \"LanguageTest\" : {\n" +
            "      \"properties\" : {\n" +
            "        \"street\" : {\n" +
            "          \"datatype\" : \"string\",\n" +
            "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
            "        }\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";

        service.saveModel(ObjectMapperFactory.getObjectMapper().readTree(json));

        JsonNode type = service.getPrimaryEntityTypes().get(0);
        JsonNode model = type.get("model");
        assertEquals("zxx", model.get("lang").asText(), " Per DHFPROD-3193 and an update to MarkLogic 10.0-2, 'lang' " +
            "must now be used instead of 'language'.");
        assertFalse(model.has("language"));
    }
}
