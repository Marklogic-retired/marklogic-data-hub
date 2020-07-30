package com.marklogic.hub.scaffolding;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.impl.ScaffoldingImpl;
import com.marklogic.hub.step.StepDefinition.StepDefinitionType;
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
        Pair<JsonNode, String> results = createStep("myIngester", "ingestion", null, null);

        JsonNode step = results.getLeft();
        verifyStep("myIngester", step, true);
        verifyMessages(results.getRight(), "myIngester", "ingestion", null, false);
        verifyArtifactsAreWrittenToDbAndProject("myIngester", "ingestion", null);

        //Create a duplicate ingestion step
        try {
            scaffolding.createStepFile("myIngester", "ingestion", null, null);
            fail("Expected an error because the step file already exists");
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }

        results = createStep("myIngest1", "ingestion", "customIngestion", null);
        step = results.getLeft();
        verifyStep("myIngest1", step, true);
        verifyMessages(results.getRight(), "myIngest1", "ingestion", "customIngestion", true);
        verifyArtifactsAreWrittenToDbAndProject("myIngest1", "ingestion", "customIngestion");

        results = createStep("myIngest2", "ingestion", "customIngestion", null);
        step = results.getLeft();
        verifyStep("myIngest2", step, true);
        verifyMessages(results.getRight(), "myIngest2", "ingestion", "customIngestion", false);
        verifyArtifactsAreWrittenToDbAndProject("myIngest2", "ingestion", null);
    }

    @Test
    void mappingStep() throws IOException {
        installOnlyReferenceModelEntities(false);
        Pair<JsonNode, String> results = createStep("myMapper", "mapping", null, "Customer");
        JsonNode step = results.getLeft();
        assertEquals("http://example.org/Customer-0.0.1/Customer", step.get("targetEntityType").asText());
        assertFalse(step.has("entityType"), "'entityType' should be replaced with 'targetEntityType'");
        verifyStep("myMapper", step, false);
        verifyMessages(results.getRight(), "myMapper", "mapping", null, false);
        verifyArtifactsAreWrittenToDbAndProject("myMapper", "mapping", null);

        //Create a duplicate mapping step
        try {
            scaffolding.createStepFile("myMapper", "mapping", null, "Customer");
            fail("Expected an error because the step file already exists");
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }

    @Test
    void customStep() throws IOException {
        installOnlyReferenceModelEntities(false);

        //Create  a custom step
        Pair<JsonNode, String> results = createStep("myCustom", "custom", null, "Customer");
        JsonNode step = results.getLeft();
        assertEquals("http://example.org/Customer-0.0.1/Customer", step.get("targetEntityType").asText());
        assertFalse(step.has("entityType"), "'entityType' should be replaced with 'targetEntityType'");
        verifyStep("myCustom", step, false);
        verifyMessages(results.getRight(), "myCustom", "custom", "myCustom", true);
        verifyArtifactsAreWrittenToDbAndProject("myCustom", "custom", "myCustom");

        //Create a duplicate custom step
        try {
            scaffolding.createStepFile("myCustom", "custom", null, "Customer");
            fail("Expected an error because the step file already exists");
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }

        //Creating a custom step with existing step definition
        results = createStep("customNoEntity", "custom", "myCustom", null);
        step = results.getLeft();
        assertFalse(step.has("targetEntityType"), "Step not associated with entityType");
        verifyStep("customNoEntity", step, false);
        verifyMessages(results.getRight(), "customNoEntity", "custom", "myCustom", false);
        verifyArtifactsAreWrittenToDbAndProject("customNoEntity", "custom", "myCustom");

        //Create a custom step with step definition name different from step name
        results = createStep("customDiffStepDef", "custom", "newCustomStepDef", "Customer");
        step = results.getLeft();
        assertEquals("http://example.org/Customer-0.0.1/Customer", step.get("targetEntityType").asText());
        assertFalse(step.has("entityType"), "'entityType' should be replaced with 'targetEntityType'");
        verifyStep("customDiffStepDef", step, false);
        verifyMessages(results.getRight(), "customDiffStepDef", "custom", "newCustomStepDef", true);
        verifyArtifactsAreWrittenToDbAndProject("customDiffStepDef", "custom", "newCustomStepDef");
    }

    @Test
    void badStep() {
        //Create a step of invalid type
        try {
            scaffolding.createStepFile("badStep", "invalidType", null, "Customer");
            fail("Expected an error because the step type is invalid");
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
        //Create a mapping step of invalid type
        try {
            scaffolding.createStepFile("badMappingStep", "mapping", null, "User");
            fail("Expected an error because entity type is not present");
        } catch (Exception ex) {
            System.out.println(ex.getMessage());
        }
    }

    private Pair<JsonNode,String> createStep(String stepName, String stepType, String stepDefName, String entityType) throws IOException{
        Pair<File, String> results = scaffolding.createStepFile(stepName, stepType, stepDefName, entityType);
        File stepFile = results.getLeft();
        assertTrue(stepFile.exists());
        JsonNode step = objectMapper.readTree(stepFile);
        return Pair.of(step, results.getRight());
    }

    private void verifyStep(String stepName, JsonNode step, boolean isIngestionStep){
        assertEquals(stepName, step.get("name").asText());
        assertEquals("", step.get("description").asText());
        final String message = "The default step should have stepDefinitionName/stepDefinitionType/stepId " ;
        assertTrue(step.has("stepDefinitionName"), message);
        assertTrue(step.has("stepDefinitionType"), message);
        assertTrue(step.has("stepId"), message);
        if (isIngestionStep){
            assertEquals("json", step.get("sourceFormat").asText());
            assertEquals("json", step.get("targetFormat").asText());
        }
        else {
            assertEquals("query", step.get("selectedSource").asText());
            assertEquals("cts.collectionQuery('changeme')", step.get("sourceQuery").asText());
        }
    }

    private void verifyMessages(String message, String stepName, String stepType, String stepDefName, boolean stepDefCreated){
        StringBuilder messageBuilder = new StringBuilder();
        if(stepDefCreated){
            messageBuilder.append(String.format("Created step definition '%s' of type '%s'.\n", stepName, stepType));
            messageBuilder.append("The module file for the step definition is available at "
                + "/custom-modules/" + stepType.toLowerCase() + "/" + stepDefName + "/main.sjs" + ". \n");
            messageBuilder.append("It is recommended to run './gradlew -i mlWatch' so that as you modify the module, it will be automatically loaded into your application's modules database.\n");
        }
        messageBuilder.append("Created step '" + stepName + "' of type '" + stepType + "' with default properties. It will need to be modified before usage.");
        assertEquals(messageBuilder.toString(), message);
    }

    private void verifyArtifactsAreWrittenToDbAndProject(String stepName, String stepType, String stepDefName){
        assertTrue(getHubConfig().getHubProject().getStepFile(StepDefinitionType.getStepDefinitionType(stepType), stepName).exists());
        assertNotNull(getStagingDoc("/steps/" + stepType + "/" + stepName + ".step.json"));
        if(stepDefName != null){
            assertTrue(getHubConfig().getStepDefinitionsDir().resolve(stepType).resolve(stepDefName).resolve(stepDefName + ".step.json").toFile().exists());
            assertNotNull(getStagingDoc("/step-definitions/" + stepType + "/" + stepDefName + "/" + stepDefName + ".step.json"));
        }
    }
}
