package com.marklogic.hub.entity;

import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.dataservices.ModelsService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class GenerateSchemasTest extends AbstractHubCoreTest {

    /**
     * Per DHFPROD-5811, entity-model-trigger.xqy fails when es:schema-generate returns multiple schemas, which it will
     * do when multiple namespaces exist in a model.
     */
    @Test
    void modelWithMultipleNamespaces() {
        String modelWithMultipleNamespaces = "{\n" +
            "  \"info\" : {\n" +
            "    \"title\" : \"FirstNamespacedEntity\",\n" +
            "    \"version\" : \"0.0.1\",\n" +
            "    \"baseUri\" : \"http://example.org/\"\n" +
            "  },\n" +
            "  \"definitions\" : {\n" +
            "    \"FirstNamespacedEntity\" : {\n" +
            "      \"namespace\" : \"http://example.org/FirstNamespacedEntity/\",\n" +
            "      \"namespacePrefix\" : \"ns1\",\n" +
            "      \"properties\" : {\n" +
            "        \"firstPropertyName\" : {\n" +
            "          \"datatype\" : \"string\",\n" +
            "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
            "        }\n" +
            "      }\n" +
            "    },\n" +
            "    \"SecondNamespacedEntity\" : {\n" +
            "      \"namespace\" : \"http://example.org/SecondNamespacedEntity/\",\n" +
            "      \"namespacePrefix\" : \"ns2\",\n" +
            "      \"properties\" : {\n" +
            "        \"secondPropertyName\" : {\n" +
            "          \"datatype\" : \"string\",\n" +
            "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
            "        }\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";

        ModelsService modelsService = ModelsService.on(getHubClient().getStagingClient());
        modelsService.saveDraftModel(readJsonObject(modelWithMultipleNamespaces));
        modelsService.publishDraftModels();
        waitForTasksToFinish();

        GenericDocumentManager mgr = getHubConfig().getAppConfig().newAppServicesDatabaseClient(
            getHubConfig().getDbName(DatabaseKind.STAGING_SCHEMAS)).newDocumentManager();
        assertNotNull(mgr.exists("/entities/FirstNamespacedEntity.entity.xsd"));
        assertNotNull(mgr.exists("/entities/SecondNamespacedEntity.entity.xsd"));
    }
}
