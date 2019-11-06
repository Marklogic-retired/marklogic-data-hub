package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.mgmt.util.ObjectMapperFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class GetEntityFromProjectTest {

    private final static String PERSON_MODEL = "{\n" +
        "  \"info\": {\n" +
        "    \"title\": \"Person\",\n" +
        "    \"version\": \"0.0.1\",\n" +
        "    \"baseUri\": \"http://example.org\"\n" +
        "  },\n" +
        "  \"definitions\": {\n" +
        "    \"Name\": {\n" +
        "      \"properties\": {\n" +
        "        \"first\": {\n" +
        "          \"datatype\": \"string\"\n" +
        "        },\n" +
        "        \"last\": {\n" +
        "          \"datatype\": \"string\"\n" +
        "        }\n" +
        "      }\n" +
        "    },\n" +
        "    \"Person\": {\n" +
        "      \"properties\": {\n" +
        "        \"id\": {\n" +
        "          \"datatype\": \"string\"\n" +
        "        },\n" +
        "        \"name\": {\n" +
        "          \"$ref\": \"#/definitions/Name\"\n" +
        "        }\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "}\n";

    private final static String NAME_MODEL = "{\n" +
        "  \"info\" : {\n" +
        "    \"title\" : \"Name\",\n" +
        "    \"version\" : \"0.0.2\",\n" +
        "    \"baseUri\" : \"http://example.org/\"\n" +
        "  },\n" +
        "  \"definitions\" : {\n" +
        "    \"Name\" : {\n" +
        "      \"properties\" : {\n" +
        "        \"first\" : {\n" +
        "          \"datatype\" : \"string\",\n" +
        "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
        "        },\n" +
        "        \"middle\" : {\n" +
        "          \"datatype\" : \"string\",\n" +
        "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
        "        },\n" +
        "        \"last\" : {\n" +
        "          \"datatype\" : \"string\",\n" +
        "          \"collation\" : \"http://marklogic.com/collation/codepoint\"\n" +
        "        }\n" +
        "      }\n" +
        "    }\n" +
        "  }\n" +
        "}\n";

    private HubEntity personModel;
    private HubEntity nameModel;
    private EntityManagerImpl entityManager;

    @BeforeEach
    void setup() throws Exception {
        personModel = HubEntity.fromJson("Person.entity.json", ObjectMapperFactory.getObjectMapper().readTree(PERSON_MODEL));
        nameModel = HubEntity.fromJson("Name.entity.json", ObjectMapperFactory.getObjectMapper().readTree(NAME_MODEL));
        entityManager = new EntityManagerImpl();
    }

    @Test
    void twoModelsWithVersionSpecified() {
        JsonNode json = entityManager.getEntityFromProject("Person", Arrays.asList(personModel, nameModel), "0.0.1", true).toJson();
        verifyNamePropertiesExist(json, false, "Since 0.0.1 is requested, the 0.0.2 Name model should be ignored, and thus " +
            "there should not be a 'middle' property.");
    }

    @Test
    void twoModelsWithNoVersionAndPersonIsFirst() {
        JsonNode json = entityManager.getEntityFromProject("Person", Arrays.asList(personModel, nameModel), null, true).toJson();
        verifyNamePropertiesExist(json, false, "Since no version is specified, the order in which the entity models are " +
            "read in matters. Since Person is first, the Name model from Person should be used, and thus there should not be " +
            "a 'middle' property.");
    }

    @Test
    void twoModelsWithNoVersionAndNameIsFirst() {
        JsonNode json = entityManager.getEntityFromProject("Person", Arrays.asList(nameModel, personModel), null, true).toJson();
        verifyNamePropertiesExist(json, true, "Since no version is specified, the order in which the entity models are " +
            "read in matters. Since Name is first, the 'middle' property should exist.");
    }

    @Test
    void oneEntityModel() {
        JsonNode json = new EntityManagerImpl().getEntityFromProject("Person", Arrays.asList(personModel), null, true).toJson();
        verifyNamePropertiesExist(json, false, "Since only the Person model is being used, the 'middle' property should not exist.");
    }

    /**
     * Verifies the name properties of the JSON representation of the hub entity. Whether or not a "middle" property
     * exists on the Name is of interest, as the 0.0.1 version does not have it but the 0.0.2 version does.
     *
     * @param json
     * @param middleExists
     * @param message
     */
    void verifyNamePropertiesExist(JsonNode json, boolean middleExists, String message) {
        JsonNode personProperties = json.get("definitions").get("Person").get("properties");
        assertTrue(personProperties.has("id"));
        assertTrue(personProperties.has("name"));

        JsonNode nameProperty = personProperties.get("name");
        assertEquals("#/definitions/Name", nameProperty.get("$ref").asText());
        assertTrue(nameProperty.has("subProperties"));

        JsonNode subProperties = nameProperty.get("subProperties");
        assertTrue(subProperties.has("first"));
        assertTrue(subProperties.has("last"));

        if (middleExists) {
            assertTrue(subProperties.has("middle"), message);
        } else {
            assertFalse(subProperties.has("middle"), message);
        }
    }

}
