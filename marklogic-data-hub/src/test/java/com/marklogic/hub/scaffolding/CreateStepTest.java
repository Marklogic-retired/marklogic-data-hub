package com.marklogic.hub.scaffolding;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.ScaffoldingImpl;
import org.apache.commons.lang3.tuple.Pair;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class CreateStepTest extends AbstractHubCoreTest {

    ScaffoldingImpl scaffolding;

    @BeforeEach
    void beforeEach() {
        scaffolding = new ScaffoldingImpl(getHubConfig());
    }

    @Test
    void ingestionStep() throws IOException {
        Pair<File, String> results = scaffolding.createStepFile("myIngester", "ingestion");
        File stepFile = results.getLeft();
        assertNull(results.getRight(), "No requirements yet for a message to show to the user after creating an ingestion step");

        JsonNode step = objectMapper.readTree(stepFile);
        assertEquals("myIngester", step.get("name").asText());
        assertEquals("", step.get("description").asText());
        assertEquals("json", step.get("sourceFormat").asText());
        assertEquals("json", step.get("targetFormat").asText());
        assertEquals(4, step.size(), "Expecting name, description, sourceFormat, and targetFormat");

        try {
            scaffolding.createStepFile("myIngester", "ingestion");
            fail("Expected an error because the step file already exists");
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }

    @Test
    void mappingStep() throws IOException {
        Pair<File, String> results = scaffolding.createStepFile("myMapper", "mapping");
        File stepFile = results.getLeft();
        assertEquals("The mapping step file will need to be modified before usage, as it has example values for targetEntityType and sourceQuery.", results.getRight());

        JsonNode step = objectMapper.readTree(stepFile);
        assertEquals("myMapper", step.get("name").asText());
        assertEquals("", step.get("description").asText());
        assertEquals("http://example.org/EntityName-1.0.0/EntityName", step.get("targetEntityType").asText());
        assertEquals("query", step.get("selectedSource").asText());
        assertEquals("cts.collectionQuery('changeme')", step.get("sourceQuery").asText());
        assertEquals(5, step.size(), "Expecting name, description, targetEntityType, selectedSource, and sourceQuery");

        try {
            scaffolding.createStepFile("myMapper", "mapping");
            fail("Expected an error because the step file already exists");
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }
}
