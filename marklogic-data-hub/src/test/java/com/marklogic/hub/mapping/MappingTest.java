package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.dataservices.OutputEndpoint;
import com.marklogic.client.impl.NodeConverter;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class MappingTest extends HubTestBase {

    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();

    @Autowired
    FlowRunner flowRunner;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().setupProject();
    }

    @BeforeEach
    public void setupTest() {
        runAsDataHubOperator();
    }

    @AfterAll
    public static void teardown() {
        new Installer().teardownProject();
    }

    @AfterEach
    public void clearProjectData() {
        this.deleteProjectDir();
        clearDatabases(HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    @Test
    public void testMappingStep() throws Exception {
        installProject();
        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

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
    void runMappingStepViaDataServicesEndpoint() throws Exception {
        installProject();
        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        runFlow("CustomerXML", "1");

        OutputEndpoint.BulkOutputCaller bulkCaller = OutputEndpoint.on(
            adminHubConfig.newStagingClient(null),
            adminHubConfig.newModulesDbClient().newJSONDocumentManager().read("/data-hub/5/data-services/stepRunner/runSteps.api", new JacksonHandle())
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
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testLookupFunction.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        //Insert a valid dictionary for document lookup
        runInDatabase("xdmp:document-insert('/lookupDictionary/validDictionary.json', object-node"+getJsonFromResource("mapping-test/lookupDictionary/validDictionary.json")+")", HubConfig.DEFAULT_STAGING_NAME);

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

    @Disabled
    @Test
    //Ignored because not able to reach the code that throws an error when lookup value is non JSON
    public void testLookupNonJSON() throws Exception{
        installProject();
        createMappingFromConfig("testLookupNonJSON.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Expected JSON string or object.";
        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for non JSON memory lookup");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of " + output);
    }

    @Disabled
    @Test
    //Ignored because we are not throwing an error. Only logging in error_logs and letting the step to pass
    public void testLookupValueMissing() throws Exception{
        installProject();
        createMappingFromConfig("testMissingLookup.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Lookup value not found";
        assertTrue(mappingJob.isSuccess(), "Mapping job should not fail for missing lookup values");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testLookupInvalidURI() throws Exception{
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testLookupFunction.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        //Insert a dictionary with a URI different from the URI in mapping artifact
        runInDatabase("xdmp:document-insert('/lookupDictionary/invalidURI.json', object-node"+getJsonFromResource("mapping-test/lookupDictionary/validDictionary.json")+")", HubConfig.DEFAULT_STAGING_NAME);
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Dictionary not found at '/lookupDictionary/validDictionary.json'";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail when document lookup has an invalid input URI");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testLookupInvalidDocument() throws Exception{
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testLookupInvalidDocument.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        //Insert a dictionary with a URI different from the URI in mapping artifact
        runInDatabase("xdmp:document-insert('/lookupDictionary/invalidDictionary.xml', <Dictionary>\n" +
            "  Invalid dictionary\n" +
            "</Dictionary>\n" +
            ")", HubConfig.DEFAULT_STAGING_NAME);
        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Dictionary at '/lookupDictionary/invalidDictionary.xml' is not a JSON Object";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail when document lookup is invalid");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testDateANDDateTime() throws Exception{
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testDateANDDateTime.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        String timezoneStr = getTimezoneString();
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
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testInvalidDatePattern.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The given date pattern (YYYY.MM.DD) is not supported.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidStandardFormats() throws Exception{
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testInvalidStandardFormat.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Given value doesn't match with the specified pattern (YYYYMMDD,01/08/1996) for parsing date string.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid standard formats");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidDateTimePattern() throws Exception{
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testInvalidDateTimePattern.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The given dateTime pattern (YYYYMMDD Thhmmss) is not supported.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date time pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidDateTimeFormat() throws Exception{
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testInvalidDateTimeFormat.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlow("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Given value doesn't match with the specified pattern for parsing dateTime string.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date time pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testCustomFunction() throws Exception{
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testCustomFunction1.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

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
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        createMappingFromConfig("testXPathFunctions.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

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
        Assumptions.assumeTrue(versions.isVersionCompatibleWithES());
        installProject();
        Mapping testMap = createMappingFromConfig("testXPathFunctions.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        // test map for permissions
        String uri = "/mappings/" + testMap.getName() + "/" + testMap.getName() + "-" + testMap.getVersion() + ".mapping.xml.xslt";
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        BytesHandle handle = modMgr.read(uri, metadata, new BytesHandle());
        Assertions.assertNotEquals(0, handle.get().length);
        DocumentMetadataHandle.DocumentPermissions permissions = metadata.getPermissions();
        Assertions.assertTrue(permissions.get("data-hub-operator").contains(DocumentMetadataHandle.Capability.READ));
        Assertions.assertTrue(permissions.get("data-hub-developer").contains(DocumentMetadataHandle.Capability.READ));
        Assertions.assertTrue(permissions.get("data-hub-developer").contains(DocumentMetadataHandle.Capability.EXECUTE));
        Assertions.assertTrue(permissions.get("data-hub-operator").contains(DocumentMetadataHandle.Capability.EXECUTE));
    }

    private void installProject() throws IOException {
        String[] directoriesToCopy = new String[]{"input", "flows", "entities", "mappings", "src/main/ml-modules/root/custom-modules"};
        for (final String subDirectory: directoriesToCopy) {
            final Path subProjectPath = projectPath.resolve(subDirectory);
            subProjectPath.toFile().mkdir();
            Path subResourcePath = Paths.get("mapping-test", subDirectory);
            copyFileStructure(subResourcePath, subProjectPath);
        }
    }

    private void copyFileStructure(Path resourcePath, Path projectPath) throws IOException {
        for (File childFile: getResourceFile(resourcePath.toString().replaceAll("\\\\","/")).listFiles()) {
            if (childFile.isDirectory()) {
                Path subProjectPath = projectPath.resolve(childFile.getName());
                subProjectPath.toFile().mkdir();
                Path subResourcePath = resourcePath.resolve(childFile.getName());
                copyFileStructure(subResourcePath, subProjectPath);
            } else {
                Files.copy(getResourceStream(resourcePath.resolve(childFile.getName()).toString().replaceAll("\\\\","/")), projectPath.resolve(childFile.getName()));
            }
        }
    }

    private Mapping createMappingFromConfig(String mapping) throws IOException {
        JsonNode jsonMap = getJsonFromResource("mapping-test/mappingConfig/"+mapping);
        Mapping testMap = mappingManager.createMappingFromJSON(jsonMap);
        mappingManager.saveMapping(testMap, false);
        return testMap;
    }

    protected RunFlowResponse runFlow(String flowName, String... stepIds) {
        RunFlowResponse flowResponse = flowRunner.runFlow(flowName, Arrays.asList(stepIds));
        flowRunner.awaitCompletion();
        return flowResponse;
    }
}
