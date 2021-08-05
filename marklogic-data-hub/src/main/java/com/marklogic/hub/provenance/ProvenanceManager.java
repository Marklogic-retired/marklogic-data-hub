package com.marklogic.hub.provenance;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
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
        String apiPath = "ml-modules/root/data-hub/5/data-services/provenance/deleteProvenance.api";
        DatabaseKind databaseKind = DatabaseKind.valueOf(database);
        DatabaseClient client = null;
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
        String apiPath = "ml-modules/root/data-hub/5/data-services/provenance/migrateProvenance.api";
        ObjectNode endpointConstants = objectMapper.createObjectNode().put("batchSize", 250);
        BulkUtil.runExecCaller(hubClient.getJobsClient(), apiPath, endpointConstants, "Unable to migrate provenance, cause: ");
    }
}
