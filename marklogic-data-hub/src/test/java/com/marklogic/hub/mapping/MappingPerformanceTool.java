package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.WriteBatcher;
import com.marklogic.client.ext.datamovement.job.DeleteCollectionsJob;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.dataservices.ArtifactService;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.flow.FlowInputs;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * This is intended to be run on an ad hoc basis and not as part of a test suite; thus, its class name does not end
 * in "Test".
 */
public class MappingPerformanceTool extends AbstractHubCoreTest {

    private static final String FLOW_NAME = "mapFlow";

    // The number of source documents to create which will be run through the mapping step
    private static final int SOURCE_DOCUMENT_COUNT = 1000;

    // The number of properties to add to the entity model
    private static final int PROPERTY_COUNT = 500;

    // The different counts of expressions to test in a mapping step
    private static final List<Integer> EXPRESSION_COUNTS = Arrays.asList(10, 50, 100, 250, 500);

    @Test
    void test() {
        createSourceDocuments(SOURCE_DOCUMENT_COUNT, PROPERTY_COUNT);
        createEntityModel(PROPERTY_COUNT);

        Map<Integer, Long> results = new LinkedHashMap<>();
        for (int expressionCount : EXPRESSION_COUNTS) {
            deleteMappedCustomers();

            createFlowWithMappingStepWithExpressionCount(expressionCount);

            long start = System.currentTimeMillis();
            runSuccessfulFlow(new FlowInputs(FLOW_NAME));
            long duration = System.currentTimeMillis() - start;
            results.put(expressionCount, duration);
        }

        results.keySet().forEach(count -> {
            logger.info("Expression count: " + count + "; duration: " + results.get(count));
        });
    }

    private void createSourceDocuments(int count, int propertyCount) {
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.withCollections("source-data");
        metadata.withPermission("data-hub-common", DocumentMetadataHandle.Capability.READ, DocumentMetadataHandle.Capability.UPDATE);

        DataMovementManager mgr = getHubClient().getStagingClient().newDataMovementManager();
        WriteBatcher writeBatcher = mgr.newWriteBatcher().withThreadCount(16).withBatchSize(100);
        for (int i = 1; i <= count; i++) {
            ObjectNode source = objectMapper.createObjectNode();
            for (int j = 1; j <= propertyCount; j++) {
                source.put("sourceProperty" + j, "value " + j);
            }
            writeBatcher.add("/sourceDocument" + i + ".json", metadata, new JacksonHandle(source));
        }
        writeBatcher.flushAndWait();
        mgr.stopJob(writeBatcher);
    }

    private void createEntityModel(int propertyCount) {
        ObjectNode model = objectMapper.createObjectNode();
        ObjectNode info = model.putObject("info");
        info.put("title", "Customer").put("version", "1.0").put("baseUri", "http://example.org/");
        ObjectNode properties = model.putObject("definitions").putObject("Customer").putObject("properties");
        for (int i = 1; i <= propertyCount; i++) {
            properties.putObject("property" + i).put("datatype", "string");
        }
        ModelsService modelsService = ModelsService.on(getHubClient().getStagingClient());
        modelsService.saveDraftModel(model);
        modelsService.publishDraftModels();
    }

    private void createFlowWithMappingStepWithExpressionCount(final int expressionCount) {
        ObjectNode mappingStep = newMappingStep();
        ObjectNode properties = mappingStep.putObject("properties");
        for (int i = 1; i <= expressionCount; i++) {
            properties.putObject("property" + i).put("sourcedFrom", "sourceProperty" + i);
        }

        StepService.on(getHubClient().getStagingClient()).saveStep("mapping", mappingStep, true, false);

        ObjectNode flow = objectMapper.createObjectNode();
        flow.put("name", FLOW_NAME).putObject("steps").putObject("1").put("stepId", mappingStep.get("stepId").asText());
        ArtifactService.on(getHubClient().getStagingClient()).setArtifact("flow", FLOW_NAME, flow);
    }

    private ObjectNode newMappingStep() {
        ObjectNode step = objectMapper.createObjectNode()
            .put("name", "mapTest")
            .put("stepDefinitionName", "entity-services-mapping")
            .put("stepDefinitionType", "mapping")
            .put("stepId", "mapTest-mapping")
            .put("targetEntityType", "http://example.org/Customer-1.0/Customer")
            .put("selectedSource", "query")
            .put("sourceQuery", "cts.collectionQuery('source-data')")
            .put("targetFormat", "JSON")
            .put("permissions", "data-hub-common,read,data-hub-operator,update")
            .put("provenanceGranularityLevel", "off");
        step.putArray("collections").add("mapped-customer");
        return step;
    }

    private void deleteMappedCustomers() {
        new DeleteCollectionsJob("mapped-customer").run(getHubClient().getFinalClient());
    }
}
