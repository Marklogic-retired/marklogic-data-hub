package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

public class RemoveCollationFromEntityReferencePropertyTest {

    @Test
    public void test() throws Exception {
        String entityModel = "{\n" +
            "  \"info\" : {\n" +
            "    \"title\" : \"Person\",\n" +
            "    \"version\" : \"0.0.1\",\n" +
            "    \"baseUri\" : \"http://example.org/\"\n" +
            "  },\n" +
            "  \"definitions\" : {\n" +
            "    \"Person\" : {\n" +
            "      \"properties\" : {\n" +
            "        \"id\" : {\n" +
            "          \"datatype\" : \"string\",\n" +
            "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
            "        },\n" +
            "        \"name\" : {\n" +
            "          \"$ref\" : \"#/definitions/Name\",\n" +
            "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
            "        }\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";

        JsonNode node = new ObjectMapper().readTree(entityModel);

        new EntityManagerImpl().removeCollationFromEntityReferenceProperties(node);

        JsonNode nameNode = node.get("definitions").get("Person").get("properties").get("name");
        assertEquals("#/definitions/Name", nameNode.get("$ref").asText());
        assertFalse(nameNode.has("collation"), "The collation should have been removed since the property is an entity reference");

        JsonNode idNode = node.get("definitions").get("Person").get("properties").get("id");
        assertEquals("http://marklogic.com/collation/codepoint", idNode.get("collation").asText(),
            "Just verifying that the collation property wasn't removed from a property that isn't an entity reference");
    }
}
