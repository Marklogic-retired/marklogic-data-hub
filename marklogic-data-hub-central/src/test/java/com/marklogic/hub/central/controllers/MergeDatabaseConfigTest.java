package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
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

public class MergeDatabaseConfigTest {

    private static String ENTITY_SERVICES_RANGE_INDEX = "testEntityServicesRangeIndexForDHFPROD4704";
    private static String ENTITY_SERVICES_PATH_INDEX = "testEntityServicesPathIndexForDHFPROD4704";
    private static String DATABASE_RANGE_INDEX = "testRangeIndexForDHFPROD4704";
    private static String DATABASE_PATH_INDEX = "testPathIndexForDHFPROD4704";
    private static String DATABASE_FIELD_1 = "language";
    private static String DATABASE_FIELD_2 = "security";

    @Test
    public void testMergeIndexConfigsHavingUniqueIndexes() {
        JsonNode indexConfig = getIndexConfig(Collections.singletonList(ENTITY_SERVICES_RANGE_INDEX), Collections.singletonList(ENTITY_SERVICES_PATH_INDEX), null, null);
        JsonNode dbConfig = getIndexConfig(Collections.singletonList(DATABASE_RANGE_INDEX), Collections.singletonList(DATABASE_PATH_INDEX), DATABASE_FIELD_1, DATABASE_FIELD_2);

        ModelController modelController = new ModelController();

        JsonNode mergedNode = modelController.mergeDatabaseProperties((ObjectNode) dbConfig, (ObjectNode) indexConfig);
        String mergedConfig = mergedNode.toString();

        assertIndexesAndFields(mergedConfig);
    }

    @Test
    public void testMergeIndexConfigsHavingCommonIndexes() {
        JsonNode indexConfig = getIndexConfig(Collections.singletonList(ENTITY_SERVICES_RANGE_INDEX), Collections.singletonList(ENTITY_SERVICES_PATH_INDEX), null, null);
        JsonNode dbConfig = getIndexConfig(Arrays.asList(ENTITY_SERVICES_RANGE_INDEX, DATABASE_RANGE_INDEX), Arrays.asList(ENTITY_SERVICES_PATH_INDEX, DATABASE_PATH_INDEX), DATABASE_FIELD_1, DATABASE_FIELD_2);

        ModelController modelController = new ModelController();

        JsonNode mergedNode = modelController.mergeDatabaseProperties((ObjectNode) dbConfig, (ObjectNode) indexConfig);
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

    private JsonNode getIndexConfig(List<String> rangeIndexes, List<String> pathRangeIndexes, String language, String securityDatabase) {
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
