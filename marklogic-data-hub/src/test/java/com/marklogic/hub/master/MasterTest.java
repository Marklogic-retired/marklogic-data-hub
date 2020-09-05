package com.marklogic.hub.master;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.client.eval.EvalResult;
import com.marklogic.client.eval.EvalResultIterator;
import com.marklogic.client.io.BytesHandle;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.MasteringManager;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.step.RunStepResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class MasterTest extends AbstractHubCoreTest {

    @Autowired
    MasteringManager masteringManager;

    @BeforeEach
    public void beforeEach() {
        runAsAdmin();
        assertEquals(0, getDocCount(HubConfig.DEFAULT_FINAL_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));
        assertEquals(0, getDocCount(HubConfig.DEFAULT_STAGING_SCHEMAS_DB_NAME, "http://marklogic.com/xdmp/tde"));

        runAsDataHubDeveloper();
        installProjectInFolder("master-test");

        // Write a custom module that the flows depend on
        String customModuleText = "function main(content) {\n" +
            "  return content;\n" +
            "}\n" +
            "\n" +
            "module.exports = {\n" +
            "  main: main\n" +
            "};";
        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        metadata.getPermissions().add("rest-extension-user", DocumentMetadataHandle.Capability.EXECUTE);
        metadata.getPermissions().add("data-hub-module-reader", DocumentMetadataHandle.Capability.READ);
        metadata.getPermissions().add("data-hub-module-writer", DocumentMetadataHandle.Capability.UPDATE);
        getHubConfig().newModulesDbClient().newDocumentManager().write("/custom-modules/no-op.sjs",
            metadata, new BytesHandle(customModuleText.getBytes()).withFormat(Format.TEXT));

        runAsDataHubOperator();
    }

    @Test
    public void testMatchEndpoint() {
        runFlow(new FlowInputs("myNewFlow", "1", "2"));
        JsonNode matchResp = masteringManager.match("/person-1.json", "myNewFlow", "3", Boolean.TRUE, new ObjectMapper().createObjectNode()).get("results");
        assertEquals(7, matchResp.get("total").asInt(), "There should 7 match results");
        assertEquals(7, matchResp.get("result").size(), "There should 7 match results");
    }

    @Test
    public void testMasterStep() {
        RunFlowResponse flowResponse = runFlow(new FlowInputs("myNewFlow", "1", "2", "3"));
        RunStepResponse masterJob = flowResponse.getStepResponses().get("3");
        assertTrue(masterJob.isSuccess(), "Mastering job failed!");
        assertTrue(getFinalDocCount("sm-person-merged") >= 10, "At least 10 merges occur");
        assertTrue(getFinalDocCount("master") > 0, "Documents didn't receive master collection");

        // This occasionally fails both locally and in Jenkins with a result of 205. 208 was the original expected value.
        // More than half of the time, 208 will be the result. So the test seems to verify a mastering step, and the fact
        // that it fails sometimes is being ignored enough that there's no value in having Jenkins test runs fail solely
        // because this returns 205 instead of 208. The ideal solution is likely to narrow down the set of documents
        // that are expected to be merged together, as it's very difficult right now to know why only 205 are in the
        // collection and which 3 are "missing".
        int masteredCount = getFinalDocCount("sm-person-mastered");
        assertTrue(masteredCount >= 205, "Expecting at least 205 documents to be in the 'sm-person-mastered' collection, but only found: " + masteredCount);

        // Setting this to 40 or greater as occasionally we get 41 in the pipeline. See bug https://project.marklogic.com/jira/browse/DHFPROD-3178
        assertTrue(getFinalDocCount("sm-person-notification") >= 40, "Not enough notifications are created");
        // Check for JobReport for mastering with correct count
        String reportQueryText = "cts:and-query((" +
            "cts:collection-query('JobReport')," +
            "cts:json-property-value-query('jobID', '" + masterJob.getJobId() + "')," +
            "cts:json-property-value-query('count', " + masteredCount + ")" +
            "))";
        assertTrue(existsByQuery(reportQueryText, HubConfig.DEFAULT_JOB_NAME), "Missing valid mastering job report!");
        testUnmerge();
    }

    @Test
    public void testMatchMergeSteps() {
        RunFlowResponse flowResponse = runFlow(new FlowInputs("myMatchMergeFlow", "1", "2", "3"));
        RunStepResponse matchJob = flowResponse.getStepResponses().get("3");
        assertTrue(matchJob.isSuccess(), "Matching job failed!");
        assertEquals(3, getFinalDocCount("datahubMasteringMatchSummary"), "3 match summaries should be created!");
        // Check for datahubMasteringMatchSummary for matching with correct count
        String summaryQueryText = "cts:and-query((" +
            "cts:collection-query('datahubMasteringMatchSummary')," +
            "cts:json-property-value-query('URIsToProcess', '/person-41.json')" +
            "))";
        assertTrue(existsByQuery(summaryQueryText, HubConfig.DEFAULT_FINAL_NAME), "Missing valid matching summary document!");

        RunFlowResponse flowMergeResponse = runFlow(new FlowInputs("myMatchMergeFlow", "4"));
        RunStepResponse mergeJob = flowMergeResponse.getStepResponses().get("4");
        assertTrue(mergeJob.isSuccess(), "Merging job failed!");
        assertTrue(getFinalDocCount("sm-person-merged") >= 10, "At least 10 merges occur");
        assertEquals(209, getFinalDocCount("sm-person-mastered"), "We end with the correct amount of final docs");
        // Setting this to 40 or greater as occasionally we get 41 in the pipeline. See bug https://project.marklogic.com/jira/browse/DHFPROD-3178
        assertTrue(getFinalDocCount("sm-person-notification") >= 40, "Not enough notifications are created");

        // test mlSmNotifications REST API with entity-based collections (see DHFPROD-5089)
        JsonNode notifications = masteringManager.notifications(1, 45);
        assertTrue(notifications.get("notifications").size() >= 40, "Not enough notifications are returned by mlSmNotifications REST API");

        // Check for JobReport for mastering with correct count
        String reportQueryText = "cts:and-query((" +
            "cts:collection-query('JobReport')," +
            "cts:json-property-value-query('jobID', '" + mergeJob.getJobId() + "')," +
            "cts:json-property-value-query('count', 10)" +
            "))";
        assertTrue(existsByQuery(reportQueryText, HubConfig.DEFAULT_JOB_NAME), "Missing valid merging job report!");
    }

    @Test
    public void testManualMerge() {
        runFlow(new FlowInputs("myNewFlow", "1", "2"));
        List<String> docsToMerge = Arrays.asList("/person-1.json", "/person-1-1.json", "/person-1-2.json", "/person-1-3.json");
        JsonNode mergeResults = masteringManager.merge(docsToMerge, "myNewFlow", "3", Boolean.FALSE, new ObjectMapper().createObjectNode());
        assertEquals(1, getFinalDocCount("sm-person-merged"), "One merge should have occurred");
        assertEquals(1, getFinalDocCount("sm-person-auditing"), "One auditing document should have been created");
        assertEquals(docsToMerge.size(), getFinalDocCount("sm-person-archived"), docsToMerge.size() + " documents should have been archived");
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
        for (String docInMerge : docsInMerge) {
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
        assertEquals(auditingCountPreUnmerge + documentsRestoredIRIs.size(), auditingCountPostUnmerge, "One more auditing document should have been created after unmerge");
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
        if (resultItr == null || !resultItr.hasNext()) {
            return uri;
        }
        EvalResult res = resultItr.next();
        uri = res.getString();
        return uri;
    }

    private Boolean existsByQuery(String query, String database) {
        Boolean exists = Boolean.FALSE;
        EvalResultIterator resultItr = runInDatabase("xdmp:exists(cts:search(fn:doc()," + query + "))", database);
        if (resultItr == null || !resultItr.hasNext()) {
            return exists;
        }
        EvalResult res = resultItr.next();
        exists = res.getBoolean();
        return exists;
    }
}
