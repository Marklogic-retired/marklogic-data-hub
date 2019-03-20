package com.marklogic.hub.job;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;

public class JobUpdate extends ResourceManager {
    private static final String NAME = "ml:jobs";

    private RequestParameters params;

    public JobUpdate(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public void postJobs(String jobId, String status, String step) {
        params = new RequestParameters();
        params.put("jobid", jobId);
        params.put("status", status);
        params.put("step", step);
        try {
            this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to update the job document");
        }

    }
}
