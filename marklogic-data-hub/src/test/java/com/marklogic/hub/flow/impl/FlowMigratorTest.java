package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.hub.*;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.dataservices.StepService;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.MappingManagerImpl;
import com.marklogic.hub.mapping.Mapping;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.*;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.*;

class FlowMigratorTest extends AbstractHubCoreTest {

    ObjectMapper mapper = new ObjectMapper();

    private Map<String,Flow> flowMap = new HashMap<>();
    private Map<String, Mapping> mappingMap = new HashMap<>();

    private final List<String> legacyMappingUris = Arrays.asList(
        "/mappings/OrderMappingJson/OrderMappingJson-1.mapping.json",
        "/mappings/OrderMappingXml/OrderMappingXml-1.mapping.json",
        "/mappings/xmlToXml-mapXmlToXml/xmlToXml-mapXmlToXml-1.mapping.json"
    );

    private final List<String> expectedStepUris = Arrays.asList(
        "/steps/ingestion/ingest-step-json.step.json",
        "/steps/ingestion/ingest-step-xml.step.json",
        "/steps/ingestion/ingestion_mapping-flow-ingest-step-json.step.json",
        "/steps/mapping/mapping-step-json.step.json",
        "/steps/mapping/mapXmlToXml.step.json"
    );

    @BeforeEach
    void setUp() {
        installProjectInFolder("flow-migration-test");
    }

    @Test
    void migrateFlows() {
        HubConfig hubConfig = getHubConfig();
        MappingManager mappingManager = new MappingManagerImpl(hubConfig);
        FlowManager flowManager = new FlowManagerImpl(hubConfig, mappingManager);
        flowManager.getLocalFlows().forEach(flow ->flowMap.put(flow.getName(), flow));
        mappingManager.getMappings().forEach(mapping -> mappingMap.put(mapping.getName(), mapping));

        FlowMigrator flowMigrator = new FlowMigrator(hubConfig);

        Flow custFlow = flowManager.getLocalFlow("custom_only-flow");
        assertTrue(flowMigrator.flowRequiresMigration(flowManager.getLocalFlow("custom_only-flow")),
            "Per DHFPROD-5192, the flow needs to be migrated because all ingestion steps are being migrated");
        assertFalse(flowMigrator.stepRequiresMigration(custFlow.getStep("1")),
            "Custom steps aren't being migrated in 5.3.0");
        assertTrue(flowMigrator.stepRequiresMigration(custFlow.getStep("2")),
            "All ingestion steps are being migrated in 5.3.0");

        flowMigrator.migrateFlows();
        verifyLegacyMappingsStillExistInMarkLogic();
        verifyFlowsWereMigrated();

        flowMigrator.deleteInstalledLegacyMappings();
        verifyLegacyMappingsWereDeletedFromMarkLogic();
    }

    private void verifyFlowsWereMigrated() {
        HubProject hubProject = getHubConfig().getHubProject();

        Path migratedFlows = hubProject.getProjectDir().resolve("migrated-flows");

        assertTrue(migratedFlows.toFile().exists());
        assertFalse(hubProject.getHubMappingsDir().toFile().exists());

        assertTrue(migratedFlows.resolve("flows").toFile().listFiles().length > 0);
        assertTrue(migratedFlows.resolve("mappings").toFile().listFiles().length > 0);

        verifyFlows(hubProject);
        verifyIngestionSteps(hubProject, flowMap);
        verifyMappingSteps(hubProject, mappingMap, flowMap);

        //Deploy artifacts to server
        installUserArtifacts();
        FlowService flowService = FlowService.on(getHubClient().getStagingClient());
        JsonNode flows = flowService.getFlowsWithStepDetails();
        //Confirms that endpoint returns 3 flows.
        assertEquals(3, flows.size());
        for(JsonNode flow: flows){
            String flowName = flow.get("name").asText();
            //Checks the number of steps is same in the original flow and the flow returned by the ds endpoint
            assertEquals(flowMap.get(flowName).getSteps().size(), flow.get("steps").size());
        }
    }

    private void verifyMappingSteps(HubProject hubProject, Map<String, Mapping> mappingMap, Map<String, Flow> flowMap) {
        Path mappingSteps = hubProject.getProjectDir().resolve("steps").resolve("mapping");
        Flow ingMapFlow = flowMap.get("ingestion_mapping-flow");
        Flow ingMapMasterFlow = flowMap.get("ingestion_mapping_mastering-flow");

        Mapping mapping1 = mappingMap.get("OrderMappingJson");
        Mapping mapping2 = mappingMap.get("xmlToXml-mapXmlToXml");

        JsonNode mapStep1 = readJsonObject(mappingSteps.resolve("mapping-step-json.step.json").toFile());
        JsonNode mapStep2 = readJsonObject(mappingSteps.resolve("mapXmlToXml.step.json").toFile());

        verifyOptions(mapStep1, mapper.valueToTree(ingMapFlow.getStep("2").getOptions()));
        verifyOptions(mapStep2, mapper.valueToTree(ingMapMasterFlow.getStep("2").getOptions()));

        assertEquals("query", mapStep1.get("selectedSource").asText());
        assertEquals("mapping-step-json-mapping", mapStep1.get("stepId").asText());
        assertEquals("query", mapStep2.get("selectedSource").asText());
        assertEquals("mapXmlToXml-mapping", mapStep2.get("stepId").asText());

        assertNull(mapStep1.get("mapping"));
        assertNull(mapStep2.get("mapping"));

        assertEquals("json", mapStep1.get("targetFormat").asText());
        assertEquals("xml", mapStep2.get("targetFormat").asText());

        assertEquals(mapper.valueToTree(mapping1.getNamespaces()), mapStep1.get("namespaces"));
        assertEquals(mapper.valueToTree(mapping2.getNamespaces()), mapStep2.get("namespaces"));

        assertEquals(mapper.valueToTree(mapping1.getProperties()), mapStep1.get("properties"));
        assertEquals(mapper.valueToTree(mapping2.getProperties()), mapStep2.get("properties"));
    }

    private void verifyIngestionSteps(HubProject hubProject, Map<String, Flow> flowMap) {
        Path ingestionSteps = hubProject.getProjectDir().resolve("steps").resolve("ingestion");
        boolean duplicateStepName = ingestionSteps.resolve("ingestion_mapping-flow-ingest-step-json.step.json").toFile().exists();

        Flow ingMapFlow = flowMap.get("ingestion_mapping-flow");
        Flow ingMapMasterFlow = flowMap.get("ingestion_mapping_mastering-flow");

        JsonNode ingStep1 = readJsonObject(ingestionSteps.resolve("ingestion_mapping-flow-ingest-step-json.step.json").toFile());
        JsonNode ingStep2 = readJsonObject(ingestionSteps.resolve("ingest-step-json.step.json").toFile());
        JsonNode ingStep3 = readJsonObject(ingestionSteps.resolve("ingest-step-xml.step.json").toFile());

        //Properties change based on which duplicate step is created
        if(duplicateStepName){
            verifyOptions(ingStep1, mapper.valueToTree(ingMapFlow.getStep("1").getOptions()));
            verifyOptions(ingStep2, mapper.valueToTree(ingMapMasterFlow.getStep("1").getOptions()));
            assertEquals("input", ingStep1.get("inputFilePath").asText());
            assertEquals(".*input*.,'/mapping-flow/json/'", ingStep1.get("outputURIReplacement").asText());
            assertEquals("mastering-input", ingStep2.get("inputFilePath").asText());
            assertEquals(".*input*.,'/mastering-flow/json/'", ingStep2.get("outputURIReplacement").asText());

            assertEquals("ingestion_mapping-flow-ingest-step-json-ingestion", ingStep1.get("stepId").asText());
            assertEquals("ingest-step-json-ingestion", ingStep2.get("stepId").asText());
        }
        else{
            verifyOptions(ingStep1, mapper.valueToTree(ingMapMasterFlow.getStep("1").getOptions()));
            verifyOptions(ingStep2, mapper.valueToTree(ingMapFlow.getStep("1").getOptions()));

            assertEquals("input", ingStep2.get("inputFilePath").asText());
            assertEquals(".*input*.,'/mapping-flow/json/'", ingStep2.get("outputURIReplacement").asText());
            assertEquals("mastering-input", ingStep1.get("inputFilePath").asText());
            assertEquals(".*input*.,'/mastering-flow/json/'", ingStep1.get("outputURIReplacement").asText());

            assertEquals("ingestion_mapping-flow-ingest-step-json-ingestion", ingStep2.get("stepId").asText());
            assertEquals("ingest-step-json-ingestion", ingStep1.get("stepId").asText());
        }
        verifyOptions(ingStep3, mapper.valueToTree(ingMapFlow.getStep("3").getOptions()));

        assertEquals("ingest-step-xml-ingestion", ingStep3.get("stepId").asText());
        assertEquals("xml", ingStep3.get("sourceFormat").asText());
        assertEquals("xml", ingStep3.get("targetFormat").asText());
        assertEquals("input", ingStep3.get("inputFilePath").asText());
        assertEquals(".*input*.,'/mapping-flow/xml/'", ingStep3.get("outputURIReplacement").asText());

        assertEquals("json", ingStep1.get("sourceFormat").asText());
        assertEquals("json", ingStep1.get("targetFormat").asText());
        assertEquals("json", ingStep2.get("sourceFormat").asText());
        assertEquals("json", ingStep2.get("targetFormat").asText());

        verifyIngestionStepWithCustomStepDefinition(hubProject);
    }

    private void verifyIngestionStepWithCustomStepDefinition(HubProject hubProject) {
        Path ingestionSteps = hubProject.getProjectDir().resolve("steps").resolve("ingestion");
        JsonNode step = readJsonObject(ingestionSteps.resolve("custom-ingest.step.json").toFile());
        assertEquals("custom-ingest", step.get("name").asText());
        assertEquals("custom-ingest-ingestion", step.get("stepId").asText());
        assertEquals("ingests json docs to data-hub-STAGING", step.get("description").asText());
        assertEquals("100", step.get("batchSize").asText());
        assertEquals("4", step.get("threadCount").asText());
        assertEquals("custom-ingestion", step.get("stepDefinitionName").asText());
        assertEquals("INGESTION", step.get("stepDefinitionType").asText());
        assertEquals("custom-ingest-json", step.get("collections").get(0).asText());
        assertEquals("custom-ingest", step.get("collections").get(1).asText());
        assertEquals("rest-reader,read,rest-writer,update", step.get("permissions").asText());
        assertEquals("data-hub-STAGING", step.get("targetDatabase").asText());
        assertEquals("json", step.get("targetFormat").asText());
        assertEquals("json", step.get("sourceFormat").asText());
        assertEquals("mastering-input", step.get("inputFilePath").asText());
        assertEquals(".*input*.,'/mastering-flow/json/'", step.get("outputURIReplacement").asText());
    }

    private void verifyOptions(JsonNode step, JsonNode options){
        Set fieldNotExpected ;
        if("mapping".equalsIgnoreCase(step.get("stepDefinitionType").asText())){
            fieldNotExpected = Set.of("outputFormat", "mapping");
        }
        else{
            fieldNotExpected = Set.of("outputFormat");
        }

        options.fields().forEachRemaining(kv -> {
            if(!fieldNotExpected.contains(kv.getKey())){
                assertNotNull(step.get(kv.getKey()), "Expected property to exist: " + kv.getKey());
                assertEquals(options.get(kv.getKey()),step.get(kv.getKey()), "Unexpected value for property: " + kv.getKey());
            }
        });
    }

    private void verifyFlows(HubProject hubProject) {
        JsonNode ingMapFlow = readJsonObject(hubProject.getFlowsDir().resolve("ingestion_mapping-flow.flow.json").toFile());
        JsonNode ingMapMasterFlow = readJsonObject(hubProject.getFlowsDir().resolve("ingestion_mapping_mastering-flow.flow.json").toFile());
        JsonNode custFlow = readJsonObject(hubProject.getFlowsDir().resolve("custom_only-flow.flow.json").toFile());
        boolean duplicateStepName = hubProject.getProjectDir().resolve("steps").resolve("ingestion").resolve("ingestion_mapping-flow-ingest-step-json.step.json").toFile().exists();
        if(duplicateStepName){
            assertEquals("ingestion_mapping-flow-ingest-step-json-ingestion", getStepId(ingMapFlow,"1"));
            assertEquals("ingest-step-json-ingestion", getStepId(ingMapMasterFlow,"1"));
        }
        else {
            assertEquals("ingestion_mapping_mastering-flow-ingest-step-json-ingestion", getStepId(ingMapMasterFlow,"1"));
            assertEquals("ingest-step-json-ingestion", getStepId(ingMapFlow,"1"));
        }

        assertEquals("mapping-step-json-mapping", getStepId(ingMapFlow,"2"));
        assertEquals("ingest-step-xml-ingestion", getStepId(ingMapFlow,"3"));
        assertNull( getStepId(ingMapFlow,"4"));

        assertEquals("mapXmlToXml-mapping", getStepId(ingMapMasterFlow,"2"));
        assertNull( getStepId(ingMapMasterFlow,"3"));
        assertNull( getStepId(ingMapMasterFlow,"4"));

        assertNull( getStepId(custFlow,"1"), "The custom step should still be defined inline");
        assertEquals("custom-ingest-ingestion", getStepId(custFlow, "2"));
    }

    private String getStepId(JsonNode flowNode, String step){
        return flowNode.get("steps").get(step).get("stepId") != null ? flowNode.get("steps").get(step).get("stepId").asText() : null;
    }

    private void verifyLegacyMappingsStillExistInMarkLogic() {
        Stream.of(getHubClient().getStagingClient().newJSONDocumentManager(), getHubClient().getFinalClient().newJSONDocumentManager()).forEach(mgr -> {
            legacyMappingUris.forEach(uri -> {
                assertNotNull(mgr.exists(uri), "Migrating the flows only affects the project files and does not impact " +
                    "what's deployed to ML; did not find URI: " + uri);
            });
        });
    }

    private void verifyLegacyMappingsWereDeletedFromMarkLogic() {
        Stream.of(getHubClient().getStagingClient(), getHubClient().getFinalClient()).forEach(client -> {
            JSONDocumentManager mgr = client.newJSONDocumentManager();
            legacyMappingUris.forEach(uri -> {
                assertNull(mgr.exists(uri), "Did not expect to find legacy mapping: " + uri);
            });

            expectedStepUris.forEach(uri -> {
                assertNotNull(mgr.exists(uri), "Expected each migrated step to still exist: " + uri);
            });
        });
    }
}
