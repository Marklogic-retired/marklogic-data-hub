package com.marklogic.hub.hubcentral.conversion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.mapping.MappingImpl;
import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class FlowConverterUnitTest {

    FlowConverter converter = new FlowConverter(new HubConfigImpl());
    ObjectMapper objectMapper = new ObjectMapper();
    MappingImpl mapping;

    ObjectNode inlineStep;

    @BeforeEach
    void setup() {
        JsonNodeFactory nodeFactory = objectMapper.getNodeFactory();
        inlineStep = nodeFactory.objectNode();
        inlineStep.put("name", "myStep");
        inlineStep.set("options", nodeFactory.objectNode());
    }

    @Test
    void customHookWithEmptyModule() {
        ObjectNode hook = objectMapper.createObjectNode();
        hook.put("module", "");
        inlineStep.set("customHook", hook);

        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("customHook"), "The customHook should have been removed since module is an empty string; step: " + step);
    }

    @Test
    void customHookWithNoModule() {
        inlineStep.set("customHook", objectMapper.createObjectNode());

        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("customHook"), "The customHook should have been removed since module doesn't exist");
    }

    @Test
    void customHookWithWhitespaceModule() {
        ObjectNode hook = objectMapper.createObjectNode();
        hook.put("module", " ");
        inlineStep.set("customHook", hook);

        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("customHook"), "The customHook should have been removed since module only has whitespace; step: " + step);
    }

    @Test
    void customHookWithNonEmptyModule() {
        ObjectNode hook = objectMapper.createObjectNode();
        hook.put("module", "a");
        inlineStep.set("customHook", hook);

        ObjectNode step = buildStepArtifact();
        assertTrue(step.has("customHook"), "As long as something exists for module, the hook should be retained; step: " + step);
    }

    @Test
    void sourceCollection() {
        ((ObjectNode)inlineStep.get("options")).put("sourceCollection", "something");
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("sourceCollection"), "sourceCollection is specific to QS and should be removed to avoid confusion, " +
            "as it doesn't impact the source query; step: " + step);

        ((ObjectNode)inlineStep.get("options")).put("sourceCollection", "something");
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.CUSTOM.toString());
        step = buildStepArtifact();
        assertTrue(step.has("sourceCollection"), "we don't care about options set in custom step and convert them as is");
    }

    @Test
    void mappingWithoutAVersion() {
        // New mapping step doesnt have a version. Sp using that to test "mapping without a version" scenario
        mapping = new MappingImpl("MappingNoVersion");
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("version"), "a 5.3 mapping step does not include version; step: " + step);
    }

    @Test
    void convertMappingWithVersion0() {
        mapping = new MappingImpl("MappingVersion0");
        mapping.setVersion(0);
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("version"), "a 5.3 mapping step does not include version; step: " + step);
    }

    @Test
    void getMappingArtifact() {
        // Ensure null is returned when step options doesn't have 'mapping'
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        assertNull(converter.getMappingArtifact("dummyFlow", inlineStep));
    }

    @Test
    void sourceContext() {
        mapping = new MappingImpl("myMapping");
        mapping.setSourceContext("/");
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("sourceContext"), "sourceContext is specific to default mappings, and by 5.3, those have " +
            "all been updated to be entity-services mappings; step: " + step);
    }

    @Test
    void targetEntityExistsInsteadOfTargetEntityType() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ((ObjectNode)inlineStep.get("options")).put("targetEntity", "something");

        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("targetEntity"), "targetEntity should have been converted to targetEntityType for mappings");
        assertEquals("something", step.get("targetEntityType").asText());
    }

    @Test
    void emptyTargetEntityExistsInsteadOfTargetEntityType() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ((ObjectNode)inlineStep.get("options")).put("targetEntity", "");

        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("targetEntity"), "targetEntity should have been converted to targetEntityType for mappings");
        assertEquals("", step.get("targetEntityType").asText());
    }

    @Test
    void emptyTargetEntityExistsInACustomStep() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.CUSTOM.toString());
        ((ObjectNode)inlineStep.get("options")).put("targetEntity", "");

        ObjectNode step = buildStepArtifact();
        assertTrue(step.has("targetEntityType"), "targetEntity should have been converted to targetEntityType since custom steps are being converted");
        assertEquals("", step.get("targetEntityType").asText());
    }

    @Test
    void targetEntityAndTargetEntityTypeExist() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ((ObjectNode)inlineStep.get("options")).put("targetEntity", "something");
        mapping = new MappingImpl("abc");
        mapping.setTargetEntityType("realType");

        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("targetEntity"), "targetEntity should have been removed because it doesn't apply to mapping steps");
        assertEquals("realType", step.get("targetEntityType").asText());
    }

    @Test
    void oneExistingCollection() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ((ObjectNode)inlineStep.get("options")).put("collections", "something");
        inlineStep.put("name", "myStep");
        mapping = new MappingImpl("abc");
        mapping.setTargetEntityType("http://example.org/Customer-1/Customer");

        ObjectNode step = buildStepArtifact();
        ArrayNode collections = (ArrayNode) step.get("collections");
        assertEquals(3, collections.size());
        assertEquals("something", collections.get(0).asText());
        assertEquals("myStep", collections.get(1).asText());
        assertEquals("Customer", collections.get(2).asText());
    }

    @Test
    void twoExistingCollectionsAndEntityTypeHasNoForwardSlash() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ((ObjectNode)inlineStep.get("options")).set("collections", objectMapper.valueToTree(Arrays.asList("one", "two")));
        inlineStep.put("name", "myStep");
        mapping = new MappingImpl("abc");
        mapping.setTargetEntityType("WeirdType");

        ObjectNode step = buildStepArtifact();
        ArrayNode collections = (ArrayNode) step.get("collections");
        assertEquals(4, collections.size());
        assertEquals("one", collections.get(0).asText());
        assertEquals("two", collections.get(1).asText());
        assertEquals("myStep", collections.get(2).asText());
        assertEquals("WeirdType", collections.get(3).asText());
    }

    @Test
    void noExistingCollections() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        inlineStep.put("name", "myStep");
        mapping = new MappingImpl("abc");
        mapping.setTargetEntityType("This/IsValidToo");

        ObjectNode step = buildStepArtifact();
        ArrayNode collections = (ArrayNode) step.get("collections");
        assertEquals(2, collections.size());
        assertEquals("myStep", collections.get(0).asText());
        assertEquals("IsValidToo", collections.get(1).asText());
    }

    @Test
    void stepNameAndEntityTypeAreAlreadyCollections() {
        inlineStep.put("stepDefinitionType", StepDefinition.StepDefinitionType.MAPPING.toString());
        ((ObjectNode)inlineStep.get("options")).set("collections", objectMapper.valueToTree(Arrays.asList("one", "myStep", "Customer", "two")));
        inlineStep.put("name", "myStep");
        mapping = new MappingImpl("abc");
        mapping.setTargetEntityType("http://example.org/Customer-1.0.0/Customer");

        ObjectNode step = buildStepArtifact();
        ArrayNode collections = (ArrayNode) step.get("collections");
        assertEquals(4, collections.size(), "Expected 4, collections: " + collections);
        assertEquals("one", collections.get(0).asText());
        assertEquals("myStep", collections.get(1).asText());
        assertEquals("Customer", collections.get(2).asText());
        assertEquals("two", collections.get(3).asText());
    }

    @Test
    void retryLimit() {
        inlineStep.put("retryLimit", 2);
        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("retryLimit"), "retryLimit has no impact on anything and thus should be removed");
    }

    /**
     * If an inline step has null for either property, it'll be serialized as zero. And we don't want to keep that.
     */
    @Test
    void nullBatchSizeAndThreadCount() {
        inlineStep.put("batchSize", 0);
        inlineStep.put("threadCount", 0);
        ObjectNode step = buildStepArtifact();
        assertFalse(step.has("batchSize"), "If batchSize is zero, it should be removed since that's an invalid amount");
        assertFalse(step.has("threadCount"), "If threadCount is zero, it should be removed since that's an invalid amount");
    }

    private ObjectNode buildStepArtifact() {
        return converter.buildStepArtifact(inlineStep, mapping, "myFlow");
    }
}
