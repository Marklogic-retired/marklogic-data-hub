package com.marklogic.hub.flow;

import com.marklogic.hub.HubClient;
import com.marklogic.hub.dataservices.BulkUtil;

public class JobManager {

    private final HubClient hubClient;

    public JobManager(HubClient hubClient) {
        this.hubClient = hubClient;
    }

    public void deleteJobs(String retainDuration) {
        String apiPath = "ml-modules/root/data-hub/5/data-services/bulk/deleteJobs.api";
        BulkUtil.deleteData(hubClient.getJobsClient(), apiPath, retainDuration);
    }
}
