package com.marklogic.hub.flow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.AbstractHubCoreTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

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

        Document xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        NodeList sourcesList = xmlRecord.getElementsByTagName("sources");
        assertEquals("ingest-customer-xml", sourcesList.item(0).getChildNodes().item(0).getTextContent());
        assertEquals("datahubSourceName", sourcesList.item(1).getChildNodes().item(0).getNodeName());
        assertEquals("test-source-name", sourcesList.item(1).getChildNodes().item(0).getTextContent());
        assertEquals("datahubSourceType", sourcesList.item(1).getChildNodes().item(1).getNodeName());
        assertEquals("test-source-type", sourcesList.item(1).getChildNodes().item(1).getTextContent());

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
        sourcesList = xmlRecord.getElementsByTagName("sources");
        assertEquals("ingest-customer-xml", sourcesList.item(0).getChildNodes().item(0).getTextContent());
        assertEquals("datahubSourceName", sourcesList.item(1).getChildNodes().item(0).getNodeName());
        assertEquals("test-source-name", sourcesList.item(1).getChildNodes().item(0).getTextContent());
        assertEquals("datahubSourceType", sourcesList.item(1).getChildNodes().item(1).getNodeName());
        assertEquals("test-source-type", sourcesList.item(1).getChildNodes().item(1).getTextContent());
        assertEquals("datahubSourceName", sourcesList.item(2).getChildNodes().item(0).getNodeName());
        assertEquals("additional-test-source-name", sourcesList.item(2).getChildNodes().item(0).getTextContent());
        assertEquals("datahubSourceType", sourcesList.item(2).getChildNodes().item(1).getNodeName());
        assertEquals("additional-test-source-type", sourcesList.item(2).getChildNodes().item(1).getTextContent());
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

        Document xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        NodeList sourcesList = xmlRecord.getElementsByTagName("sources");
        assertEquals(2, sourcesList.getLength(), "There are two sources");
        assertEquals("name", sourcesList.item(0).getChildNodes().item(0).getNodeName());
        assertEquals("ingest-customer-xml", sourcesList.item(0).getChildNodes().item(0).getTextContent());
        assertEquals("datahubSourceName", sourcesList.item(1).getChildNodes().item(0).getNodeName());
        assertEquals("test-source-name", sourcesList.item(1).getChildNodes().item(0).getTextContent());
        assertEquals(1, sourcesList.item(1).getChildNodes().getLength(), "only datahubSourceName exists");
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

        Document xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        NodeList sourcesList = xmlRecord.getElementsByTagName("sources");
        assertEquals(2, sourcesList.getLength(), "There are two sources");
        assertEquals("name", sourcesList.item(0).getChildNodes().item(0).getNodeName());
        assertEquals("ingest-customer-xml", sourcesList.item(0).getChildNodes().item(0).getTextContent());
        assertEquals("datahubSourceType", sourcesList.item(1).getChildNodes().item(0).getNodeName());
        assertEquals("test-source-type", sourcesList.item(1).getChildNodes().item(0).getTextContent());
        assertEquals(1, sourcesList.item(1).getChildNodes().getLength(), "only datahubSourceName exists");
    }

    @Test
    void sourceNameAndTypeAreEmpty() {
        runFlow(new FlowInputs("addSourcesFlow", "3"));

        JsonNode record = getStagingDoc("/sources-test/customer1.json");
        ArrayNode sources = (ArrayNode) record.get("envelope").get("headers").get("sources");
        assertEquals(1, sources.size());
        assertEquals("ingest-customer", sources.get(0).get("name").asText(), "only source with name exists");

        Document xmlRecord = getStagingXmlDoc("/sources-test/customer1.xml");
        NodeList sourcesList = xmlRecord.getElementsByTagName("sources");
        assertEquals(1, sourcesList.getLength());
        assertEquals("name", sourcesList.item(0).getChildNodes().item(0).getNodeName());
        assertEquals("ingest-customer-xml", sourcesList.item(0).getChildNodes().item(0).getTextContent());
    }

    @Test
    void sourceQueryDoNotExist() {
        RunFlowResponse flowResponse = runFlow(new FlowInputs("addSourcesFlow", "4"));
        assertEquals("failed", flowResponse.getJobStatus());
        assertFalse(flowResponse.getStepResponses().get("4").isSuccess());
    }
}
