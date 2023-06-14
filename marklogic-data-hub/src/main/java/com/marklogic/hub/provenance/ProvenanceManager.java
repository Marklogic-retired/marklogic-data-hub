package com.marklogic.hub.provenance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.dataservices.ExecCaller;
import com.marklogic.client.dataservices.IOEndpoint;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubClient;
import com.marklogic.hub.dataservices.BulkUtil;

public class ProvenanceManager {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    private final HubClient hubClient;

    public ProvenanceManager(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    public void deleteProvenanceRecords(String retainDuration) {
        deleteProvenanceRecords(retainDuration, DatabaseKind.JOB.name());
    }

    public void deleteProvenanceRecords(String retainDuration, String database) {
        String apiPath = "ml-modules/root/data-hub/data-services/provenance/deleteProvenance.api";
        DatabaseKind databaseKind = DatabaseKind.valueOf(database);
        DatabaseClient client;
        switch (databaseKind) {
            case JOB: client = hubClient.getJobsClient();
                break;
            case STAGING: client = hubClient.getStagingClient();
                break;
            case FINAL: client = hubClient.getFinalClient();
                break;
            default: throw new RuntimeException("Invalid provenance database: " + database);
        }
        BulkUtil.deleteData(client, apiPath, retainDuration);
    }

    public void migrateProvenanceRecords() {
        String apiPath = "ml-modules/root/data-hub/data-services/provenance/migrateProvenance.api";
        ObjectNode endpointConstants = objectMapper.createObjectNode().put("batchSize", 250);
        ExecCaller.BulkExecCaller bulkExecCaller = BulkUtil.createExecCaller(hubClient.getJobsClient(), apiPath, endpointConstants, objectMapper.createObjectNode(), 4);
        CapturingErrorListener errorListener = new CapturingErrorListener();
        bulkExecCaller.setErrorListener(errorListener);
        bulkExecCaller.awaitCompletion();
        if (errorListener.throwable != null) {
            throw new RuntimeException("Unable to migrate provenance data. Cause: ", errorListener.throwable);
        }
    }

    static class CapturingErrorListener implements ExecCaller.BulkExecCaller.ErrorListener {
        Throwable throwable;
        public IOEndpoint.BulkIOEndpointCaller.ErrorDisposition processError(int retryCount, Throwable throwable,
                                                                             IOEndpoint.CallContext callContext) {
            this.throwable = throwable;
            return IOEndpoint.BulkIOEndpointCaller.ErrorDisposition.STOP_ALL_CALLS;
        }
    }
}
