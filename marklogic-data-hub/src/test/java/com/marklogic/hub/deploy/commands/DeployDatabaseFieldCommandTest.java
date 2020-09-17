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

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertNotNull;

public class DeployDatabaseFieldCommandTest extends AbstractHubCoreTest {

    @Test
    public void test() {
        givenTheFinalDatabaseHasACustomFieldAndIndexes();
        whenTheDatabaseFieldCommandIsExecuted();
        thenTheCustomFieldAndIndexesStillExist();
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

        new DatabaseManager(getHubClient().getManageClient()).save(newNode.toString());
    }

    private void whenTheDatabaseFieldCommandIsExecuted() {
        new DeployDatabaseFieldCommand().execute(newCommandContext());
    }

    private void thenTheCustomFieldAndIndexesStillExist() {
        ObjectNode db = getDatabaseProperties(getHubClient().getDbName(DatabaseKind.FINAL));

        ArrayNode fields = (ArrayNode) db.get("field");
        // There could be other fields, so loop through the list to verify the custom one is there
        JsonNode myField = null;
        for (int i = 0; i < fields.size(); i++) {
            JsonNode field = fields.get(i);
            if ("myField".equals(field.get("field-name").asText())) {
                myField = field;
                break;
            }
        }
        assertNotNull(myField, "Expected to find the myField custom field that was added before executing the command");

        ArrayNode indexes = (ArrayNode) db.get("range-field-index");
        JsonNode myIndex = null;
        for (int i = 0; i < indexes.size(); i++) {
            JsonNode field = indexes.get(i);
            if ("myField".equals(field.get("field-name").asText())) {
                myIndex = field;
                break;
            }
        }
        assertNotNull(myIndex, "Expected to find the myField range index that was added before executing the command");

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
    }

    /**
     * This ensures no residue is left behind on the final database.
     */
    @AfterEach
    public void removeCustomFieldAndIndex() {
        ObjectNode db = getDatabaseProperties(getHubClient().getDbName(DatabaseKind.FINAL));

        ArrayNode array = (ArrayNode) db.get("field");
        for (int i = 0; i < array.size(); i++) {
            JsonNode field = array.get(i);
            if ("myField".equals(field.get("field-name").asText())) {
                array.remove(i);
                break;
            }
        }

        array = (ArrayNode) db.get("range-field-index");
        for (int i = 0; i < array.size(); i++) {
            JsonNode field = array.get(i);
            if ("myField".equals(field.get("field-name").asText())) {
                array.remove(i);
                break;
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
    }
}
