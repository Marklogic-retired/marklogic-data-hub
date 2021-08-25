package com.marklogic.hub.dataservices.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
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

        service.saveDraftModel(ObjectMapperFactory.getObjectMapper().readTree(json));

        JsonNode type = service.getPrimaryEntityTypes().get(0);
        JsonNode model = type.get("model");
        assertEquals("zxx", model.get("lang").asText(), " Per DHFPROD-3193 and an update to MarkLogic 10.0-2, 'lang' " +
            "must now be used instead of 'language'.");
        assertFalse(model.has("language"));
    }

    @Test
    void stagingAndFinalDatabasesAreTheSame() {
        GenericDocumentManager mgr = getHubClient().getModulesClient().newDocumentManager();
        final String originalConfig = mgr.readAs("/com.marklogic.hub/config.sjs", String.class);
        final String configUri = "/com.marklogic.hub/config.sjs";
        final String simpleModel = "{\n" +
            "  \"info\" : {\n" +
            "    \"title\" : \"SimpleEntity\"\n" +
            "  },\n" +
            "  \"definitions\" : {\n" +
            "    \"SimpleEntity\" : {\n" +
            "      \"properties\" : {\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";

        try {
            mgr.writeAs(configUri, originalConfig.replaceAll(
                getHubClient().getDbName(DatabaseKind.STAGING), getHubClient().getDbName(DatabaseKind.FINAL)));

            service.saveDraftModel(readJsonObject(simpleModel));

            ArrayNode types = (ArrayNode) service.getPrimaryEntityTypes();
            assertEquals(1, types.size(), "Verifying that the model was saved, even though both staging and final are " +
                "the same database; this ensures a conflicting-updates error doesn't occur from trying to write to the " +
                "same database twice");
        } finally {
            mgr.writeAs(configUri, originalConfig);
        }
    }
}
