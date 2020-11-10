package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.controllers.ModelController;
import com.marklogic.hub.deploy.commands.DeployDatabaseFieldCommand;
import com.marklogic.hub.test.Customer;
import com.marklogic.hub.test.ReferenceModelProject;
import com.marklogic.mgmt.ManageClient;
import com.marklogic.mgmt.api.API;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.api.database.ElementIndex;
import com.marklogic.mgmt.api.database.PathIndex;
import com.marklogic.mgmt.api.database.PathNamespace;
import com.marklogic.mgmt.mapper.DefaultResourceMapper;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CreateAndUpdateModelTest extends AbstractModelTest {

    private final static String MODEL_NAME = "Customer";
    private final static String ENTITY_PROPERTY_1 = "someProperty";
    private final static String ENTITY_PROPERTY_2 = "someOtherProperty";
    private final static String DATABASE_PROPERTY_1 = "testRangeIndexForDHFPROD4704";
    private final static String DATABASE_PROPERTY_2 = "testPathIndexForDHFPROD4704";

    @Autowired
    ModelController controller;

    @AfterEach
    void cleanUp() {
        deleteProtectedPaths();
        if (isVersionCompatibleWith520Roles()) {
            applyDatabasePropertiesForTests(getHubConfig());
        }
    }

    @Test
    @WithMockUser(roles = {"writeEntityModel"})
    void testModelsServicesEndpoints() {
        runAsTestUserWithRoles("hub-central-entity-model-writer");
        createModel();
        updateModelInfo();
        updateModelEntityTypes();
    }

    private void createModel() {
        ArrayNode existingEntityTypes = (ArrayNode) controller.getPrimaryEntityTypes().getBody();
        assertEquals(0, existingEntityTypes.size(), "Any existing models should have been deleted when this test started");

        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", MODEL_NAME);
        JsonNode model = controller.createModel(input).getBody();
        assertEquals(MODEL_NAME, model.get("info").get("title").asText());
        assertSearchOptions(MODEL_NAME, Assertions::assertTrue, true);

        // Create a customer in final so we have a way to verify the entity instance count
        new ReferenceModelProject(getHubClient()).createCustomerInstance(new Customer(1, "Jane"));
        ArrayNode entityTypes = (ArrayNode) controller.getPrimaryEntityTypes().getBody();
        assertEquals(1, entityTypes.size(), "A new model should have been created " +
                "and thus there should be one primary entity type");

        JsonNode customerType = entityTypes.get(0);
        assertEquals("Customer", customerType.get("entityName").asText());
        assertEquals(1, customerType.get("entityInstanceCount").asInt(),
                "Should have a count of one because there's one document in the 'Customer' collection");

    }

    private void updateModelInfo() {
        ModelController.UpdateModelInfoInput info = new ModelController.UpdateModelInfoInput();
        info.description = "Updated description";
        controller.updateModelInfo(MODEL_NAME, info);

        assertEquals("Updated description", loadModel(getHubClient().getFinalClient()).get("definitions").get(MODEL_NAME).get("description").asText());
    }

    private void updateModelEntityTypes() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());

        // Loading unrelated indexes so that we can check for them after updating entity model
        loadUnrelatedIndexes();

        String entityTypes = "[\n" +
                "  {\n" +
                "    \"entityName\": \"" + MODEL_NAME + "\",\n" +
                "    \"modelDefinition\": {\n" +
                "      \"Customer\": {\n" +
                "        \"required\": [],\n" +
                "        \"pii\": [\n" +
                "          \"" + ENTITY_PROPERTY_1 + "\"\n" +
                "        ],\n" +
                "        \"elementRangeIndex\": [\n" +
                "          \"" + ENTITY_PROPERTY_1 + "\"\n" +
                "        ],\n" +
                "        \"properties\": {\n" +
                "          \"" + ENTITY_PROPERTY_1 + "\": {\n" +
                "            \"datatype\": \"string\",\n" +
                "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n" +
                "          },\n" +
                "          \"" + ENTITY_PROPERTY_2 + "\": {\n" +
                "            \"datatype\": \"string\",\n" +
                "            \"facetable\": true,\n" +
                "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "]";

        controller.updateModelEntityTypes(readJsonArray(entityTypes));

        assertSearchOptions(MODEL_NAME, Assertions::assertTrue, true);
        assertPIIFilesDeployment();
        assertIndexDeployment();

        assertEquals("string", loadModel(getHubClient().getFinalClient()).get("definitions").get(MODEL_NAME).get("properties").get(ENTITY_PROPERTY_1).get("datatype").asText());
    }

    private JsonNode loadModel(DatabaseClient client) {
        return client.newJSONDocumentManager().read("/entities/" + MODEL_NAME + ".entity.json", new JacksonHandle()).get();
    }

    private void assertPIIFilesDeployment() {
        runAsAdmin();
        ManageClient manageClient = getHubClient().getManageClient();

        String protectedPaths = manageClient.getJson("/manage/v2/protected-paths");
        assertTrue(protectedPaths.contains(ENTITY_PROPERTY_1), "Expected " + ENTITY_PROPERTY_1 + " to be in protected paths: " + protectedPaths);

        JsonNode queryRolesets = readJsonObject(manageClient.getJson("/manage/v2/query-rolesets"));
        assertTrue(queryRolesets.get("query-roleset-default-list").get("list-items").get("list-count").get("value").asInt() >= 1, "Expected at least 1 query roleset (pii-reader) since we are deploying PII files.");

        runAsTestUserWithRoles("hub-central-entity-model-writer");
    }

    private void assertIndexDeployment() {
        Stream.of(getHubConfig().getDbName(DatabaseKind.STAGING), getHubConfig().getDbName(DatabaseKind.FINAL)).forEach(databaseKind -> {
            verifyIndexes(databaseKind);
        });
    }

    private void verifyIndexes(String dbName) {
        String json = new DatabaseManager(getHubClient().getManageClient()).getPropertiesAsJson(dbName);
        Database db = new DefaultResourceMapper(new API(getHubClient().getManageClient())).readResource(json, Database.class);

        List<PathNamespace> pathNamespaces = db.getPathNamespace();
        assertEquals(2, pathNamespaces.size());
        assertEquals("ex", pathNamespaces.get(0).getPrefix(), "The existing namespace is expected to be first, as the model-based " +
                "properties are expected to be merged on top of the existing properties");
        assertEquals("http://example.org", pathNamespaces.get(0).getNamespaceUri());
        assertEquals("es", pathNamespaces.get(1).getPrefix());
        assertEquals("http://marklogic.com/entity-services", pathNamespaces.get(1).getNamespaceUri());

        List<ElementIndex> rangeIndexes = db.getRangeElementIndex();
        assertEquals(2, rangeIndexes.size());
        assertEquals("testRangeIndexForDHFPROD4704", rangeIndexes.get(0).getLocalname());
        assertEquals("someProperty", rangeIndexes.get(1).getLocalname());

        List<PathIndex> pathIndexes = db.getRangePathIndex();
        List<String> pathExpressions = new ArrayList<>();
        assertEquals(4, pathIndexes.size(), "OOTB indexes URIsToProcess and uris path indexes exists along with above deployed indexes in the test");
        pathIndexes.forEach(pathIndex -> pathExpressions.add(pathIndex.getPathExpression()));
        assertTrue(pathExpressions.containsAll(Arrays.asList("//*:instance/testPathIndexForDHFPROD4704", "/(es:envelope|envelope)/(es:instance|instance)/Customer/someOtherProperty")));
    }

    private void loadUnrelatedIndexes() {
        String indexConfig = "{\n" +
                "   \"lang\":\"zxx\",\n" +
                "   \"path-namespace\":[\n" +
                "      {\n" +
                "         \"prefix\":\"ex\",\n" +
                "         \"namespace-uri\":\"http://example.org\"\n" +
                "      }\n" +
                "   ],\n" +
                "   \"range-element-index\":[\n" +
                "      {\n" +
                "         \"invalid-values\":\"reject\",\n" +
                "         \"localname\":\"" + DATABASE_PROPERTY_1 + "\",\n" +
                "         \"namespace-uri\":null,\n" +
                "         \"range-value-positions\":false,\n" +
                "         \"scalar-type\":\"decimal\"\n" +
                "      }\n" +
                "   ],\n" +
                "   \"range-path-index\":[\n" +
                "      {\n" +
                "         \"scalar-type\":\"string\",\n" +
                "         \"path-expression\":\"//*:instance/" + DATABASE_PROPERTY_2 + "\",\n" +
                "         \"collation\":\"http://marklogic.com/collation/\",\n" +
                "         \"range-value-positions\":false,\n" +
                "         \"invalid-values\":\"reject\"\n" +
                "      }\n" +
                "   ]\n" +
                "}";

        ManageClient manageClient = getHubClient().getManageClient();
        final String stagingName = getHubConfig().getDbName(DatabaseKind.STAGING);
        final String finalName = getHubConfig().getDbName(DatabaseKind.FINAL);

        // Clear out the range path indexes on both databases first to avoid issues with removing the "es" path prefix
        Database db = new Database(new API(manageClient), stagingName);
        db.setRangePathIndex(new ArrayList<>());
        db.setRangeElementIndex(new ArrayList<>());
        db.setRangeFieldIndex(new ArrayList<>());
        db.setField(new ArrayList<>());
        db.save();
        db.setDatabaseName(finalName);
        db.save();

        Stream.of(stagingName, finalName).forEach(databaseKind ->
            manageClient.putJson("/manage/v2/databases/" + databaseKind + "/properties", indexConfig)
        );
        // Deploying removed OOTB field indexes so that generate search options will not fail
        deployDataHubDefaultFields();
    }

    private void deployDataHubDefaultFields() {
        runAsDataHubDeveloper();
        new DeployDatabaseFieldCommand().execute(newCommandContext());
        runAsTestUserWithRoles("hub-central-entity-model-writer");
    }
}
