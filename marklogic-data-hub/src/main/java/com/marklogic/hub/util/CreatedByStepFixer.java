package com.marklogic.hub.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.datamovement.DataMovementManager;
import com.marklogic.client.datamovement.QueryBatcher;
import com.marklogic.client.dataservices.ExecEndpoint;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.marker.JSONWriteHandle;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import org.apache.commons.lang3.tuple.Pair;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Bulk API-based program for fixed the datahubCreatedByStep metadata value so that, when possible, it is a step name
 * instead of a step definition name. We may have programs like this in the future that deserve a better home than
 * "util", but util will do for now.
 */
public class CreatedByStepFixer extends LoggingObject {

    private HubClient hubClient;

    // Affects the number of URIs processed by each call to the DS endpoint
    private int batchSize = 50;
    // This will be either set via the client, or will default to the number of forests
    private int threadCount = 0;

    public CreatedByStepFixer(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    public void fixInDatabase(String databaseName) {
        runFixScript(determineClient(databaseName));
    }

    /**
     * @param databaseName
     * @return Long is the number of documents to fix, and String is the URI of one such document, if any exist
     */
    public Pair<Long, String> previewFixingDocuments(String databaseName) {
        DatabaseClient client = determineClient(databaseName);
        String script = "const stepDefinitionNames = fn.collection('http://marklogic.com/data-hub/step-definition')\n" +
            "  .toArray().map(stepDef => stepDef.toObject().name);\n" +
            "cts.estimate(cts.fieldValueQuery('datahubCreatedByStep', stepDefinitionNames))";
        long count = Long.parseLong(client.newServerEval().javascript(script).evalAs(String.class));
        if (count == 0) {
            return Pair.of(0l, null);
        }

        script = "const stepDefinitionNames = fn.collection('http://marklogic.com/data-hub/step-definition')\n" +
            "  .toArray().map(stepDef => stepDef.toObject().name);\n" +
            "fn.head(cts.uris(null, ['limit=1'], cts.fieldValueQuery('datahubCreatedByStep', stepDefinitionNames)))";
        String uri = client.newServerEval().javascript(script).evalAs(String.class);
        return Pair.of(count, uri);
    }

    private DatabaseClient determineClient(String databaseName) {
        if (hubClient.getDbName(DatabaseKind.FINAL).equalsIgnoreCase(databaseName)) {
            return hubClient.getFinalClient();
        } else if (hubClient.getDbName(DatabaseKind.STAGING).equalsIgnoreCase(databaseName)) {
            return hubClient.getStagingClient();
        } else {
            throw new IllegalArgumentException("Database name does not correspond to staging or final database: " + databaseName);
        }
    }

    /**
     * Uses a QueryBatcher for concurrency, operating on the list of forest IDs that DMSDK gathers. A Bulk endpoint is
     * then used to process the documents in each forest.
     *
     * @param contentClient
     */
    private void runFixScript(DatabaseClient contentClient) {
        DataMovementManager dmm = contentClient.newDataMovementManager();
        final List<String> forestIds = new ArrayList<>();
        Arrays.stream(dmm.readForestConfig().listForests()).iterator().forEachRemaining(forest -> forestIds.add(forest.getForestId()));

        final JSONWriteHandle bulkApi = hubClient.getModulesClient().newJSONDocumentManager().read("/data-hub/5/data-services/bulk/fixCreatedByStep.api", new JacksonHandle());
        final ObjectMapper mapper = new ObjectMapper();

        int queryBatcherThreadCount = threadCount > 0 ? threadCount : forestIds.size();

        QueryBatcher queryBatcher = dmm.newQueryBatcher(forestIds.iterator())
            .withBatchSize(1)
            .withThreadCount(queryBatcherThreadCount)
            .onUrisReady(batch -> {
                if (batch.getItems() != null && batch.getItems().length > 0) {
                    ExecEndpoint.BulkExecCaller bulkCaller = ExecEndpoint.on(contentClient, bulkApi).bulkCaller();

                    ObjectNode workUnit = mapper.createObjectNode();
                    workUnit.put("forestId", batch.getItems()[0]);
                    workUnit.put("batchSize", batchSize);

                    bulkCaller.setWorkUnit(new JacksonHandle(workUnit));
                    bulkCaller.setEndpointState(new JacksonHandle(mapper.createObjectNode()));
                    bulkCaller.awaitCompletion();
                }
            })
            .onQueryFailure(failure -> {
                logger.error("Error occurred while processing documents for a forest: " + failure.getMessage(), failure);
            });

        dmm.startJob(queryBatcher);
        queryBatcher.awaitCompletion();
        dmm.stopJob(queryBatcher);
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    public void setThreadCount(int threadCount) {
        this.threadCount = threadCount;
    }
}
