package com.marklogic.hub.mapping;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.bootstrap.Installer;
import com.marklogic.hub.*;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.util.HubModuleManager;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class MappingTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();
    private static File projectDir = projectPath.toFile();

    @Autowired
    HubProject project;

    @Autowired
    HubConfig hubConfig;
    @Autowired
    private FlowManager flowManager;
    @Autowired
    private FlowRunner flowRunner;

    @BeforeAll
    public static void setup() {
        XMLUnit.setIgnoreWhitespace(true);
        new Installer().setupProject();
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
    private void installProject() throws IOException, URISyntaxException {
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

    private void createMappingFromConfig(String mapping) throws IOException {
        JsonNode jsonMap = getJsonFromResource("mapping-test/mappingConfig/"+mapping);
        Mapping testMap = mappingManager.createMappingFromJSON(jsonMap);
        mappingManager.saveMapping(testMap, false);
    }

    private HubModuleManager getPropsMgr() {
        String timestampFile = getHubFlowRunnerConfig().getHubProject().getUserModulesDeployTimestampFile();
        return new HubModuleManager(timestampFile);
    }

    private RunFlowResponse runFlowResp(String flowName, String... stepIds) throws Exception {
        Flow flow = flowManager.getFlow(flowName);
        if (flow == null) {
            throw new Exception(flowName + " not found");
        }
        RunFlowResponse flowResponse = flowRunner.runFlow(flowName, Arrays.asList(stepIds));
        flowRunner.awaitCompletion();

        return flowResponse;
    }

    @Test
    public void testMappingStep() throws Exception {
        installProject();

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        Flow flow = flowManager.getFlow("CustomerXML");
        if (flow == null) {
            throw new Exception("CustomerXML Not Found");
        }
        RunFlowResponse flowResponse = flowRunner.runFlow("CustomerXML", Arrays.asList("1","2"));
        flowRunner.awaitCompletion();
        RunStepResponse mappingJob = flowResponse.getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed");
        assertTrue(getFinalDocCount("CustomerXMLMapping") == 1,"There should be one doc in CustomerXMLMapping collection");
        assertTrue(getDocCountByQuery(HubConfig.DEFAULT_FINAL_NAME, "cts:and-query((cts:json-property-value-query('id', 'ALFKI', 'exact'), cts:collection-query('CustomerXMLMapping')))") == 1, "Attribute properly mapped");
    }

    @Test
    public void testValidLookupFunction() throws Exception{
        installProject();
        createMappingFromConfig("testLookupFunction.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        //Insert a valid dictionary for document lookup
        runInDatabase("xdmp:document-insert('/lookupDictionary/validDictionary.json', object-node"+getJsonFromResource("mapping-test/lookupDictionary/validDictionary.json")+")", HubConfig.DEFAULT_STAGING_NAME);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed");
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

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

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

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Lookup value not found";
        assertTrue(mappingJob.isSuccess(), "Mapping job should not fail for missing lookup values");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testLookupInvalidURI() throws Exception{
        installProject();
        createMappingFromConfig("testLookupFunction.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        //Insert a dictionary with a URI different from the URI in mapping artifact
        runInDatabase("xdmp:document-insert('/lookupDictionary/invalidURI.json', object-node"+getJsonFromResource("mapping-test/lookupDictionary/validDictionary.json")+")", HubConfig.DEFAULT_STAGING_NAME);
        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Dictionary not found at '/lookupDictionary/validDictionary.json'";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail when document lookup has an invalid input URI");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testLookupInvalidDocument() throws Exception{
        installProject();
        createMappingFromConfig("testLookupInvalidDocument.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        //Insert a dictionary with a URI different from the URI in mapping artifact
        runInDatabase("xdmp:document-insert('/lookupDictionary/invalidDictionary.xml', <Dictionary>\n" +
            "  Invalid dictionary\n" +
            "</Dictionary>\n" +
            ")", HubConfig.DEFAULT_STAGING_NAME);
        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Dictionary at '/lookupDictionary/invalidDictionary.xml' is not a JSON Object";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail when document lookup is invalid");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testDateANDDateTime() throws Exception{
        installProject();
        createMappingFromConfig("testDateANDDateTime.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed");
        String jsonString = "{" +
            "\"DateTimeFormat4\": \"1996-07-04T14:25:55-07:00\", " +
            "\"DateTimeFormat5\": \"1996-07-04T14:25:55-07:00\", " +
            "\"DateTimeFormat2\": \"1996-07-04T14:25:55-07:00\", " +
            "\"DateTimeFormat3\": \"1996-07-04T14:25:55-07:00\", " +
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
            "\"DateTimeFormat1\": \"1996-07-04T14:25:55-07:00\"" +
        "}";
        JsonNode actual = getQueryResults("cts:search(fn:doc('/input/json/order1.json')/envelope/instance/Order, cts:collection-query('OrderJSONMapping'))", HubConfig.DEFAULT_FINAL_NAME);
        assertJsonEqual(jsonString, actual.toString(), true);
    }

    @Test
    public void testInvalidDatePattern() throws Exception{
        installProject();
        createMappingFromConfig("testInvalidDatePattern.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The given date pattern (YYYY.MM.DD) is not supported.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidStandardFormats() throws Exception{
        installProject();
        createMappingFromConfig("testInvalidStandardFormat.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Given value doesn't match with the specified pattern (YYYYMMDD,01/08/1996) for parsing date string.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid standard formats");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }


    @Test
    public void testInvalidNonStandardFormats() throws Exception{
        installProject();
        createMappingFromConfig("testInvalidNonStandardFormat.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Given value doesn't match with the specified pattern (Mon DD, YYYY,08.01.1996) for parsing date string.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid non standard formats");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Disabled
    @Test
    //Ignored because it is difficult to generate this scenario to test
    public void testInvalidDateStringValue() throws Exception{
        installProject();
        createMappingFromConfig("testInvalidDateStringValue.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Given value 51100 for date string is invalid.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date string value");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidDateTimePattern() throws Exception{
        installProject();
        createMappingFromConfig("testInvalidDateTimePattern.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "The given dateTime pattern (YYYYMMDD Thhmmss) is not supported.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date time pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testInvalidDateTimeFormat() throws Exception{
        installProject();
        createMappingFromConfig("testInvalidDateTimeFormat.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");

        String output = outputToJson(mappingJob.stepOutput, 0, "message").toString();
        String expected = "Given value doesn't match with the specified pattern for parsing dateTime string.";

        assertFalse(mappingJob.isSuccess(), "Mapping job should fail for invalid date time pattern");
        assertTrue(output.contains(expected),"Expected "+expected+" to be a substring of "+output);
    }

    @Test
    public void testCustomFunction() throws Exception{
        installProject();
        createMappingFromConfig("testCustomFunction1.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed");
        String jsonString = "{" +
            "\"DateTimeFormat5\": \"1996-07-04T14:25:55-07:00\", " +
            "\"CustomerID\": \"VINET\", " +
            "\"OrderID\": \"10249\" " +
            "}";
        JsonNode actual = getQueryResults("cts:search(fn:doc('/input/json/order1.json')/envelope/instance/Order, cts:collection-query('OrderJSONMapping'))", HubConfig.DEFAULT_FINAL_NAME);
        assertJsonEqual(jsonString, actual.toString(), true);
    }

    @Test
    public void testXPathFunctions() throws Exception{
        installProject();
        createMappingFromConfig("testXPathFunctions.json");

        installHubArtifacts(getDataHubAdminConfig(), true);
        installUserModules(getDataHubAdminConfig(), true);

        RunStepResponse mappingJob = runFlowResp("OrderJSON", "1","2").getStepResponses().get("2");
        assertTrue(mappingJob.isSuccess(), "Mapping job failed");
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
}
