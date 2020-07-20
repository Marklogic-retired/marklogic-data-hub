package com.marklogic.hub.deploy.commands;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class DeployHubDatabaseCommandTest extends AbstractHubCoreTest {

    DeployHubDatabaseCommand command;
    ObjectNode payload;

    @BeforeEach
    void beforeEach() {
        command = new DeployHubDatabaseCommand(getHubConfig(), null, "doesnt-matter.json");

        payload = objectMapper.createObjectNode();
        payload.put("database-name", "test");
    }

    @Test
    void payloadHasValidLanguageProperty() {
        payload.put("language", "en");

        ObjectNode updatedPayload = readJsonObject(command.preparePayloadBeforeSubmitting(payload.toString(), getHubConfig().getManageClient()));
        assertEquals("test", updatedPayload.get("database-name").asText());
        assertTrue(updatedPayload.has("language"), "language should still be present since it's a valid database property");
    }

    @Test
    void payloadHasLanguageOfZxx() {
        payload.put("language", "zxx");

        ObjectNode updatedPayload = readJsonObject(command.preparePayloadBeforeSubmitting(payload.toString(), getHubConfig().getManageClient()));
        assertEquals("test", updatedPayload.get("database-name").asText());
        assertFalse(updatedPayload.has("language"), "A language with a value of 'zxx' should have been removed; this " +
            "should be very unusual, as it likely was not added by a user (who in theory would have selected a valid " +
            "value), but we have had some tests fail where a database payload does have a language (instead of 'lang') " +
            "value of 'zxx'. And since we know that's not a valid language value, we can safely remove it.");
    }

    @Test
    void isProvisionedEnvironment() {
        final boolean originalValue = getHubConfig().getIsProvisionedEnvironment();
        try {
            getHubConfig().setIsProvisionedEnvironment(true);
            payload.put("schema-database", "test1");
            payload.put("triggers-database", "test2");

            ObjectNode updatedPayload = readJsonObject(command.preparePayloadBeforeSubmitting(payload.toString(), getHubConfig().getManageClient()));
            assertEquals("test", updatedPayload.get("database-name").asText());
            assertFalse(updatedPayload.has("schema-database"));
            assertFalse(updatedPayload.has("triggers-database"));
        } finally {
            getHubConfig().setIsProvisionedEnvironment(originalValue);
        }
    }
}
