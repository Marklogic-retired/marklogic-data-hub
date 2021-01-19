package com.marklogic.hub.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.entity.*;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Companion test to generate-indexes.sjs - runs a single test to verify that DbConfigsManager works correctly.
 * All other tests should be in generate-indexes.sjs, as those tests will run faster.
 */
public class GenerateIndexesTest extends AbstractHubCoreTest {

    private List<JsonNode> entities = new ArrayList<>();
    private ObjectNode indexes;

    @Test
    public void sharedPropertyWithNullNamespace() {
        final String namespace = null;
        givenAnEntityWithTitleProperty("Book", namespace, true);
        givenAnEntityWithTitleProperty("Movie", namespace, true);
        whenTheIndexesAreBuilt();
        thenTheresOnlyOneRangeIndexForTheSharedProperty(namespace);
    }

    @Test
    public void entityWithNoRangeIndexes() {
        final String namespace = null;
        givenAnEntityWithTitleProperty("Book", namespace, false);
        whenTheIndexesAreBuilt();
        assertFalse(indexes.has("range-element-index"), "DHFPROD-2615 added logic for an empty array to be included " +
            "when no element range indexes existed; however, this was and is inconsistent with how rangeIndex and " +
            "pathRangeIndex work, where no empty array is created if those properties are not specified. To be " +
            "consistent and to avoid indexes from being surprisingly removed, an empty array should not be added to " +
            "the file; range-element-index should not exist, just like range-path-index does not exist. How the OBE " +
            "indexes are removed is up to the developer; given that indexes are often added in a development " +
            "environment, a common technique is to reset the entire ML instance to remove OBE resources and then " +
            "redeploy the application");
    }

    private void givenAnEntityWithTitleProperty(String entityName, String namespace, boolean includeRangeIndex) {
        PropertyType titleProperty = new PropertyType();
        titleProperty.setDatatype("string");
        titleProperty.setCollation("http://marklogic.com/collation/codepoint");
        titleProperty.setName("title");

        DefinitionType defType = new DefinitionType();
        defType.setNamespace(namespace);
        defType.setProperties(Arrays.asList(titleProperty));
        if (includeRangeIndex) {
            defType.setElementRangeIndex(Arrays.asList("title"));
        }

        HubEntity entity = new HubEntity();

        InfoType info = new InfoType();
        info.setTitle("title");
        entity.setInfo(info);

        DefinitionsType definitions = new DefinitionsType();
        definitions.addDefinition(entityName, defType);
        entity.setDefinitions(definitions);
        entities.add(entity.toJson());
    }

    private void whenTheIndexesAreBuilt() {
        indexes = new DbConfigsManager(getHubConfig().newReverseFlowClient()).generateIndexes(entities);
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
