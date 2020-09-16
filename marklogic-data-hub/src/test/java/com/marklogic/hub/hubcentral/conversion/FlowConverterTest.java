package com.marklogic.hub.hubcentral.conversion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.document.JSONDocumentManager;
import com.marklogic.hub.*;
import com.marklogic.hub.dataservices.FlowService;
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

class FlowConverterTest extends AbstractHubCoreTest {

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
        "/steps/ingestion/custom-ingest.step.json",
        "/steps/mapping/mapping-step-json.step.json",
        "/steps/mapping/mapXmlToXml.step.json",
        "/steps/mapping/mapping-step-xml.step.json",
        "/steps/custom/generate-dictionary.step.json",
        "/steps/custom/custom-mapping-step.step.json",
        "/steps/custom/custom-mastering.step.json"
    );

    private final List<String> expectOneOfTheseStepUris = Arrays.asList(
        "/steps/ingestion/ingestionMappingFlow-ingest-step-json.step.json",
        "/steps/ingestion/ingestionMappingMasteringFlow-ingest-step-json.step.json"
    );

    @BeforeEach
    void setUp() {
        installProjectInFolder("flow-conversion-test");
    }

    @Test
    void convertFlows() {
        HubConfig hubConfig = getHubConfig();
        MappingManager mappingManager = new MappingManagerImpl(hubConfig);
        FlowManager flowManager = new FlowManagerImpl(hubConfig, mappingManager);
        flowManager.getLocalFlows().forEach(flow ->flowMap.put(flow.getName(), flow));
        mappingManager.getMappings().forEach(mapping -> mappingMap.put(mapping.getName(), mapping));

        FlowConverter flowConverter = new FlowConverter(hubConfig);

        flowConverter.convertFlows();
        verifyLegacyMappingsStillExistInMarkLogic();
        verifyFlowsWereConverted();

        flowConverter.deleteLegacyMappings();
        verifyLegacyMappingsWereDeletedFromMarkLogic();
    }

    @Test
    void convertFlowsTwice() {
        HubConfig hubConfig = getHubConfig();
        MappingManager mappingManager = new MappingManagerImpl(hubConfig);
        FlowManager flowManager = new FlowManagerImpl(hubConfig, mappingManager);
        flowManager.getLocalFlows().forEach(flow ->flowMap.put(flow.getName(), flow));
        mappingManager.getMappings().forEach(mapping -> mappingMap.put(mapping.getName(), mapping));

        FlowConverter converter = new FlowConverter(hubConfig);

        converter.convertFlows();
        // convertFlows() should be a no-op the 2nd time
        converter.convertFlows();

        verifyLegacyMappingsStillExistInMarkLogic();
        verifyFlowsWereConverted();
    }

    private void verifyFlowsWereConverted() {
        HubProject hubProject = getHubConfig().getHubProject();

        Path convertedFlows = hubProject.getProjectDir().resolve("converted-flows");

        assertTrue(convertedFlows.toFile().exists());
        assertFalse(hubProject.getHubMappingsDir().toFile().exists());

        assertTrue(convertedFlows.resolve("flows").toFile().listFiles().length > 0);
        assertTrue(convertedFlows.resolve("mappings").toFile().listFiles().length > 0);

        verifyFlows(hubProject);
        verifyIngestionSteps(hubProject, flowMap);
        verifyMappingSteps(hubProject, mappingMap, flowMap);
        verifyCustomSteps(hubProject, flowMap);

        // Deploy artifacts to server
        installUserArtifacts();
        FlowService flowService = FlowService.on(getHubClient().getStagingClient());
        JsonNode flows = flowService.getFlowsWithStepDetails();
        // Confirms that endpoint returns 4 flows.
        assertEquals(4, flows.size());
        for (JsonNode flow: flows){
            String flowName = flow.get("name").asText();
            //Checks the number of steps is same in the original flow and the flow returned by the ds endpoint
            assertEquals(flowMap.get(flowName).getSteps().size(), flow.get("steps").size());
        }
    }

    private void verifyCustomSteps(HubProject hubProject, Map<String, Flow> flowMap) {
        Path customSteps = hubProject.getProjectDir().resolve("steps").resolve("custom");
        Flow customOnlyFlow = flowMap.get("custom_only-flow");
        Flow customMasterFlow = flowMap.get("custom-master");

        JsonNode customStep1 = readJsonObject(customSteps.resolve("custom-mastering.step.json").toFile());
        JsonNode customStep2 = readJsonObject(customSteps.resolve("generate-dictionary.step.json").toFile());
        JsonNode customStep3 = readJsonObject(customSteps.resolve("custom-mapping-step.step.json").toFile());

        assertEquals(List.of("master-customer", "Customer", "custom-mastering" ), getCollectionsAsList(customStep1));
        assertEquals(List.of("generate-dictionary", "Customer"), getCollectionsAsList(customStep2));
        assertEquals(List.of("custom-mapping-step" ), getCollectionsAsList(customStep3));

        verifyOptions(customStep1, mapper.valueToTree(customMasterFlow.getStep("3").getOptions()));
        verifyOptions(customStep2, mapper.valueToTree(customMasterFlow.getStep("1").getOptions()));
        verifyOptions(customStep3, mapper.valueToTree(customOnlyFlow.getStep("1").getOptions()));

        assertEquals("custom-mastering", customStep1.get("name").asText());
        assertEquals("This is a custom mastering step", customStep1.get("description").asText());
        assertEquals("custom", customStep1.get("stepDefinitionType").asText().toLowerCase());
        assertEquals("Customer", customStep1.get("targetEntityType").asText());
        assertEquals("json", customStep1.get("targetFormat").asText());
        assertEquals("custom-mastering-custom", customStep1.get("stepId").asText());

        assertEquals("generate-dictionary", customStep2.get("name").asText());
        assertEquals("Generate dictionary custom step", customStep2.get("description").asText());
        assertEquals("custom", customStep2.get("stepDefinitionType").asText().toLowerCase());
        assertEquals("Customer", customStep2.get("targetEntityType").asText());
        assertEquals("json", customStep2.get("targetFormat").asText());
        assertEquals("exists", customStep2.get("customValue").asText());
        assertEquals("generate-dictionary-custom", customStep2.get("stepId").asText());

        assertEquals("custom-mapping-step", customStep3.get("name").asText());
        assertEquals("maps and harmonizes XML docs to data-hub-FINAL", customStep3.get("description").asText());
        assertEquals("custom", customStep3.get("stepDefinitionType").asText().toLowerCase());
        assertEquals("xml", customStep3.get("targetFormat").asText());
        //"mapping" is copied over in case of custom mapping step with no valid mapping
        assertNotNull(customStep3.get("mapping"));
        assertEquals("custom-mapping-step-custom", customStep3.get("stepId").asText());
    }

    private List getCollectionsAsList(JsonNode customStep){
        JsonNode collectionsNode = customStep.get("collections");
        List<String> collectionList = new ArrayList<>();
        for (JsonNode node : collectionsNode) {
            collectionList.add(node.asText());
        }
        return collectionList;
    }

    private void verifyMappingSteps(HubProject hubProject, Map<String, Mapping> mappingMap, Map<String, Flow> flowMap) {
        Path mappingSteps = hubProject.getProjectDir().resolve("steps").resolve("mapping");
        Flow ingMapFlow = flowMap.get("ingestionMappingFlow");
        Flow ingMapMasterFlow = flowMap.get("ingestionMappingMasteringFlow");

        Mapping mapping1 = mappingMap.get("OrderMappingJson");
        Mapping mapping2 = mappingMap.get("xmlToXml-mapXmlToXml");
        Mapping mapping3 = mappingMap.get("OrderMappingXml");

        JsonNode mapStep1 = readJsonObject(mappingSteps.resolve("mapping-step-json.step.json").toFile());
        JsonNode mapStep2 = readJsonObject(mappingSteps.resolve("mapXmlToXml.step.json").toFile());
        JsonNode mapStep3 = readJsonObject(mappingSteps.resolve("mapping-step-xml.step.json").toFile());

        verifyOptions(mapStep1, mapper.valueToTree(ingMapFlow.getStep("2").getOptions()));
        verifyOptions(mapStep2, mapper.valueToTree(ingMapMasterFlow.getStep("2").getOptions()));
        verifyOptions(mapStep3, mapper.valueToTree(ingMapFlow.getStep("4").getOptions()));

        assertEquals("query", mapStep1.get("selectedSource").asText());
        assertEquals("mapping-step-json-mapping", mapStep1.get("stepId").asText());
        assertEquals("query", mapStep2.get("selectedSource").asText());
        assertEquals("mapXmlToXml-mapping", mapStep2.get("stepId").asText());
        assertEquals("query", mapStep3.get("selectedSource").asText());
        assertEquals("mapping-step-xml-mapping", mapStep3.get("stepId").asText());

        assertNull(mapStep1.get("mapping"));
        assertNull(mapStep2.get("mapping"));
        assertNull(mapStep3.get("mapping"));

        assertEquals("json", mapStep1.get("targetFormat").asText());
        assertEquals("xml", mapStep2.get("targetFormat").asText());
        assertEquals("xml", mapStep3.get("targetFormat").asText());

        assertEquals(mapper.valueToTree(mapping1.getNamespaces()), mapStep1.get("namespaces"));
        assertEquals(mapper.valueToTree(mapping2.getNamespaces()), mapStep2.get("namespaces"));
        assertEquals(mapper.valueToTree(mapping3.getNamespaces()), mapStep3.get("namespaces"));

        assertEquals(mapper.valueToTree(mapping1.getProperties()), mapStep1.get("properties"));
        assertEquals(mapper.valueToTree(mapping2.getProperties()), mapStep2.get("properties"));
        assertEquals(mapper.valueToTree(mapping3.getProperties()), mapStep3.get("properties"));
    }

    private void verifyIngestionSteps(HubProject hubProject, Map<String, Flow> flowMap) {
        Path ingestionSteps = hubProject.getProjectDir().resolve("steps").resolve("ingestion");

        Flow ingMapFlow = flowMap.get("ingestionMappingFlow");
        Flow ingMapMasterFlow = flowMap.get("ingestionMappingMasteringFlow");

        // The two flows above have duplicate names for their ingestion steps.
        // One will get its flow name prepended.
        JsonNode mapIngStep;
        JsonNode mapMasterIngStep;

        // Detect which duplicate step is created. Depends on order that flows are processed.

        // ingestionMappingFlow's ingestion step has the (longer) duplicate step name
        if (ingestionSteps.resolve("ingestionMappingFlow-ingest-step-json.step.json").toFile().exists()) {
            mapIngStep = readJsonObject(ingestionSteps.resolve("ingestionMappingFlow-ingest-step-json.step.json").toFile());
            mapMasterIngStep = readJsonObject(ingestionSteps.resolve("ingest-step-json.step.json").toFile());

            assertEquals("ingestionMappingFlow-ingest-step-json-ingestion", mapIngStep.get("stepId").asText());
            assertEquals("ingest-step-json-ingestion", mapMasterIngStep.get("stepId").asText());
        }
        // ingestionMappingMasteringFlow's ingestion step has the (longer) duplicate step name
        else {
            mapIngStep = readJsonObject(ingestionSteps.resolve("ingest-step-json.step.json").toFile());
            mapMasterIngStep = readJsonObject(ingestionSteps.resolve("ingestionMappingMasteringFlow-ingest-step-json.step.json").toFile());

            assertEquals("ingest-step-json-ingestion", mapIngStep.get("stepId").asText());
            assertEquals("ingestionMappingMasteringFlow-ingest-step-json-ingestion", mapMasterIngStep.get("stepId").asText());
        }

        verifyOptions(mapIngStep, mapper.valueToTree(ingMapFlow.getStep("1").getOptions()));
        assertEquals("input", mapIngStep.get("inputFilePath").asText());
        assertEquals(".*input*.,'/mapping-flow/json/'", mapIngStep.get("outputURIReplacement").asText());
        assertEquals("json", mapIngStep.get("sourceFormat").asText());
        assertEquals("json", mapIngStep.get("targetFormat").asText());

        verifyOptions(mapMasterIngStep, mapper.valueToTree(ingMapMasterFlow.getStep("1").getOptions()));
        assertEquals("mastering-input", mapMasterIngStep.get("inputFilePath").asText());
        assertEquals(".*input*.,'/mastering-flow/json/'", mapMasterIngStep.get("outputURIReplacement").asText());
        assertEquals("json", mapMasterIngStep.get("sourceFormat").asText());
        assertEquals("json", mapMasterIngStep.get("targetFormat").asText());

        JsonNode xmlIngStep = readJsonObject(ingestionSteps.resolve("ingest-step-xml.step.json").toFile());
        verifyOptions(xmlIngStep, mapper.valueToTree(ingMapFlow.getStep("3").getOptions()));
        assertEquals("ingest-step-xml-ingestion", xmlIngStep.get("stepId").asText());
        assertEquals("xml", xmlIngStep.get("sourceFormat").asText());
        assertEquals("xml", xmlIngStep.get("targetFormat").asText());
        assertEquals("input", xmlIngStep.get("inputFilePath").asText());
        assertEquals(".*input*.,'/mapping-flow/xml/'", xmlIngStep.get("outputURIReplacement").asText());

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
        if ("mapping".equalsIgnoreCase(step.get("stepDefinitionType").asText())){
            fieldNotExpected = Set.of("outputFormat", "mapping");
        }
        else if ("ingestion".equalsIgnoreCase(step.get("stepDefinitionType").asText())){
            fieldNotExpected = Set.of("outputFormat");
        }
        // in case of custom steps, "collections" have been tested separately,"outputFormat", "targetEntity" properties
        // are removed from converted steps
        else {
            fieldNotExpected = Set.of("outputFormat", "targetEntity", "collections");
        }

        options.fields().forEachRemaining(kv -> {
            if (!fieldNotExpected.contains(kv.getKey())){
                assertNotNull(step.get(kv.getKey()), "Expected property to exist: " + kv.getKey());
                assertEquals(options.get(kv.getKey()),step.get(kv.getKey()), "Unexpected value for property: " + kv.getKey());
            }
        });
    }

    private void verifyFlows(HubProject hubProject) {
        JsonNode ingMapFlow = readJsonObject(hubProject.getFlowsDir().resolve("ingestionMappingFlow.flow.json").toFile());
        logger.info("ING: " + ingMapFlow);
        JsonNode ingMapMasterFlow = readJsonObject(hubProject.getFlowsDir().resolve("ingestionMappingMasteringFlow.flow.json").toFile());
        JsonNode custFlow = readJsonObject(hubProject.getFlowsDir().resolve("custom_only-flow.flow.json").toFile());
        JsonNode customMasterFlow = readJsonObject(hubProject.getFlowsDir().resolve("custom-master.flow.json").toFile());

        assertTrue(ingMapFlow.has("description"), "Verifying that the flow has more fields than just name and steps; this is " +
            "part of the fix for DHFPROD-5978, with FlowConverterUnitTest covering more detail");

        boolean duplicateStepName = hubProject.getProjectDir().resolve("steps").resolve("ingestion").resolve("ingestionMappingFlow-ingest-step-json.step.json").toFile().exists();
        if (duplicateStepName){
            assertEquals("ingestionMappingFlow-ingest-step-json-ingestion", getStepId(ingMapFlow,"1"));
            assertEquals("ingest-step-json-ingestion", getStepId(ingMapMasterFlow,"1"));
        }
        else {
            assertEquals("ingestionMappingMasteringFlow-ingest-step-json-ingestion", getStepId(ingMapMasterFlow,"1"));
            assertEquals("ingest-step-json-ingestion", getStepId(ingMapFlow,"1"));
        }

        assertEquals("mapping-step-json-mapping", getStepId(ingMapFlow,"2"));
        assertEquals("ingest-step-xml-ingestion", getStepId(ingMapFlow,"3"));
        assertEquals( "mapping-step-xml-mapping",getStepId(ingMapFlow,"4"));

        assertEquals("mapXmlToXml-mapping", getStepId(ingMapMasterFlow,"2"));
        assertEquals("json-matching-step-json-matching", getStepId(ingMapMasterFlow,"3"));
        assertEquals("json-merging-step-json-merging", getStepId(ingMapMasterFlow,"4"));

        assertEquals("custom-mapping-step-custom", getStepId(custFlow, "1"));
        assertEquals("custom-ingest-ingestion", getStepId(custFlow, "2"));

        assertEquals("generate-dictionary-custom", getStepId(customMasterFlow, "1"));
        assertEquals("master-customer-mastering", getStepId(customMasterFlow, "2"));
        assertEquals("custom-mastering-custom", getStepId(customMasterFlow, "3"));
    }

    private String getStepId(JsonNode flowNode, String step){
        return flowNode.get("steps").get(step).get("stepId") != null ? flowNode.get("steps").get(step).get("stepId").asText() : null;
    }

    private void verifyLegacyMappingsStillExistInMarkLogic() {
        Stream.of(getHubClient().getStagingClient().newJSONDocumentManager(), getHubClient().getFinalClient().newJSONDocumentManager()).forEach(mgr -> {
            legacyMappingUris.forEach(uri -> {
                assertNotNull(mgr.exists(uri), "Converting the flows only affects the project files and does not impact " +
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
                assertNotNull(mgr.exists(uri), "Expected each converted step to still exist: " + uri);
            });

            assertEquals(1, expectOneOfTheseStepUris.stream().filter(uri -> mgr.exists(uri) != null).count(),
                "Expected one of the duplicate steps to still exist");
        });
    }
}
