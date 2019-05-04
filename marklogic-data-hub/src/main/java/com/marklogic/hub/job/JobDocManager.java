package com.marklogic.hub.job;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.step.RunStepResponse;
import com.marklogic.hub.util.json.JSONObject;

public class JobDocManager extends ResourceManager {
    private static final String NAME = "ml:jobs";

    private RequestParameters params;

    public JobDocManager(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    //Update job status
    public JsonNode postJobs(String jobId, String status) {
        params = new RequestParameters();
        params.put("jobid", jobId);
        params.put("status", status);
        ResourceServices.ServiceResultIterator resultItr = null;
        try {
            resultItr =  this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to update the job document");
        }
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }

    //Called when step execution starts/ completes
    public JsonNode postJobs(String jobId, String status, String step, String lastCompleted, RunStepResponse stepResponse) {
        params = new RequestParameters();
        params.put("jobid", jobId);
        params.put("status", status);
        params.put("step", step);
        params.put("lastCompleted", lastCompleted);
        try {
            params.put("stepResponse", JSONObject.writeValueAsString(stepResponse));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        ResourceServices.ServiceResultIterator resultItr = null;
        try {
            resultItr =  this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to update the job document");
        }
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }

    public void createJob(String jobId, String flow) {
        params = new RequestParameters();
        params.put("jobid", jobId);
        params.put("flow-name", flow);
        try {
            this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to create the job document");
        }
    }

    public JsonNode getJobs(String jobId) {
        params = new RequestParameters();
        params.put("jobid", jobId);

        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }
}
