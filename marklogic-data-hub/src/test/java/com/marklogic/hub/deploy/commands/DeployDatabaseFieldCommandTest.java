package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.mgmt.resource.databases.DatabaseManager;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class DeployDatabaseFieldCommandTest extends HubTestBase {

    @Test
    public void test() {
        givenTheFinalDatabaseHasACustomFieldAndIndex();
        whenTheDatabaseFieldCommandIsExecuted();
        thenTheCustomFieldAndIndexStillExist();
    }

    private void givenTheFinalDatabaseHasACustomFieldAndIndex() {
        ObjectNode db = getFinalDatabaseProperties();

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

        new DatabaseManager(adminHubConfig.getManageClient()).save(newNode.toString());
    }

    private void whenTheDatabaseFieldCommandIsExecuted() {
        CommandContext context = new CommandContext(adminHubConfig.getAppConfig(), adminHubConfig.getManageClient(),
            adminHubConfig.getAdminManager());
        new DeployDatabaseFieldCommand().execute(context);
    }

    private void thenTheCustomFieldAndIndexStillExist() {
        ObjectNode db = getFinalDatabaseProperties();

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
    }

    private ObjectNode getFinalDatabaseProperties() {
        DatabaseManager mgr = new DatabaseManager(adminHubConfig.getManageClient());
        try {
            return (ObjectNode) ObjectMapperFactory.getObjectMapper().readTree(mgr.getPropertiesAsJson("data-hub-FINAL"));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * This ensures no residue is left behind on the final database.
     */
    @AfterEach
    public void removeCustomFieldAndIndex() {
        ObjectNode db = getFinalDatabaseProperties();

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

        ObjectNode newNode = ObjectMapperFactory.getObjectMapper().createObjectNode();
        newNode.set("database-name", db.get("database-name"));
        newNode.set("field", db.get("field"));
        newNode.set("range-field-index", db.get("range-field-index"));

        new DatabaseManager(adminHubConfig.getManageClient()).save(newNode.toString());
    }
}
