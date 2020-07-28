package com.marklogic.hub.master;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.bootstrap.Installer;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.ApplicationConfig;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.HubTestBase;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.apache.commons.io.IOUtils;
import org.custommonkey.xmlunit.XMLUnit;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = ApplicationConfig.class)
public class MasterTest extends HubTestBase {
    static Path projectPath = Paths.get(PROJECT_PATH).toAbsolutePath();

    @Autowired
    FlowRunner flowRunner;

    private boolean isSetup = false;

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
    public void afterEach() {
        clearDatabases(HubConfig.DEFAULT_FINAL_NAME, HubConfig.DEFAULT_STAGING_NAME, HubConfig.DEFAULT_JOB_NAME);
    }

    @BeforeEach
    public void beforeEach() throws IOException {
        if (!isSetup) {
            installProject();
            isSetup = true;
        }
        getDataHub().clearDatabase(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        getDataHub().clearDatabase(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME);
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        runAsDataHubDeveloper();
        installHubArtifacts(adminHubConfig, true);
        installUserModules(adminHubConfig, true);

        runAsDataHubOperator();
    }


    private void installProject() throws IOException {
        Installer.loadTestModules(getHubConfig());
        String[] directoriesToCopy = new String[]{"input", "flows", "step-definitions", "entities", "mappings"};
        for (final String subDirectory : directoriesToCopy) {
            final Path subProjectPath = projectPath.resolve(subDirectory);
            subProjectPath.toFile().mkdirs();
            Path subResourcePath = Paths.get("master-test", subDirectory);
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
                Path projectFilePath = projectPath.resolve(childFile.getName());
                if (!projectFilePath.toFile().exists()) {
                    InputStream inputStream = getResourceStream(resourcePath.resolve(childFile.getName()).toString().replaceAll("\\\\", "/"));
                    Files.copy(inputStream, projectFilePath);
                    IOUtils.closeQuietly(inputStream);
                }
            }
        }
    }

    @Test
    public void testMatchEndpoint() {
        flowRunner.runFlow(new FlowInputs("myNewFlow", "1","2"));
        flowRunner.awaitCompletion();
        JsonNode matchResp = masteringManager.match("/person-1.json", "myNewFlow","3", Boolean.TRUE, new ObjectMapper().createObjectNode()).get("results");
        assertEquals(7, matchResp.get("total").asInt(),"There should 7 match results");
        assertEquals(7, matchResp.get("result").size(),"There should 7 match results");
    }

    @Test
    public void testMasterStep() {
        RunFlowResponse flowResponse = flowRunner.runFlow(new FlowInputs("myNewFlow", "1","2","3"));
        flowRunner.awaitCompletion();
        RunStepResponse masterJob = flowResponse.getStepResponses().get("3");
        assertTrue(masterJob.isSuccess(), "Mastering job failed!");
        assertTrue(getFinalDocCount("sm-person-merged") >= 10,"At least 10 merges occur");
        assertTrue(getFinalDocCount("master") > 0, "Documents didn't receive master collection");

        // This occasionally fails both locally and in Jenkins with a result of 205. 208 was the original expected value.
        // More than half of the time, 208 will be the result. So the test seems to verify a mastering step, and the fact
        // that it fails sometimes is being ignored enough that there's no value in having Jenkins test runs fail solely
        // because this returns 205 instead of 208. The ideal solution is likely to narrow down the set of documents
        // that are expected to be merged together, as it's very difficult right now to know why only 205 are in the
        // collection and which 3 are "missing".
        int masteredCount = getFinalDocCount("sm-person-mastered");
        assertTrue(masteredCount >= 205, "Expecting at least 205 documents to be in the 'sm-person-mastered' collection, but only found: "+ masteredCount);

        // Setting this to 40 or greater as occasionally we get 41 in the pipeline. See bug https://project.marklogic.com/jira/browse/DHFPROD-3178
        assertTrue(getFinalDocCount("sm-person-notification") >= 40, "Not enough notifications are created");
        // Check for JobReport for mastering with correct count
        String reportQueryText = "cts:and-query((" +
            "cts:collection-query('JobReport')," +
            "cts:json-property-value-query('jobID', '"+ masterJob.getJobId() +"')," +
            "cts:json-property-value-query('count', " + masteredCount + ")" +
            "))";
        assertTrue(existsByQuery(reportQueryText, HubConfig.DEFAULT_JOB_NAME), "Missing valid mastering job report!");
        testUnmerge();
    }

    @Test
    public void testMatchMergeSteps() {
        RunFlowResponse flowResponse = flowRunner.runFlow(new FlowInputs("myMatchMergeFlow", "1","2","3"));
        flowRunner.awaitCompletion();
        RunStepResponse matchJob = flowResponse.getStepResponses().get("3");
        assertTrue(matchJob.isSuccess(), "Matching job failed!");
        assertEquals(3, getFinalDocCount("datahubMasteringMatchSummary"), "3 match summaries should be created!");
        // Check for datahubMasteringMatchSummary for matching with correct count
        String summaryQueryText = "cts:and-query((" +
            "cts:collection-query('datahubMasteringMatchSummary')," +
            "cts:json-property-value-query('URIsToProcess', '/person-41.json')" +
            "))";
        assertTrue(existsByQuery(summaryQueryText, HubConfig.DEFAULT_FINAL_NAME), "Missing valid matching summary document!");

        RunFlowResponse flowMergeResponse = flowRunner.runFlow(new FlowInputs("myMatchMergeFlow", "4"));
        flowRunner.awaitCompletion();
        RunStepResponse mergeJob = flowMergeResponse.getStepResponses().get("4");
        assertTrue(mergeJob.isSuccess(), "Merging job failed!");
        assertTrue(getFinalDocCount("sm-person-merged") >= 10,"At least 10 merges occur");
        assertEquals(209, getFinalDocCount("sm-person-mastered"), "We end with the correct amount of final docs");
        // Setting this to 40 or greater as occasionally we get 41 in the pipeline. See bug https://project.marklogic.com/jira/browse/DHFPROD-3178
        assertTrue(getFinalDocCount("sm-person-notification") >= 40, "Not enough notifications are created");
        // Check for JobReport for mastering with correct count
        String reportQueryText = "cts:and-query((" +
            "cts:collection-query('JobReport')," +
            "cts:json-property-value-query('jobID', '"+ mergeJob.getJobId() +"')," +
            "cts:json-property-value-query('count', 10)" +
            "))";
        assertTrue(existsByQuery(reportQueryText, HubConfig.DEFAULT_JOB_NAME), "Missing valid merging job report!");
    }

    @Test
    public void testManualMerge() {
        flowRunner.runFlow(new FlowInputs("myNewFlow","1","2"));
        flowRunner.awaitCompletion();
        List<String> docsToMerge = Arrays.asList("/person-1.json","/person-1-1.json","/person-1-2.json","/person-1-3.json");
        JsonNode mergeResults = masteringManager.merge(docsToMerge, "myNewFlow","3", Boolean.FALSE, new ObjectMapper().createObjectNode());
        assertEquals(1, getFinalDocCount("sm-person-merged"),"One merge should have occurred");
        assertEquals(1, getFinalDocCount("sm-person-auditing"),"One auditing document should have been created");
        assertEquals(docsToMerge.size(), getFinalDocCount("sm-person-archived"),docsToMerge.size() + " documents should have been archived");
        assertTrue(mergeResults.path("mergedDocument").path("value").path("envelope").has("instance"), "Resulting document should have the merged document instance");
        StringHandle mergedUriHandle = new StringHandle();
        runInDatabase("xdmp:node-uri(fn:head(fn:collection('sm-person-merged')))", HubConfig.DEFAULT_FINAL_NAME, mergedUriHandle);
        String mergedUri = mergedUriHandle.get();
        testDocumentHistory(mergedUri, docsToMerge);
    }

    private void testDocumentHistory(String mergedUri, List<String> docsInMerge) {
        JsonNode documentHistory = masteringManager.documentHistory(mergedUri);
        JsonNode activityInformation = documentHistory.path("activities").path(0);
        List<String> derivedFrom = new ArrayList<>();
        activityInformation.path("wasDerivedFromUris").elements().forEachRemaining((uriTextNode) -> {
            derivedFrom.add(uriTextNode.asText());
        });
        for (String docInMerge: docsInMerge) {
            assertTrue(derivedFrom.contains(docInMerge), "Document history should contain every document in merge. Missing: " + docInMerge);
        }
    }

    private void testUnmerge() {
        String singleMergedURI = getUriByQuery("cts:and-query((cts:collection-query('sm-person-merged'),cts:collection-query('sm-person-mastered')))", HubConfig.DEFAULT_FINAL_NAME);
        String queryText = "cts:and-query((" +
            "cts:collection-query('sm-person-merged')," +
            "cts:collection-query('sm-person-mastered')," +
            "cts:document-query('" + singleMergedURI + "')" +
            "))";
        assertTrue(existsByQuery(queryText, HubConfig.DEFAULT_FINAL_NAME), "Merged doc doesn't have the expected collections");
        int auditingCountPreUnmerge = getFinalDocCount("sm-person-auditing");
        JsonNode unmergeResp = masteringManager.unmerge(singleMergedURI, Boolean.TRUE, Boolean.TRUE);
        assertFalse(existsByQuery(queryText, HubConfig.DEFAULT_FINAL_NAME), "Document didn't get unmerged: " + unmergeResp.toString());
        List<String> documentsRestoredIRIs = new LinkedList<>();
        ((ArrayNode) unmergeResp.get("documentsRestored")).elements().forEachRemaining((node) -> {
            documentsRestoredIRIs.add("sem:iri('" + node.asText() + "')");
        });
        int auditingCountPostUnmerge = getFinalDocCount("sm-person-auditing");
        // 4 documents are merged together, so auditing document exist for each rollback
        assertEquals(auditingCountPreUnmerge + documentsRestoredIRIs.size(), auditingCountPostUnmerge,"One more auditing document should have been created after unmerge");
        String documentsRestoredIRIsSequence = "(" + String.join(",", documentsRestoredIRIs) + ")";
        String blockedMatchesQueryText = "cts:triple-range-query(" +
            documentsRestoredIRIsSequence + "," +
            "sem:iri('http://marklogic.com/smart-mastering/match-block')," +
            documentsRestoredIRIsSequence + "," +
            "'=')";
        assertTrue(existsByQuery(blockedMatchesQueryText, HubConfig.DEFAULT_FINAL_NAME), "Unmerge should block future matches");
    }

    private String getUriByQuery(String query, String database) {
        String uri = null;
        EvalResultIterator resultItr = runInDatabase("cts:uris((),('limit=1')," + query + ")", database);
        if (resultItr == null || ! resultItr.hasNext()) {
            return uri;
        }
        EvalResult res = resultItr.next();
        uri = res.getString();
        return uri;
    }

    private Boolean existsByQuery(String query, String database) {
        Boolean exists = Boolean.FALSE;
        EvalResultIterator resultItr = runInDatabase("xdmp:exists(cts:search(fn:doc()," + query + "))", database);
        if (resultItr == null || ! resultItr.hasNext()) {
            return exists;
        }
        EvalResult res = resultItr.next();
        exists = res.getBoolean();
        return exists;
    }
}
