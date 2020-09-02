package com.marklogic.hub.deploy.commands;

import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.step.StepDefinition;
import org.junit.jupiter.api.Test;
import org.springframework.util.FileCopyUtils;

import java.io.File;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * This is intended as a quick performance test of loading a significant number of artifacts of a certain type. Each
 * test is meant to finish under a second or so, which indicates that performance is acceptable for the number of
 * artifacts being loaded in each test. The tests are not doing assertions on the amount of time, as those
 * assertions are likely to be very brittle. Instead, the time to load artifacts is logged for manual inspection.
 */
public class LoadUserArtifactsPerformanceTest extends AbstractHubCoreTest {

    /**
     * The root cause that led to this test being created was that when an entity model is saved, the use of
     * xdmp.invoke to write a document to a different database plus the existence of a pre and post triggers on that
     * document led to some significant performance delays. So this test is used as a quick sanity check that a
     * reasonably large number of entity models can be written in a second or so.
     *
     * @throws Exception
     */
    @Test
    void entities() throws Exception {
        String template = "{\n" +
            "  \"info\": {\n" +
            "    \"title\": \"changeme\",\n" +
            "    \"version\": \"0.0.1\",\n" +
            "    \"baseUri\": \"http://marklogic.com/\"\n" +
            "  },\n" +
            "  \"definitions\": {\n" +
            "    \"changeme\": {\n" +
            "      \"properties\": {\n" +
            "        \"OrderID\": {\n" +
            "          \"datatype\": \"string\"\n" +
            "        }\n" +
            "      }\n" +
            "    }\n" +
            "  }\n" +
            "}";

        final int entityCount = 10;
        for (int i = 1; i <= entityCount; i++) {
            String model = template.replaceAll("changeme", "Entity" + i);
            File file = getHubProject().getHubEntitiesDir().resolve("Entity" + i + ".entity.json").toFile();
            FileCopyUtils.copy(model.getBytes(), file);
        }

        loadUserArtifacts();

        final String collection = "http://marklogic.com/entity-services/models";
        assertEquals(entityCount, getStagingDocCount(collection));
        assertEquals(entityCount, getFinalDocCount(collection));
    }

    /**
     * This test is included as a quick verification that writing artifacts to both staging and final works just fine
     * when there's not a pre-commit trigger involved.
     *
     * @throws Exception
     */
    @Test
    void stepsWithoutPreCommitTriggers() throws Exception {
        String template = "{\n" +
            "  \"name\": \"changeme\",\n" +
            "  \"collections\": [\n" +
            "    \"ingestion-step\"\n" +
            "  ],\n" +
            "  \"permissions\": \"data-hub-common,read,data-hub-common,update\",\n" +
            "  \"stepDefinitionName\": \"default-ingestion\",\n" +
            "  \"stepDefinitionType\": \"INGESTION\",\n" +
            "  \"targetDatabase\": \"data-hub-STAGING\",\n" +
            "  \"targetFormat\": \"json\",\n" +
            "  \"inputFilePath\": \"input/json/customers\",\n" +
            "  \"outputURIReplacement\": \".*input,'/cusIngTest/'\",\n" +
            "  \"sourceFormat\": \"json\",\n" +
            "  \"sourceQuery\": \"cts.collectionQuery([])\",\n" +
            "  \"outputFormat\": \"json\"\n" +
            "}\n";

        final int stepCount = 20;
        for (int i = 1; i <= stepCount; i++) {
            String step = template.replaceAll("changeme", "ingest" + i);
            getHubProject().getStepsPath(StepDefinition.StepDefinitionType.INGESTION).toFile().mkdirs();
            File file = getHubProject().getStepsPath(StepDefinition.StepDefinitionType.INGESTION).resolve("ingest" + i + ".step.json").toFile();
            FileCopyUtils.copy(step.getBytes(), file);
        }

        loadUserArtifacts();

        final String collection = "http://marklogic.com/data-hub/steps/ingestion";
        assertEquals(stepCount, getStagingDocCount(collection));
        assertEquals(stepCount, getFinalDocCount(collection));
    }

    /**
     * Mapping steps have pre-commit triggers, but not post-commit triggers. Interestingly, 20 mappings still load
     * in around a second or so and thus don't have the same performance issues as entity models. So it may be the
     * combination of pre and post commit triggers on entity models that cause problems.
     *
     * @throws Exception
     */
    @Test
    void mappingStepsWhichHavePreCommitTriggers() throws Exception {
        installOnlyReferenceModelEntities();

        String template = "{\n" +
            "  \"lang\": \"zxx\",\n" +
            "  \"name\": \"changeme\",\n" +
            "  \"version\": 1,\n" +
            "  \"targetEntityType\": \"Order\",\n" +
            "  \"sourceContext\": \"/\",\n" +
            "  \"selectedSource\": \"collection\",\n" +
            "  \"properties\": {\n" +
            "  }\n" +
            "}";

        final int stepCount = 20;
        for (int i = 1; i <= stepCount; i++) {
            String step = template.replaceAll("changeme", "mapping" + i);
            getHubProject().getStepsPath(StepDefinition.StepDefinitionType.MAPPING).toFile().mkdirs();
            File file = getHubProject().getStepsPath(StepDefinition.StepDefinitionType.MAPPING).resolve("mapping" + i + ".step.json").toFile();
            FileCopyUtils.copy(step.getBytes(), file);
        }

        loadUserArtifacts();

        final String collection = "http://marklogic.com/data-hub/steps/mapping";
        assertEquals(stepCount, getStagingDocCount(collection));
        assertEquals(stepCount, getFinalDocCount(collection));
    }

    private void loadUserArtifacts() {
        long start = System.currentTimeMillis();
        new LoadUserArtifactsCommand(getHubConfig()).execute(newCommandContext());
        logger.info("Time to load: " + (System.currentTimeMillis() - start));
    }
}
