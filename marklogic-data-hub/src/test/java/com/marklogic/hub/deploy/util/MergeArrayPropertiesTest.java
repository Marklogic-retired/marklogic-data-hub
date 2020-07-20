package com.marklogic.hub.deploy.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.mgmt.api.database.Database;
import com.marklogic.mgmt.api.database.ElementIndex;
import com.marklogic.mgmt.api.database.PathIndex;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * This was previously an HC-specific test, but is now a test on the ResourceUtil class.
 */
public class MergeArrayPropertiesTest {

    private static String ENTITY_SERVICES_RANGE_INDEX = "testEntityServicesRangeIndexForDHFPROD4704";
    private static String ENTITY_SERVICES_PATH_INDEX = "testEntityServicesPathIndexForDHFPROD4704";
    private static String DATABASE_RANGE_INDEX = "testRangeIndexForDHFPROD4704";
    private static String DATABASE_PATH_INDEX = "testPathIndexForDHFPROD4704";
    private static String DATABASE_FIELD_1 = "language";
    private static String DATABASE_FIELD_2 = "security";

    @Test
    void simpleMerge() {
        ObjectMapper mapper = new ObjectMapper();
        ObjectNode o1 = mapper.createObjectNode();
        ObjectNode o2 = mapper.createObjectNode();

        o1.putArray("items").add("red").add("blue");
        o1.put("size", "large");
        o1.put("o1thing", "hello");

        o2.putArray("items").add("green");
        o2.put("size", "medium");
        o2.put("o2thing", "world");

        ObjectNode result = ResourceUtil.mergeExistingArrayProperties(o1, o2);
        assertEquals("large", result.get("size").asText());
        assertEquals("hello", result.get("o1thing").asText());
        assertFalse(result.has("o2thing"), "This should have been discarded since it's not present in o1");
        ArrayNode items = (ArrayNode) result.get("items");
        assertEquals(3, items.size());
        assertEquals("green", items.get(0).asText(), "green is first because the items in the first argument are added " +
            "to the array in the second argument");
        assertEquals("red", items.get(1).asText());
        assertEquals("blue", items.get(2).asText());

        // Make sure o2 is the same
        assertEquals(1, o2.get("items").size());
        assertEquals("green", o2.get("items").get(0).asText());
    }

    @Test
    void testMergeIndexConfigsHavingUniqueIndexes() {
        ObjectNode indexConfig = getIndexConfig(Collections.singletonList(ENTITY_SERVICES_RANGE_INDEX), Collections.singletonList(ENTITY_SERVICES_PATH_INDEX), null, null);
        ObjectNode dbConfig = getIndexConfig(Collections.singletonList(DATABASE_RANGE_INDEX), Collections.singletonList(DATABASE_PATH_INDEX), DATABASE_FIELD_1, DATABASE_FIELD_2);

        JsonNode mergedNode = ResourceUtil.mergeExistingArrayProperties(indexConfig, dbConfig);
        assertIndexesAndFields(mergedNode.toString());
    }

    @Test
    void testMergeIndexConfigsHavingCommonIndexes() {
        ObjectNode indexConfig = getIndexConfig(Collections.singletonList(ENTITY_SERVICES_RANGE_INDEX), Collections.singletonList(ENTITY_SERVICES_PATH_INDEX), null, null);
        ObjectNode dbConfig = getIndexConfig(Arrays.asList(ENTITY_SERVICES_RANGE_INDEX, DATABASE_RANGE_INDEX), Arrays.asList(ENTITY_SERVICES_PATH_INDEX, DATABASE_PATH_INDEX), DATABASE_FIELD_1, DATABASE_FIELD_2);

        JsonNode mergedNode = ResourceUtil.mergeExistingArrayProperties(indexConfig, dbConfig);
        String mergedConfig = mergedNode.toString();

        assertEquals(1, StringUtils.countMatches(mergedConfig, ENTITY_SERVICES_RANGE_INDEX));
        assertEquals(1, StringUtils.countMatches(mergedConfig, DATABASE_RANGE_INDEX));
        assertEquals(1, StringUtils.countMatches(mergedConfig, ENTITY_SERVICES_PATH_INDEX));
        assertEquals(1, StringUtils.countMatches(mergedConfig, DATABASE_PATH_INDEX));
        assertIndexesAndFields(mergedConfig);
    }

    private void assertIndexesAndFields(String mergedConfig) {
        assertFalse(mergedConfig.contains(DATABASE_FIELD_1), "Expected " + DATABASE_FIELD_1 + " to not be in mergedConfig: " + mergedConfig);
        assertFalse(mergedConfig.contains(DATABASE_FIELD_2), "Expected " + DATABASE_FIELD_2 + " to not be in mergedConfig: " + mergedConfig);
        assertTrue(mergedConfig.contains(ENTITY_SERVICES_RANGE_INDEX), "Expected " + ENTITY_SERVICES_RANGE_INDEX + " to be in mergedConfig: " + mergedConfig);
        assertTrue(mergedConfig.contains(ENTITY_SERVICES_PATH_INDEX), "Expected " + ENTITY_SERVICES_PATH_INDEX + " to be in mergedConfig: " + mergedConfig);
        assertTrue(mergedConfig.contains(DATABASE_RANGE_INDEX), "Expected " + DATABASE_RANGE_INDEX + " to be in mergedConfig: " + mergedConfig);
        assertTrue(mergedConfig.contains(DATABASE_PATH_INDEX), "Expected " + DATABASE_PATH_INDEX + " to be in mergedConfig: " + mergedConfig);
    }

    private ObjectNode getIndexConfig(List<String> rangeIndexes, List<String> pathRangeIndexes, String language, String securityDatabase) {
        Database db = new Database(null, "data-hub-FINAL");

        List<ElementIndex> elementIndexList = new ArrayList<>();
        rangeIndexes.forEach(rangeIndex -> {
            ElementIndex index = new ElementIndex();
            index.setLocalname(rangeIndex);
            elementIndexList.add(index);
        });
        db.setRangeElementIndex(elementIndexList);

        db.setLanguage(language);
        db.setSecurityDatabase(securityDatabase);

        List<PathIndex> pathIndexList = new ArrayList<>();
        pathRangeIndexes.forEach(pathRangeIndex -> {
            PathIndex pathIndex = new PathIndex();
            pathIndex.setPathExpression(pathRangeIndex);
            pathIndexList.add(pathIndex);
        });
        db.setRangePathIndex(pathIndexList);

        return db.toObjectNode();
    }
}
