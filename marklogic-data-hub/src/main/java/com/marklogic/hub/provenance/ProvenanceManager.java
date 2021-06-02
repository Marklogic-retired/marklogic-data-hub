package com.marklogic.hub.provenance;

import com.marklogic.hub.HubClient;
import com.marklogic.hub.dataservices.BulkUtil;

public class ProvenanceManager {

    private final HubClient hubClient;

    public ProvenanceManager(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    public void deleteProvenanceRecords(String retainDuration) {
        String apiPath = "ml-modules/root/data-hub/5/data-services/provenance/deleteProvenance.api";
        BulkUtil.deleteData(hubClient.getJobsClient(), apiPath, retainDuration);
    }
}
