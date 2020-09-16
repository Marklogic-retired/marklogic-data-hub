package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.dataservices.OutputEndpoint;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.impl.NodeConverter;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.io.marker.AbstractReadHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MappingManager;
import com.marklogic.hub.deploy.commands.GenerateFunctionMetadataCommand;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class MappingTest extends AbstractHubCoreTest {

    @Autowired
    MappingManager mappingManager;

    @BeforeEach
    void beforeEach() {
        installProjectInFolder("mapping-test");
    }

    @Test
    public void testMappingStep() {
        runAsDataHubOperator();
        RunFlowResponse flowResponse = runFlow("CustomerXML", "1", "2");
        RunStepResponse mappingJob = flowResponse.getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed: "+mappingJob.stepOutput);
        verifyMappingResultsAreCorrect();
    }

    private void verifyMappingResultsAreCorrect() {
        assertEquals(1, getFinalDocCount("CustomerXMLMapping"));
        assertEquals(1, getDocCountByQuery(HubConfig.DEFAULT_FINAL_NAME, "cts:and-query((cts:json-property-value-query('id', 'ALFKI', 'exact'), cts:collection-query('CustomerXMLMapping')))"),
            "Attribute properly mapped");
    }

    /**
     * This test verifies that the Bulk API can be used against the runSteps endpoint. Eventually, this code will move
     * into the application to be reused.
     *
     * @throws Exception
     */
    @Test
    void runMappingStepViaDataServicesEndpoint() {
        runAsDataHubOperator();
        runFlow("CustomerXML", "1");

        OutputEndpoint.BulkOutputCaller bulkCaller = OutputEndpoint.on(
            getHubClient().getStagingClient(),
            getHubClient().getModulesClient().newJSONDocumentManager().read("/data-hub/5/data-services/stepRunner/runSteps.api", new JacksonHandle())
        ).bulkCaller();

        ObjectMapper mapper = new ObjectMapper();
        ObjectNode workUnit = mapper.createObjectNode();
        workUnit.put("flowName", "CustomerXML");
        workUnit.putArray("steps").add("2");

        bulkCaller.setWorkUnit(new JacksonHandle(workUnit));
        bulkCaller.setEndpointState(new JacksonHandle(mapper.createObjectNode()));
        bulkCaller.setOutputListener(response -> logger.info(NodeConverter.InputStreamToString(response)));
        bulkCaller.awaitCompletion();

        verifyMappingResultsAreCorrect();
    }

    @Test
    public void testValidLookupFunction() throws Exception{
        createMappingFromConfig("testLookupFunction.json");

        installUserArtifacts();

        //Insert a valid dictionary for document lookup
        runInDatabase("xdmp:document-insert('/lookupDictionary/validDictionary.json', object-node"+getJsonFromResource("mapping-test/lookupDictionary/validDictionary.json")+")", HubConfig.DEFAULT_STAGING_NAME);

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed: "+mappingJob.stepOutput);
        String jsonString = "{" +
            "\"MemoryLookup\": \"Non-Binary\", " +
            "\"DocumentLookup\": \"Extra Terrestrial\", " +
            "\"CustomerID\": \"VINET\", " +
            "\"OrderID\": \"10249\" " +
            "}";
        JsonNode actual = getQueryResults("cts:search(fn:doc('/input/json/order1.json')/envelope/instance/Order, cts:collection-query('OrderJSONMapping'))", HubConfig.DEFAULT_FINAL_NAME);
        assertJsonEqual(jsonString, actual.toString(), false);
    }

    @Test
    public void testLookupInvalidURI() throws Exception{
        createMappingFromConfig("testLookupFunction.json");

        installUserArtifacts();

        //Insert a dictionary with a URI different from the URI in mapping artifact
        runInDatabase("xdmp:document-insert('/lookupDictionary/invalidURI.json', object-node"+getJsonFromResource("mapping-test/lookupDictionary/validDictionary.json")+")", HubConfig.DEFAULT_STAGING_NAME);

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Dictionary not found at '/lookupDictionary/validDictionary.json'";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail when document lookup has an invalid input URI");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testLookupInvalidDocument() throws Exception{
        createMappingFromConfig("testLookupInvalidDocument.json");

        installUserArtifacts();

        //Insert a dictionary with a URI different from the URI in mapping artifact
        runInDatabase("xdmp:document-insert('/lookupDictionary/invalidDictionary.xml', <Dictionary>\n" +
            "  Invalid dictionary\n" +
            "</Dictionary>\n" +
            ")", HubConfig.DEFAULT_STAGING_NAME);

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Dictionary at '/lookupDictionary/invalidDictionary.xml' is not a JSON Object";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail when document lookup is invalid");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testDateANDDateTime() throws Exception{
        createMappingFromConfig("testDateANDDateTime.json");

        installUserArtifacts();

        String timezoneStr = getTimezoneString();

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed: "+mappingJob.stepOutput);
        String jsonString = "{" +
            "\"DateTimeFormat4\": \"1996-07-04T14:25:55"+ timezoneStr + "\", " +
            "\"DateTimeFormat5\": \"1996-07-04T14:25:55"+ timezoneStr + "\", " +
            "\"DateTimeFormat2\": \"1996-07-04T14:25:55"+ timezoneStr + "\", " +
            "\"DateTimeFormat3\": \"1996-07-04T14:25:55"+ timezoneStr + "\", " +
            "\"RequiredDate5\": \"1996-08-01\", " +
            "\"ShippedDate3\": \"1996-07-16\", " +
            "\"RequiredDate4\": \"1996-08-01\", " +
            "\"ShippedDate4\": \"1996-07-16\", " +
            "\"RequiredDate3\": \"1996-08-01\", " +
            "\"ShippedDate1\": \"1996-08-01\", " +
            "\"RequiredDate2\": \"1996-08-01\", " +
            "\"CustomerID\": \"VINET\", " +
            "\"ShippedDate2\": \"1996-08-01\", " +
            "\"RequiredDate1\": \"1996-08-01\", " +
            "\"OrderID\": \"10249\", " +
            "\"ShippedDate5\": \"1996-08-01\", " +
            "\"DateTimeFormat1\": \"1996-07-04T14:25:55"+ timezoneStr + "\"" +
        "}";
        JsonNode actual = getQueryResults("cts:search(fn:doc('/input/json/order1.json')/envelope/instance/Order, cts:collection-query('OrderJSONMapping'))", HubConfig.DEFAULT_FINAL_NAME);
        assertJsonEqual(jsonString, actual.toString(), true);
    }

    @Test
    public void testInvalidDatePattern() throws Exception{
        createMappingFromConfig("testInvalidDatePattern.json");

        installUserArtifacts();

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The pattern 'YYYY.MM.DD' cannot be applied to the value";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidStandardFormats() throws Exception{
        createMappingFromConfig("testInvalidStandardFormat.json");

        installUserArtifacts();

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The pattern 'YYYYMMDD' cannot be applied to the value '01/08/1996'";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid standard formats");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidDateTimePattern() throws Exception{
        createMappingFromConfig("testInvalidDateTimePattern.json");

        installUserArtifacts();

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The pattern 'YYYYMMDD Thhmmss' cannot be applied to the value";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date time pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidDateTimeFormat() throws Exception{
        createMappingFromConfig("testInvalidDateTimeFormat.json");
        installUserArtifacts();

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The pattern 'YYYYMMDDThhmmss' cannot be applied to the value";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date time pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testCustomFunction() throws Exception{
        createMappingFromConfig("testCustomFunction1.json");
        installUserArtifacts();
        new GenerateFunctionMetadataCommand(getHubConfig()).execute(newCommandContext());

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed: "+mappingJob.stepOutput);
        String timezoneStr = getTimezoneString();
        String jsonString = "{" +
            "\"DateTimeFormat5\": \"1996-07-04T14:25:55" + timezoneStr + "\", " +
            "\"CustomerID\": \"VINET\", " +
            "\"OrderID\": \"10249\" " +
            "}";
        JsonNode actual = getQueryResults("cts:search(fn:doc('/input/json/order1.json')/envelope/instance/Order, cts:collection-query('OrderJSONMapping'))", HubConfig.DEFAULT_FINAL_NAME);
        assertJsonEqual(jsonString, actual.toString(), true);
    }

    @Test
    public void testXPathFunctions() throws Exception{
        createMappingFromConfig("testXPathFunctions.json");
        installUserArtifacts();

        runAsDataHubOperator();
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed: "+mappingJob.stepOutput);
        String jsonString = "{" +
            "\"StringJoin\": \"VINET Cratchit\", " +
            "\"StringRemove\": \"LINET\", " +
            "\"CustomerID\": \"VINET\", " +
            "\"CountofProducts\": 3, " +
            "\"OrderID\": \"10249\", " +
            "\"Priciest\": 30.199" +
            "}";
        JsonNode actual = getQueryResults("cts:search(fn:doc('/input/json/order1.json')/envelope/instance/Order, cts:collection-query('OrderJSONMapping'))", HubConfig.DEFAULT_FINAL_NAME);
        assertJsonEqual(jsonString, actual.toString(), false);
    }

    @Test
    public void testMappingsPermissions() throws Exception {
        Mapping testMap = createMappingFromConfig("testXPathFunctions.json");
        installUserArtifacts();

        // test map for permissions
        String uri = "/mappings/" + testMap.getName() + "/" + testMap.getName() + "-" + testMap.getVersion() + ".mapping.xml.xslt";
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        BytesHandle handle = getHubClient().getModulesClient().newDocumentManager().read(uri, metadata, new BytesHandle());
        Assertions.assertNotEquals(0, handle.get().length);
        DocumentMetadataHandle.DocumentPermissions permissions = metadata.getPermissions();
        Assertions.assertTrue(permissions.get("data-hub-common").contains(DocumentMetadataHandle.Capability.READ));
        Assertions.assertTrue(permissions.get("data-hub-developer").contains(DocumentMetadataHandle.Capability.READ));
        Assertions.assertTrue(permissions.get("data-hub-developer").contains(DocumentMetadataHandle.Capability.EXECUTE));
        Assertions.assertTrue(permissions.get("data-hub-common").contains(DocumentMetadataHandle.Capability.EXECUTE));
    }

    private Mapping createMappingFromConfig(String mapping) throws IOException {
        JsonNode jsonMap = getJsonFromResource("mapping-test/mappingConfig/"+mapping);
        Mapping testMap = mappingManager.createMappingFromJSON(jsonMap);
        mappingManager.saveMapping(testMap, false);
        return testMap;
    }

    /**
     * Constructs a FlowRunnerImpl in the same fashion as it would be in a Spring container, where it has access to a
     * HubProject.
     *
     * @param flowName
     * @param stepIds
     * @return
     */
    protected RunFlowResponse runFlow(String flowName, String... stepIds) {
        FlowRunnerImpl flowRunner = new FlowRunnerImpl(getHubConfig(), new FlowManagerImpl(getHubConfig()));
        RunFlowResponse flowResponse = flowRunner.runFlow(new FlowInputs(flowName, stepIds));
        flowRunner.awaitCompletion();
        return flowResponse;
    }

    private JsonNode outputToJson(List<String> stepOutput, int index, String field) throws Exception {
        JsonNode jsonOutput = objectMapper.readTree(stepOutput.toString());
        return jsonOutput.get(index).get(field);
    }

    private JsonNode getQueryResults(String query, String database) {
        AbstractReadHandle res = runInDatabase(query, database, new JacksonHandle());
        return ((JacksonHandle) res).get();
    }

    private int getDocCountByQuery(String database, String query) {
        int count = 0;
        EvalResultIterator resultItr = runInDatabase("xdmp:estimate(cts:search(fn:collection()," + query + "))", database);
        if (resultItr == null || !resultItr.hasNext()) {
            return count;
        }
        EvalResult res = resultItr.next();
        count = Math.toIntExact((long) res.getNumber());
        return count;
    }

    private String getTimezoneString() {
        StringHandle strHandle = new StringHandle();
        runInDatabase("sem:timezone-string(fn:current-dateTime())", HubConfig.DEFAULT_FINAL_NAME, strHandle);
        return strHandle.get();
    }
}
