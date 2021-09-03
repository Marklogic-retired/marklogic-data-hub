package com.marklogic.hub.central.controllers.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.FailedRequestException;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.central.AbstractHubCentralTest;
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
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.test.context.support.WithMockUser;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

public class ModelTest extends AbstractHubCentralTest {
    protected final static String MODEL_NAME = "Customer";
    protected final static String ENTITY_PROPERTY_1 = "someProperty";
    protected final static String ENTITY_PROPERTY_2 = "someOtherProperty";
    protected final static String DATABASE_PROPERTY_1 = "testRangeIndexForDHFPROD4704";
    protected final static String DATABASE_PROPERTY_2 = "testPathIndexForDHFPROD4704";

    @Autowired
    ModelController controller;

    @AfterEach
    void cleanUp() {
        deleteProtectedPaths();
        if (isVersionCompatibleWith520Roles()) {
            applyDatabasePropertiesForTests(getHubConfig());
        }
    }

    protected void createNamespacedModel() {
        ArrayNode existingEntityTypes = (ArrayNode) controller.getPrimaryEntityTypes().getBody();
        assertEquals(0, existingEntityTypes.size(), "Any existing models should have been deleted when this test started");

        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", MODEL_NAME);
        input.put("namespace", "http://example.org/");
        input.set("hubCentral", createGraphConfig());

        FailedRequestException ex = assertThrows(FailedRequestException.class, () -> controller.createDraftModel(input));
        assertTrue(ex.getMessage().contains("Since you entered a namespace, you must specify a prefix"));

        input.remove("namespace");
        input.put("namespacePrefix", "ex");

        ex = assertThrows(FailedRequestException.class, () -> controller.createDraftModel(input));
        assertTrue(ex.getMessage().contains("You cannot enter a prefix without specifying a namespace URI"));

        input.put("namespace", "http://example.org/");
        input.put("namespacePrefix", "xsi");

        ex = assertThrows(FailedRequestException.class, () -> controller.createDraftModel(input));
        assertTrue(ex.getMessage().contains("Namespace prefix xsi is not valid.  It is a reserved pattern"));

        input.put("namespacePrefix", "ex");
        JsonNode model = controller.createDraftModel(input).getBody();

        verifyGraphConfig(model);
        assertEquals(MODEL_NAME, model.get("info").get("title").asText());
        assertEquals("ex", model.get("definitions").get(MODEL_NAME).get("namespacePrefix").asText());
        assertEquals("http://example.org/", model.get("definitions").get(MODEL_NAME).get("namespace").asText());
    }

    protected void createModel() {
        ArrayNode existingEntityTypes = (ArrayNode) controller.getPrimaryEntityTypes().getBody();
        assertEquals(0, existingEntityTypes.size(), "Any existing models should have been deleted when this test started");

        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", MODEL_NAME);
        JsonNode model = controller.createDraftModel(input).getBody();
        assertEquals(MODEL_NAME, model.get("info").get("title").asText());
        assertTrue(model.get("info").get("draft").asBoolean());

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

    protected ObjectNode createGraphConfig(){
        ObjectNode hubCentral = objectMapper.createObjectNode();
        ObjectNode modeling = objectMapper.createObjectNode();

        modeling.put("graphY", 13.5);
        modeling.put("graphX", 23.4);
        modeling.put("color", "#e3ebbc");
        modeling.put("icon", "faTrashAlt");

        hubCentral.set("modeling", modeling);
        return hubCentral;
    }

    protected void verifyGraphConfig(JsonNode model){
        assertEquals(13.5, model.get("hubCentral").get("modeling").get("graphY").asDouble());
        assertEquals(23.4, model.get("hubCentral").get("modeling").get("graphX").asDouble());
        assertEquals("#e3ebbc", model.get("hubCentral").get("modeling").get("color").asText());
        assertEquals("faTrashAlt", model.get("hubCentral").get("modeling").get("icon").asText());
    }

    protected void updateModelWithGraphConfig(){
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());
        String entityTypes = "[\n" +
                "{\n" +
                "\"entityName\": \"Customer\", \n" +
                "\"hubCentral\": {\n" +
                "\"modeling\": {\n" +
                "\"graphX\": 25.1, \n" +
                "\"graphY\": 20.1\n" +
                "}\n" +
                "}, \n" +
                "\"modelDefinition\": {\n" +
                "\"Customer\": {\n" +
                "\"properties\": {\n" +
                "\"someProperty\": {\n" +
                "\"datatype\": \"integer\"\n" +
                "}\n" +
                "}\n" +
                "}\n" +
                "}\n" +
                "}\n" +
                "]";

        controller.updateDraftModelEntityTypes(readJsonArray(entityTypes));

        JsonNode model = getModel(getHubClient().getFinalClient(), true);
        assertEquals(20.1, model.get("hubCentral").get("modeling").get("graphY").asDouble());
        assertEquals(25.1, model.get("hubCentral").get("modeling").get("graphX").asDouble());
    }

    protected void updateModelInfo() {
        ObjectNode input = objectMapper.createObjectNode();
        input.put("name", MODEL_NAME);

        input.put("description", "description");
        input.put("namespace" , "http://example.org/");
        FailedRequestException ex = assertThrows(FailedRequestException.class, () -> controller.updateDraftModelInfo(MODEL_NAME, input));
        assertTrue(ex.getMessage().contains("Since you entered a namespace, you must specify a prefix"));

        input.remove("namespace");
        input.put("namespacePrefix", "ex");
        ex = assertThrows(FailedRequestException.class, () -> controller.updateDraftModelInfo(MODEL_NAME, input));
        assertTrue(ex.getMessage().contains("You cannot enter a prefix without specifying a namespace URI"));


        input.put("namespace" , "http://example.org/");
        input.put("namespacePrefix", "xml");
        ex = assertThrows(FailedRequestException.class, () -> controller.updateDraftModelInfo(MODEL_NAME, input));
        assertTrue(ex.getMessage().contains("Namespace prefix xml is not valid.  It is a reserved pattern"));

        input.put("namespace" , "http://example.org/");
        input.put("namespacePrefix", "ex");
        input.put("description", "Updated description");

        input.set("hubCentral", createGraphConfig());

        controller.updateDraftModelInfo(MODEL_NAME, input);
        JsonNode model = getModel(getHubClient().getFinalClient(), true);
        assertEquals("http://example.org/", model.get("definitions").get(MODEL_NAME).get("namespace").asText());
        assertEquals("ex", model.get("definitions").get(MODEL_NAME).get("namespacePrefix").asText());
        assertEquals("Updated description", model.get("definitions").get(MODEL_NAME).get("description").asText());
        assertTrue(model.get("info").get("draft").asBoolean());

        verifyGraphConfig(model);

        //Remove namespace and namespacePrefix from entity model
        input.put("description", "Description updated again");
        input.remove("namespace");
        input.remove("namespacePrefix");
        controller.updateDraftModelInfo(MODEL_NAME, input);

        model = getModel(getHubClient().getFinalClient(), true);
        assertEquals("Description updated again", model.get("definitions").get(MODEL_NAME).get("description").asText());
        assertNull(model.get("definitions").get(MODEL_NAME).get("namespace"));
        assertNull(model.get("definitions").get(MODEL_NAME).get("namespacePrefix"));

        verifyGraphConfig(model);
    }

    public void deleteModel() {
        controller.deleteDraftModel(MODEL_NAME);
        JsonNode model = getModel(getHubClient().getFinalClient(), true);
        assertTrue(model.get("info").get("draft").asBoolean());
    }

    protected void updateModelEntityTypes() {
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

        controller.updateDraftModelEntityTypes(readJsonArray(entityTypes));
        // Need to publish the draft models in order to see PII and index related changes
        controller.publishDraftModels();
        assertPIIFilesDeployment();
        assertIndexDeployment();

        assertEquals("string", getModel(getHubClient().getFinalClient(), false).get("definitions").get(MODEL_NAME).get("properties").get(ENTITY_PROPERTY_1).get("datatype").asText());
    }

    protected void updateDataType(String datatype) {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());

        String entityTypes = "[\n" +
                "  {\n" +
                "    \"entityName\": \"" + MODEL_NAME + "\",\n" +
                "    \"modelDefinition\": {\n" +
                "      \"Customer\": {\n" +
                "        \"elementRangeIndex\": [\n" +
                "          \"" + ENTITY_PROPERTY_1 + "\"\n" +
                "        ],\n" +
                "        \"properties\": {\n" +
                "          \"" + ENTITY_PROPERTY_1 + "\": {\n" +
                "            \"datatype\": \"" + datatype + "\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "]";

        controller.updateDraftModelEntityTypes(readJsonArray(entityTypes));
        // We need to publish the draft model for the indexes to be created
        controller.publishDraftModels();
    }

    protected void addProperty() {
        Assumptions.assumeTrue(isVersionCompatibleWith520Roles());

        String entityTypes = "[\n" +
                "  {\n" +
                "    \"entityName\": \"" + MODEL_NAME + "\",\n" +
                "    \"modelDefinition\": {\n" +
                "      \"Customer\": {\n" +
                "        \"elementRangeIndex\": [\n" +
                "          \"" + ENTITY_PROPERTY_1 + "\"\n" +
                "        ],\n" +
                "        \"properties\": {\n" +
                "          \"" + ENTITY_PROPERTY_1 + "\": {\n" +
                "            \"datatype\": \"date\"\n" +
                "          },\n" +
                "          \"" + ENTITY_PROPERTY_2 + "\": {\n" +
                "            \"datatype\": \"string\",\n" +
                "            \"collation\": \"http://marklogic.com/collation/codepoint\"\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    }\n" +
                "  }\n" +
                "]";

        controller.updateDraftModelEntityTypes(readJsonArray(entityTypes));
    }

    protected JsonNode getModel(DatabaseClient client, boolean isDraft) {
        return client.newJSONDocumentManager().read("/entities/" + MODEL_NAME + (isDraft ? ".draft":"")  + ".entity.json", new JacksonHandle()).get();
    }

    protected void assertPIIFilesDeployment() {
        runAsAdmin();
        ManageClient manageClient = getHubClient().getManageClient();

        String protectedPaths = manageClient.getJson("/manage/v2/protected-paths");
        assertTrue(protectedPaths.contains(ENTITY_PROPERTY_1), "Expected " + ENTITY_PROPERTY_1 + " to be in protected paths: " + protectedPaths);

        JsonNode queryRolesets = readJsonObject(manageClient.getJson("/manage/v2/query-rolesets"));
        assertTrue(queryRolesets.get("query-roleset-default-list").get("list-items").get("list-count").get("value").asInt() >= 1, "Expected at least 1 query roleset (pii-reader) since we are deploying PII files.");

        runAsTestUserWithRoles("hub-central-entity-model-writer");
    }

    protected void assertIndexDeployment() {
        Stream.of(getHubConfig().getDbName(DatabaseKind.STAGING), getHubConfig().getDbName(DatabaseKind.FINAL)).forEach(databaseKind -> {
            verifyIndexes(databaseKind);
        });
    }

    protected void assertDateTimeIndexExists() {
        String json = new DatabaseManager(getHubClient().getManageClient()).getPropertiesAsJson(getHubConfig().getDbName(DatabaseKind.FINAL));
        Database db = new DefaultResourceMapper(new API(getHubClient().getManageClient())).readResource(json, Database.class);
        assertEquals(true, rangeIndexExists(db, "someProperty", "dateTime"));
        assertEquals(true, rangeIndexExists(db, "someProperty", "date"));
    }

    protected void assertDateTimeIndexDoesntExist() {
        String json = new DatabaseManager(getHubClient().getManageClient()).getPropertiesAsJson(getHubConfig().getDbName(DatabaseKind.FINAL));
        Database db = new DefaultResourceMapper(new API(getHubClient().getManageClient())).readResource(json, Database.class);
        assertEquals(false, rangeIndexExists(db, "someProperty", "dateTime"));
    }

    protected boolean rangeIndexExists(Database db, String name, String type){
        List<ElementIndex> rangeIndexes = db.getRangeElementIndex();
        if (rangeIndexes != null) {
            for (int i = 0; i < rangeIndexes.size(); i++) {
                if (rangeIndexes.get(i).getLocalname().equals(name) && rangeIndexes.get(i).getScalarType().equals(type)) {
                    return true;
                }
            }
        }
        return false;
    }

    protected void verifyIndexes(String dbName) {
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

    protected void removeRangeElementIndexesFromFinalDatabase() {
        ManageClient manageClient = getHubClient().getManageClient();
        final String finalName = getHubConfig().getDbName(DatabaseKind.FINAL);

        Database db = new Database(new API(manageClient), finalName);

        db.setRangePathIndex(new ArrayList<>());
        db.setRangeElementIndex(new ArrayList<>());
        db.save();
    }

    protected void loadUnrelatedIndexes() {
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

    protected void deployDataHubDefaultFields() {
        runAsDataHubDeveloper();
        new DeployDatabaseFieldCommand().execute(newCommandContext());
        runAsTestUserWithRoles("hub-central-entity-model-writer");
    }
}
