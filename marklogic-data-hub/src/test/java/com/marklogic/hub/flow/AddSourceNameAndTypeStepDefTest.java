package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.rest.util.Fragment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class AddSourceNameAndTypeStepDefTest extends AbstractHubCoreTest {
    @BeforeEach
    void beforeEach() {
        installProjectInFolder("test-projects/addSources-step-definition-test");
        FlowInputs inputs = new FlowInputs("addSourcesFlow");
        addAbsoluteInputFilePath(inputs, "data");
        runFlow(inputs);
    }

    @Test
    void sourceNameAndSourceTypeExists() {
        FlowInputs flowInputs = new FlowInputs("addSourcesFlow", "3");
        Map<String, Object> options = new HashMap<>();
        options.put("sourceNameToAdd", "test-source-name");
        options.put("sourceTypeToAdd", "test-source-type");
        flowInputs.setOptions(options);
        runFlow(flowInputs);

        JsonNode record = getStagingDoc("/sources-test/customer1.json");
        ArrayNode sources = (ArrayNode) record.get("envelope").get("headers").get("sources");
        assertEquals("ingest-customer", sources.get(0).get("name").asText());
        assertEquals("test-source-name", sources.get(1).get("datahubSourceName").asText());
        assertEquals("test-source-type", sources.get(1).get("datahubSourceType").asText());

        Fragment xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        assertEquals(2, xmlRecord.getElements("/es:envelope/es:headers/sources").size());
        assertEquals("ingest-customer-xml", xmlRecord.getElementValue("/es:envelope/es:headers/sources[1]/name"));
        assertEquals("test-source-name", xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceName"));
        assertEquals("test-source-type", xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceType"));

        // Add additional datahubSourceName and datahubSourceType when already a datahubSourceName and datahubSourceTypes object exists
        options.put("sourceNameToAdd", "additional-test-source-name");
        options.put("sourceTypeToAdd", "additional-test-source-type");
        flowInputs.setOptions(options);
        runFlow(flowInputs);

        record = getStagingDoc("/sources-test/customer1.json");
        sources = (ArrayNode) record.get("envelope").get("headers").get("sources");
        assertEquals("ingest-customer", sources.get(0).get("name").asText());
        assertEquals("test-source-name", sources.get(1).get("datahubSourceName").asText());
        assertEquals("test-source-type", sources.get(1).get("datahubSourceType").asText());
        assertEquals("additional-test-source-name", sources.get(2).get("datahubSourceName").asText());
        assertEquals("additional-test-source-type", sources.get(2).get("datahubSourceType").asText());

        xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        assertEquals(3, xmlRecord.getElements("/es:envelope/es:headers/sources").size());
        assertEquals("ingest-customer-xml", xmlRecord.getElementValue("/es:envelope/es:headers/sources[1]/name"));
        assertEquals("test-source-name", xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceName"));
        assertEquals("test-source-type", xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceType"));
        assertEquals("additional-test-source-name", xmlRecord.getElementValue("/es:envelope/es:headers/sources[3]/datahubSourceName"));
        assertEquals("additional-test-source-type", xmlRecord.getElementValue("/es:envelope/es:headers/sources[3]/datahubSourceType"));
    }

    @Test
    void onlySourceNameExists() {
        FlowInputs flowInputs = new FlowInputs("addSourcesFlow", "3");
        Map<String, Object> options = new HashMap<>();
        options.put("sourceNameToAdd", "test-source-name");
        flowInputs.setOptions(options);
        runFlow(flowInputs);

        JsonNode record = getStagingDoc("/sources-test/customer1.json");
        ArrayNode sources = (ArrayNode) record.get("envelope").get("headers").get("sources");
        assertEquals("ingest-customer", sources.get(0).get("name").asText());
        assertEquals("test-source-name", sources.get(1).get("datahubSourceName").asText());
        assertNull(sources.get(1).get("datahubSourceType"));

        Fragment xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        assertEquals(2, xmlRecord.getElements("/es:envelope/es:headers/sources").size());
        assertEquals("ingest-customer-xml", xmlRecord.getElementValue("/es:envelope/es:headers/sources[1]/name"));
        assertEquals("test-source-name", xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceName"));
        assertNull(xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceType"));
    }

    @Test
    void onlySourceTypeExists() {
        FlowInputs flowInputs = new FlowInputs("addSourcesFlow", "3");
        Map<String, Object> options = new HashMap<>();
        options.put("sourceTypeToAdd", "test-source-type");
        flowInputs.setOptions(options);
        runFlow(flowInputs);

        JsonNode record = getStagingDoc("/sources-test/customer1.json");
        ArrayNode sources = (ArrayNode) record.get("envelope").get("headers").get("sources");
        assertEquals("ingest-customer", sources.get(0).get("name").asText());
        assertEquals("test-source-type", sources.get(1).get("datahubSourceType").asText());
        assertNull(sources.get(1).get("datahubSourceName"));

        Fragment xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        assertEquals(2, xmlRecord.getElements("/es:envelope/es:headers/sources").size());
        assertEquals("ingest-customer-xml", xmlRecord.getElementValue("/es:envelope/es:headers/sources[1]/name"));
        assertNull(xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceName"));
        assertEquals("test-source-type", xmlRecord.getElementValue("/es:envelope/es:headers/sources[2]/datahubSourceType"));
    }

    @Test
    void sourceNameAndTypeAreEmpty() {
        runFlow(new FlowInputs("addSourcesFlow", "3"));

        JsonNode record = getStagingDoc("/sources-test/customer1.json");
        ArrayNode sources = (ArrayNode) record.get("envelope").get("headers").get("sources");
        assertEquals(1, sources.size());
        assertEquals("ingest-customer", sources.get(0).get("name").asText(), "only source with name exists");

        Fragment xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        assertEquals(1, xmlRecord.getElements("/es:envelope/es:headers/sources").size());
        assertEquals("ingest-customer-xml", xmlRecord.getElementValue("/es:envelope/es:headers/sources[1]/name"));
    }

    @Test
    void sourceQueryDoNotExist() {
        RunFlowResponse flowResponse = runFlow(new FlowInputs("addSourcesFlow", "4"));
        assertEquals("failed", flowResponse.getJobStatus());
        assertFalse(flowResponse.getStepResponses().get("4").isSuccess());
    }
}
