package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DeployDatabaseFieldCommandTest extends AbstractHubCoreTest {

    @Test
    public void test() {
        givenTheFinalDatabaseHasACustomFieldAndIndexes();
        whenTheDatabaseFieldCommandIsExecuted();
        thenTheCustomFieldAndIndexesAndNamespacesStillExist();
    }

    private void givenTheFinalDatabaseHasACustomFieldAndIndexes() {
        ObjectNode db = getDatabaseProperties("data-hub-FINAL");

        ObjectNode newNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        newNode.put("database-name", "data-hub-FINAL");
        newNode.set("field", db.get("field"));

        ObjectNode newField = ((ArrayNode) newNode.get("field")).addObject();
        newField.put("field-name", "myField");
        ObjectNode fieldPath = newField.putObject("field-path");
        fieldPath.put("path", "/myPath");
        fieldPath.put("weight", 1);

        ObjectNode newFieldWithNamespace = ((ArrayNode) newNode.get("field")).addObject();
        newFieldWithNamespace.put("field-name", "fieldWithNamespace");
        ObjectNode fieldPathWithNamespace = newFieldWithNamespace.putObject("field-path");
        fieldPathWithNamespace.put("path", "/oex:myPath");
        fieldPathWithNamespace.put("weight", 1);

        ArrayNode indexes;
        if (db.has("range-field-index")) {
            indexes = (ArrayNode) db.get("range-field-index");
            newNode.set("range-field-index", indexes);
        } else {
            indexes = newNode.putArray("range-field-index");
        }
        ObjectNode index = indexes.addObject();
        index.put("scalar-type", "string");
        index.put("field-name", "myField");
        index.put("invalid-values", "reject");
        index.put("range-value-positions", false);
        index.put("collation", "http://marklogic.com/collation/");

        ObjectNode indexWithNamespace = indexes.addObject();
        indexWithNamespace.put("scalar-type", "string");
        indexWithNamespace.put("field-name", "fieldWithNamespace");
        indexWithNamespace.put("invalid-values", "reject");
        indexWithNamespace.put("range-value-positions", false);
        indexWithNamespace.put("collation", "http://marklogic.com/collation/");


        ArrayNode pathIndexes;
        if (db.has("range-path-index")) {
            pathIndexes = (ArrayNode) db.get("range-path-index");
            newNode.set("range-path-index", pathIndexes);
        } else {
            pathIndexes = newNode.putArray("range-path-index");
        }
        ObjectNode pathIndex = pathIndexes.addObject();
        pathIndex.put("scalar-type", "string");
        pathIndex.put("path-expression", "/myPath");
        pathIndex.put("invalid-values", "reject");
        pathIndex.put("range-value-positions", false);
        pathIndex.put("collation", "http://marklogic.com/collation/");

        ArrayNode namespaces = (ArrayNode) db.get("path-namespace");
        newNode.set("path-namespace", namespaces);

        ObjectNode namespace = namespaces.addObject();
        namespace.put("prefix", "oex");
        namespace.put("namespace-uri", "http://example.org/");

        new DatabaseManager(getHubClient().getManageClient()).save(newNode.toString());
    }

    private void whenTheDatabaseFieldCommandIsExecuted() {
        new DeployDatabaseFieldCommand().execute(newCommandContext());
    }

    private void thenTheCustomFieldAndIndexesAndNamespacesStillExist() {
        ObjectNode db = getDatabaseProperties(getHubClient().getDbName(DatabaseKind.FINAL));

        ArrayNode fields = (ArrayNode) db.get("field");
        List<String> fieldNames = new ArrayList<>();
        fields.forEach(field -> fieldNames.add(field.get("field-name").asText()));
        assertTrue(fieldNames.containsAll(Arrays.asList("myField", "fieldWithNamespace", "datahubSourceName", "datahubSourceType")),
                "Expected to find the myField, fieldWithNamespace fields that was added before executing the command along with atahubSourceName, datahubSourceType OOTB fields");

        ArrayNode indexes = (ArrayNode) db.get("range-field-index");
        List<String> fieldIndexNames = new ArrayList<>();
        indexes.forEach(rangeFieldIndex -> fieldIndexNames.add(rangeFieldIndex.get("field-name").asText()));
        assertTrue(fieldIndexNames.containsAll(Arrays.asList("myField", "fieldWithNamespace", "datahubSourceName", "datahubSourceType")),
                "Expected to find the myField, fieldWithNamespace range field index that was added before executing the command along with datahubSourceName and datahubSourceType OOTB indexes");

        ArrayNode pathIndexes = (ArrayNode) db.get("range-path-index");
        JsonNode myPathIndex = null;
        for (int i = 0; i < pathIndexes.size(); i++) {
            JsonNode pathIndex = pathIndexes.get(i);
            if ("/myPath".equals(pathIndex.get("path-expression").asText())) {
                myPathIndex = pathIndex;
                break;
            }
        }
        assertNotNull(myPathIndex, "Expected to find the /myPath range index that was added before executing the command");

        ArrayNode namespaces = (ArrayNode) db.get("path-namespace");
        assertEquals(2, namespaces.size());

        List<String> prefixes = new ArrayList<>();
        namespaces.forEach(namespaceObject -> prefixes.add(namespaceObject.get("prefix").asText()));
        assertTrue(prefixes.containsAll(Arrays.asList("es", "oex")));
    }

    /**
     * This ensures no residue is left behind on the final database.
     */
    @AfterEach
    public void removeCustomFieldAndIndex() {
        ObjectNode db = getDatabaseProperties(getHubClient().getDbName(DatabaseKind.FINAL));

        ArrayNode array = (ArrayNode) db.get("field");
        List fieldsToBeRemoved = new ArrayList(List.of("myField", "fieldWithNamespace"));
        for (int i = 0; i < array.size(); i++) {
            JsonNode field = array.get(i);
            if ("myField".equals(field.get("field-name").asText()) || "fieldWithNamespace".equals(field.get("field-name").asText())) {
                array.remove(i);
                fieldsToBeRemoved.remove(field.get("field-name").asText());
                if(fieldsToBeRemoved.size() == 0) break;
            }
        }

        array = (ArrayNode) db.get("range-field-index");
        fieldsToBeRemoved = new ArrayList(List.of("myField", "fieldWithNamespace"));
        for (int i = 0; i < array.size(); i++) {
            JsonNode field = array.get(i);
            if ("myField".equals(field.get("field-name").asText()) || "fieldWithNamespace".equals(field.get("field-name").asText())) {
                array.remove(i);
                fieldsToBeRemoved.remove(field.get("field-name").asText());
                if(fieldsToBeRemoved.size() == 0) break;
            }
        }

        array = (ArrayNode) db.get("range-path-index");
        for (int i = 0; i < array.size(); i++) {
            JsonNode pathIndex = array.get(i);
            if ("/myPath".equals(pathIndex.get("path-expression").asText())) {
                array.remove(i);
                break;
            }
        }

        ObjectNode newNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        newNode.set("database-name", db.get("database-name"));
        newNode.set("field", db.get("field"));
        newNode.set("range-field-index", db.get("range-field-index"));
        newNode.set("range-path-index", db.get("range-path-index"));

        new DatabaseManager(getHubClient().getManageClient()).save(newNode.toString());

        // Namespaces can be removed after the indexes using the namespace are deleted
        array = (ArrayNode) db.get("path-namespace");
        for (int i = 0; i < array.size(); i++) {
            JsonNode namespace = array.get(i);
            if ("oex".equals(namespace.get("prefix").asText())) {
                array.remove(i);
                break;
            }
        }
        new DatabaseManager(getHubClient().getManageClient()).save(newNode.toString());
    }
}
