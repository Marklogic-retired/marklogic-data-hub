package com.marklogic.hub;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.io.DocumentMetadataHandle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Iterator;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Adding this so that a class can subclass HubTestBase without having to define the same two Spring annotations
 * over and over. Plan is to move a lot of classes to under this so they don't duplicate the annotations.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public abstract class AbstractHubCoreTest extends HubTestBase {

    /**
     * Before each test, reset the project - clear the databases of everything except hub core artifacts - and then
     * delete and initialize a hub project. Then, run tests as a data-hub-developer by default, although each test
     * that extends this class should be sure to use the least privileged user possible. data-hub-developer is chosen
     * here, as the legacy flow-developer role has the manage-admin role which is not a typical role for a Data Hub
     * user to have.
     */
    @BeforeEach
    void beforeEachHubTest() {
        resetHubProject();
        runAsDataHubDeveloper();
    }

    protected DocumentMetadataHelper getMetadata(DatabaseClient client, String uri) {
        return new DocumentMetadataHelper(
            uri,
            client.newDocumentManager().readMetadata(uri, new DocumentMetadataHandle())
        );
    }

    protected void verifyJsonNodes(JsonNode expectedNode, JsonNode actualNode) {
        Iterator<String> names = expectedNode.fieldNames();
        while (names.hasNext()) {
            String name = names.next();
            if (expectedNode.get(name).isArray()) {
                ArrayNode expectedArray = (ArrayNode) expectedNode.get(name);
                ArrayNode actualArray = (ArrayNode) actualNode.get(name);
                for (int i = 0; i < expectedArray.size(); i++) {
                    assertEquals(expectedArray.get(i).asText(), actualArray.get(i).asText(),
                        format("Expected equal values for property %s at array index %d", name, i));
                }
            } else {
                assertEquals(expectedNode.get(name).asText(), actualNode.get(name).asText(), "Expected equal values for property: " + name);
            }
        }
    }
}
