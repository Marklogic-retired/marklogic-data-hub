package com.marklogic.hub.flow;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.hub.AbstractHubCoreTest;
import com.marklogic.hub.DatabaseKind;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class IngestToJobsTest extends AbstractHubCoreTest {
    final String docUri = "/customers/customer1.json";
    /**
     * This is a test cover the scenario of ingesting to a database that isn't a Data Hub content DB (e.g., STAGING or FINAL).
     * We use JOBS, since it is a database we know must exist.
     */
    @Test
    void ingestToJobs() throws JsonProcessingException {
        final String flowName = "ingestToFinal";

        removeJobsDocument();
        installReferenceModelProject();

        copyArtifactsToJobs();

        makeInputFilePathsAbsoluteInFlow(flowName);
        FlowInputs flowInputs = new FlowInputs(flowName).withSteps("1");
        // Using runtime options, change the target DB to JOBS
        Map<String,Object> options = new HashMap<>();
        flowInputs.withOption("targetDatabase", getHubConfig().getDbName(DatabaseKind.JOB));
        RunFlowResponse runFlowResponse = runFlow(flowInputs);
        assertEquals("finished", runFlowResponse.getJobStatus());
        JsonNode rawDoc = getHubClient().getJobsClient().newJSONDocumentManager().read(docUri, new JacksonHandle()).get();
        assertEquals("1", rawDoc.get("envelope").get("instance").get("CustomerID").asText(),
                "Verifying that the single doc was ingested into the jobs database");
    }

    private void copyArtifactsToJobs() {
        retryIfNecessary(() -> {
            getClientByName(getHubClient().getDbName(DatabaseKind.JOB)).newServerEval().addVariable("source-db", getHubClient().getDbName(DatabaseKind.FINAL)).xquery(
                    "declare variable $source-db external;\n" +
                            "for $collection in ('http://marklogic.com/data-hub/flow','http://marklogic.com/data-hub/step-definition')" +
                            "let $artifacts := xdmp:invoke-function(function() {\n" +
                            "       map:new(\n" +
                            "           fn:collection($collection) ! (map:entry(xdmp:node-uri(.), .))\n" +
                            "       )\n" +
                            "   }, map:entry('database', xdmp:database($source-db)))\n" +
                            "for $uri in map:keys($artifacts)\n" +
                            "return xdmp:document-insert($uri, map:get($artifacts, $uri), map:entry('collections', $collection))"
            ).eval();
        });
    }

    private void removeJobsDocument() {
        try {
            getClientByName(DatabaseKind.getName(DatabaseKind.JOB)).newDocumentManager().delete(docUri);
        } catch (Exception e) {
            // ignoring exception, since the document may not exist
        }
    }
}