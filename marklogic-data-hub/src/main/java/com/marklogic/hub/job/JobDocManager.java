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
import org.apache.commons.lang3.StringUtils;

import java.util.List;

public class JobDocManager extends ResourceManager {
    private static final String NAME = "mlJobs";

    public JobDocManager(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public void updateJobStatus(String jobId, JobStatus status) {
        RequestParameters params = new RequestParameters();
        params.add("jobid", jobId);
        params.add("status", status.toString());
        getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
    }

    //Called when step execution starts/ completes
    public JsonNode postJobs(String jobId, String status, String step, String lastCompleted, RunStepResponse stepResponse) {
        RequestParameters params = new RequestParameters();
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
            resultItr = this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        } catch (Exception e) {
            throw new RuntimeException("Unable to update the job document; cause: " + e.getMessage(), e);
        }
        if (resultItr == null || !resultItr.hasNext()) {
            return null;
        }
        ResourceServices.ServiceResult res = resultItr.next();
        return res.getContent(new JacksonHandle()).get();
    }

    public void createJob(String jobId, String flow) {
        RequestParameters params = new RequestParameters();
        params.put("jobid", jobId);
        params.put("flow-name", flow);
        try {
            this.getServices().post(params, new StringHandle("{}").withFormat(Format.JSON));
        } catch (Exception e) {
            throw new RuntimeException("Unable to create the job document");
        }
    }

    public JsonNode getJobDocument(String jobId) {
        return getJobDocument(jobId, null);
    }

    public JsonNode getJobDocument(String jobId, String flowName) {
        RequestParameters params = new RequestParameters();
        if (StringUtils.isNotEmpty(flowName)) {
            params.add("flow-name", flowName);
        }
        if (StringUtils.isNotEmpty(jobId)) {
            params.add("jobid", jobId);
        }
        return getJobDocuments(params);
    }

    public JsonNode getJobDocs(JobStatus status) {
        RequestParameters params = new RequestParameters();
        params.add("status", status.toString());
        return getJobDocuments(params);
    }

    public JsonNode getJobDocumentsForFlow(String flowName) {
        RequestParameters params = new RequestParameters();
        params.add("flow-name", flowName);
        return getJobDocuments(params);
    }

    public JsonNode getJobDocumentsForFlows(List<String> flowNames) {
        RequestParameters params = new RequestParameters();
        params.put("flowNames", flowNames.toArray(new String[]{}));
        return getJobDocuments(params);
    }

    /**
     * Per DHFPROD-2842, the jobs endpoint no longer throws an error when no job documents are found. This was both
     * causing a stacktrace to be dumped to the jobs app server log - suggesting an error when there really wasn't one -
     * and forcing the middle tier to do a try/catch when it asked for a job document. This occurred every time a flow
     * is run by QuickStart, as it checks to see if a job document exists before creating one.
     *
     * @param params
     * @return
     */
    private JsonNode getJobDocuments(RequestParameters params) {
        ResourceServices.ServiceResultIterator iter = this.getServices().get(params);
        if (iter == null || !iter.hasNext()) {
            return null;
        }
        return iter.next().getContent(new JacksonHandle()).get();
    }
}
