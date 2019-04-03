package com.marklogic.hub.web.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;

public class FlowJobsService extends ResourceManager {
    private static final String ML_JOBS_NAME = "ml:jobs";
    private static final String ML_BATCH_JOBS_NAME = "ml:batches";

    private DatabaseClient client;

    public static class JobInfo {
        public List<Object> jobs;
        public Map<String, EventCounters> counterByJobId;

        public JobInfo(List<Object> jobs, Map<String, EventCounters> counterByJobId) {
            this.jobs = jobs;
            this.counterByJobId = counterByJobId;
        }
    }

    public static class EventCounters {
        public long successfulEvents;
        public long failedEvents;

        public EventCounters(long successfulEvents, long failedEvents) {
            this.successfulEvents = successfulEvents;
            this.failedEvents = failedEvents;
        }
    }

    public FlowJobsService(DatabaseClient client) {
        super();
        this.client = client;
    }

    public JobInfo getJobs(String flowName) {
        client.init(ML_JOBS_NAME, this);
        JobInfo jobInfo = null;
        RequestParameters params = new RequestParameters();
        if (StringUtils.isNotEmpty(flowName)){
            params.add("flow-name", flowName);
        }

        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            throw new RuntimeException("Unable to get job document");
        }
        ResourceServices.ServiceResult res = resultItr.next();
        JsonNode jsonNode = res.getContent(new JacksonHandle()).get();

        List<Object> jobs = new ArrayList<>();
        Map<String, EventCounters> counterByJobId = new HashMap<>();
        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                jobs.add(e.get("job"));
                String jobId = e.get("job").get("jobId").textValue();
                counterByJobId.put(jobId, getBatchJobs(jobId));
            });
            jobInfo = new JobInfo(jobs, counterByJobId);
        }
        return jobInfo;
    }

    public EventCounters getBatchJobs(String jobId) {
        client.init(ML_BATCH_JOBS_NAME, this);
        RequestParameters params = new RequestParameters();
        params.add("jobid", jobId);

        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
        if (resultItr == null || ! resultItr.hasNext()) {
            throw new RuntimeException("Unable to get batch document");
        }
        ResourceServices.ServiceResult res = resultItr.next();
        JsonNode jsonNode = res.getContent(new JacksonHandle()).get();
        final long[] totalSuccess = {0};
        final long[] totalFail = {0};

        if (jsonNode.isArray()) {
            jsonNode.forEach(e -> {
                JsonNode batchNode = e.get("batch");
                totalSuccess[0] += batchNode.get("successfulEvents").asLong(0);
                totalFail[0] += batchNode.get("failedEvents").asLong(0);
            });
        }
        return new EventCounters(totalSuccess[0], totalFail[0]);
    }

    public void release() {
        this.client.release();
    }
}
