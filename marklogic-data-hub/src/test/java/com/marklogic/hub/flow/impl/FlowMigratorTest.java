package com.marklogic.hub.flow.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.*;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.impl.MappingManagerImpl;
import com.marklogic.hub.mapping.Mapping;
import org.junit.Assert;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

class FlowMigratorTest extends AbstractHubCoreTest {

    ObjectMapper mapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        installProjectInFolder("flow-migration-test");
    }

    @Test
    void migrateFlows() throws IOException {

        HubConfig hubConfig = getHubConfig();
        HubProject hubProject = hubConfig.getHubProject();
        MappingManager mappingManager = new MappingManagerImpl(hubConfig);
        FlowManager flowManager = new FlowManagerImpl(hubConfig, mappingManager);
        Map<String,Flow> flowMap = new HashMap<>();
        Map<String, Mapping> mappingMap = new HashMap<>();
        flowManager.getLocalFlows().forEach(flow ->flowMap.put(flow.getName(), flow));
        mappingManager.getMappings().forEach(mapping -> mappingMap.put(mapping.getName(), mapping));

        FlowMigrator flowMigrator = new FlowMigrator(hubConfig);

        //custom_only-flow's steps and hence the flow doesn't need migration
        Flow custFlow = flowManager.getLocalFlow("custom_only-flow");
        Assertions.assertFalse(flowMigrator.flowRequiresMigration(flowManager.getLocalFlow("custom_only-flow")));
        Assertions.assertFalse(flowMigrator.stepRequiresMigration(custFlow.getStep("1")));
        Assertions.assertFalse(flowMigrator.stepRequiresMigration(custFlow.getStep("2")));


        flowMigrator.migrateFlows();
        Path migratedFlows = hubProject.getProjectDir().resolve("migrated-flows");

        Assertions.assertTrue(migratedFlows.toFile().exists());
        Assertions.assertFalse(hubProject.getHubMappingsDir().toFile().exists());

        Assertions.assertTrue(migratedFlows.resolve("flows").toFile().listFiles().length > 0);
        Assertions.assertTrue(migratedFlows.resolve("mappings").toFile().listFiles().length > 0);

        verifyFlows(hubProject);
        verifyIngestionSteps(hubProject, flowMap);
        verifyMappingSteps(hubProject, mappingMap, flowMap);
    }

    private void verifyMappingSteps(HubProject hubProject, Map<String, Mapping> mappingMap, Map<String, Flow> flowMap) throws IOException {
        Path mappingSteps = hubProject.getProjectDir().resolve("steps").resolve("mapping");
        Flow ingMapFlow = flowMap.get("ingestion_mapping-flow");
        Flow ingMapMasterFlow = flowMap.get("ingestion_mapping_mastering-flow");

        Mapping mapping1 = mappingMap.get("OrderMappingJson");
        Mapping mapping2 = mappingMap.get("xmlToXml-mapXmlToXml");

        JsonNode mapStep1 = mapper.readTree(mappingSteps.resolve("mapping-step-json.step.json").toFile());
        JsonNode mapStep2 = mapper.readTree(mappingSteps.resolve("mapXmlToXml.step.json").toFile());

        verifyOptions(mapStep1, mapper.valueToTree(ingMapFlow.getStep("2").getOptions()));
        verifyOptions(mapStep2, mapper.valueToTree(ingMapMasterFlow.getStep("2").getOptions()));

        Assertions.assertEquals("collection", mapStep1.get("selectedSource").asText());
        Assertions.assertEquals("collection", mapStep2.get("selectedSource").asText());

        Assertions.assertNull(mapStep1.get("mapping"));
        Assertions.assertNull(mapStep2.get("mapping"));

        Assertions.assertEquals("json", mapStep1.get("targetFormat").asText());
        Assertions.assertEquals("xml", mapStep2.get("targetFormat").asText());

        Assertions.assertEquals(mapper.valueToTree(mapping1.getNamespaces()), mapStep1.get("namespaces"));
        Assertions.assertEquals(mapper.valueToTree(mapping2.getNamespaces()), mapStep2.get("namespaces"));

        Assertions.assertEquals(mapper.valueToTree(mapping1.getProperties()), mapStep1.get("properties"));
        Assertions.assertEquals(mapper.valueToTree(mapping2.getProperties()), mapStep2.get("properties"));
    }

    private void verifyIngestionSteps(HubProject hubProject, Map<String, Flow> flowMap) throws IOException {
        Path ingestionSteps = hubProject.getProjectDir().resolve("steps").resolve("ingestion");
        boolean duplicateStepName = ingestionSteps.resolve("ingestion_mapping-flow-ingest-step-json.step.json").toFile().exists();

        Flow ingMapFlow = flowMap.get("ingestion_mapping-flow");
        Flow ingMapMasterFlow = flowMap.get("ingestion_mapping_mastering-flow");

        JsonNode ingStep1 = mapper.readTree(ingestionSteps.resolve("ingestion_mapping-flow-ingest-step-json.step.json").toFile());
        JsonNode ingStep2 = mapper.readTree(ingestionSteps.resolve("ingest-step-json.step.json").toFile());
        JsonNode ingStep3 = mapper.readTree(ingestionSteps.resolve("ingest-step-xml.step.json").toFile());

        //Properties change based on which duplicate step is created
        if(duplicateStepName){
            verifyOptions(ingStep1, mapper.valueToTree(ingMapFlow.getStep("1").getOptions()));
            verifyOptions(ingStep2, mapper.valueToTree(ingMapMasterFlow.getStep("1").getOptions()));
            Assertions.assertEquals("input", ingStep1.get("inputFilePath").asText());
            Assertions.assertEquals(".*input*.,'/mapping-flow/json/'", ingStep1.get("outputURIReplacement").asText());
            Assertions.assertEquals("mastering-input", ingStep2.get("inputFilePath").asText());
            Assertions.assertEquals(".*input*.,'/mastering-flow/json/'", ingStep2.get("outputURIReplacement").asText());
        }
        else{
            verifyOptions(ingStep1, mapper.valueToTree(ingMapMasterFlow.getStep("1").getOptions()));
            verifyOptions(ingStep2, mapper.valueToTree(ingMapFlow.getStep("1").getOptions()));

            Assertions.assertEquals("input", ingStep2.get("inputFilePath").asText());
            Assertions.assertEquals(".*input*.,'/mapping-flow/json/'", ingStep2.get("outputURIReplacement").asText());
            Assertions.assertEquals("mastering-input", ingStep1.get("inputFilePath").asText());
            Assertions.assertEquals(".*input*.,'/mastering-flow/json/'", ingStep1.get("outputURIReplacement").asText());
        }
        verifyOptions(ingStep3, mapper.valueToTree(ingMapFlow.getStep("3").getOptions()));

        Assertions.assertEquals("xml", ingStep3.get("sourceFormat").asText());
        Assertions.assertEquals("xml", ingStep3.get("targetFormat").asText());
        Assertions.assertEquals("input", ingStep3.get("inputFilePath").asText());
        Assertions.assertEquals(".*input*.,'/mapping-flow/xml/'", ingStep3.get("outputURIReplacement").asText());

        Assertions.assertEquals("json", ingStep1.get("sourceFormat").asText());
        Assertions.assertEquals("json", ingStep1.get("targetFormat").asText());
        Assertions.assertEquals("json", ingStep2.get("sourceFormat").asText());
        Assertions.assertEquals("json", ingStep2.get("targetFormat").asText());

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
                Assertions.assertNotNull(step.get(kv.getKey()));
                Assertions.assertEquals(options.get(kv.getKey()),step.get(kv.getKey()));
            }
        });
    }

    private void verifyFlows(HubProject hubProject) throws IOException {
        JsonNode ingMapFlow = mapper.readTree(hubProject.getFlowsDir().resolve("ingestion_mapping-flow.flow.json").toFile());
        JsonNode ingMapMasterFlow = mapper.readTree(hubProject.getFlowsDir().resolve("ingestion_mapping_mastering-flow.flow.json").toFile());
        JsonNode custFlow = mapper.readTree(hubProject.getFlowsDir().resolve("custom_only-flow.flow.json").toFile());
        boolean duplicateStepName = hubProject.getProjectDir().resolve("steps").resolve("ingestion").resolve("ingestion_mapping-flow-ingest-step-json.step.json").toFile().exists();
        if(duplicateStepName){
            Assert.assertEquals("ingestion_mapping-flow-ingest-step-json-ingestion", getStepId(ingMapFlow,"1"));
            Assert.assertEquals("ingest-step-json-ingestion", getStepId(ingMapMasterFlow,"1"));
        }
        else {
            Assert.assertEquals("ingestion_mapping_mastering-flow-ingest-step-json-ingestion", getStepId(ingMapMasterFlow,"1"));
            Assert.assertEquals("ingest-step-json-ingestion", getStepId(ingMapFlow,"1"));
        }

        Assert.assertEquals("mapping-step-json-mapping", getStepId(ingMapFlow,"2"));
        Assert.assertEquals("ingest-step-xml-ingestion", getStepId(ingMapFlow,"3"));
        Assert.assertNull( getStepId(ingMapFlow,"4"));

        Assert.assertEquals("mapXmlToXml-mapping", getStepId(ingMapMasterFlow,"2"));
        Assert.assertNull( getStepId(ingMapMasterFlow,"3"));
        Assert.assertNull( getStepId(ingMapMasterFlow,"4"));

        Assert.assertNull( getStepId(custFlow,"1"));
        Assert.assertNull( getStepId(custFlow,"2"));
    }

    private String getStepId(JsonNode flowNode, String step){
        return flowNode.get("steps").get(step).get("stepId") != null ? flowNode.get("steps").get(step).get("stepId").asText() : null;
    }

}
