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

import java.util.Map;

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

    public void postJobs(String jobId, String status, String step, Map<String, RunStepResponse> stepResponses) {
        params = new RequestParameters();
        params.put("jobid", jobId);
        params.put("status", status);
        params.put("step", step);
        try {
            params.put("stepResponses", JSONObject.writeValueAsString(stepResponses));
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
        try {
            this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to update the job document");
        }
    }

    public void postJobs(String jobId, String status, String step, String lastCompleted) {
        params = new RequestParameters();
        params.put("jobid", jobId);
        params.put("status", status);
        params.put("step", step);
        params.put("lastCompleted", lastCompleted);
        try {
            this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        }
        catch (Exception e) {
            throw new RuntimeException("Unable to update the job document");
        }
    }

    public void postJobs(String jobId, String flow) {
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
