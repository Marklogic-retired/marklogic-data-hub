package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.entity.DefinitionType;
import com.marklogic.hub.entity.DefinitionsType;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.hub.entity.PropertyType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Companion test to generate-indexes.sjs - runs a single test to verify that DbConfigsManager works correctly.
 * All other tests should be in generate-indexes.sjs, as those tests will run faster.
 */
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class GenerateIndexesTest extends HubTestBase {

    private List<JsonNode> entities = new ArrayList();
    private ObjectNode indexes;

    @Test
    public void sharedPropertyWithNullNamespace() {
        final String namespace = null;
        givenAnEntityWithTitleProperty("Book", namespace);
        givenAnEntityWithTitleProperty("Movie", namespace);
        whenTheIndexesAreBuilt();
        thenTheresOnlyOneRangeIndexForTheSharedProperty(namespace);
    }

    private void givenAnEntityWithTitleProperty(String entityName, String namespace) {
        PropertyType titleProperty = new PropertyType();
        titleProperty.setDatatype("string");
        titleProperty.setCollation("http://marklogic.com/collation/codepoint");
        titleProperty.setName("title");

        DefinitionType defType = new DefinitionType();
        defType.setNamespace(namespace);
        defType.setProperties(Arrays.asList(titleProperty));
        defType.setElementRangeIndex(Arrays.asList("title"));

        HubEntity entity = new HubEntity();
        DefinitionsType definitions = new DefinitionsType();
        definitions.addDefinition(entityName, defType);
        entity.setDefinitions(definitions);
        entities.add(entity.toJson());
    }

    private void whenTheIndexesAreBuilt() {
        indexes = new DbConfigsManager(adminHubConfig.newReverseFlowClient()).generateIndexes(entities);
    }

    private void thenTheresOnlyOneRangeIndexForTheSharedProperty(String namespace) {
        ArrayNode rangeIndexes = (ArrayNode) indexes.get("range-element-index");
        assertEquals(1, rangeIndexes.size());
        JsonNode index = rangeIndexes.get(0);
        assertEquals("http://marklogic.com/collation/codepoint", index.get("collation").asText());
        assertEquals("reject", index.get("invalid-values").asText());
        assertEquals("title", index.get("localname").asText());
        assertFalse(index.get("range-value-positions").asBoolean());
        assertEquals("string", index.get("scalar-type").asText());

        if (namespace == null) {
            assertTrue(index.get("namespace-uri").isNull());
        } else {
            assertEquals(namespace, index.get("namespace-uri").asText());
        }
    }
}
