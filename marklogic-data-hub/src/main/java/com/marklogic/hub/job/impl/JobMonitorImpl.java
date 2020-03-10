/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.marklogic.hub.job.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.ObjectReader;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.job.JobMonitor;
import com.marklogic.hub.job.JobStatus;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JobMonitorImpl implements JobMonitor {

    private JobDocManager jobDocManager;
    private Batches batches;

    public JobMonitorImpl(DatabaseClient client) {
        this.jobDocManager = new JobDocManager(client);
        this.batches = new Batches(client);
    }

    //obtain the currently running  jobs on the cluster
    public Map<String, String> getCurrentJobs() {
        JsonNode runningJobs = jobDocManager.getJobDocs(JobStatus.RUNNING);
        if (runningJobs == null) {
            throw new RuntimeException("Unable to get job document");
        }
        Map<String, String> jobs = new HashMap<>();
        if (runningJobs.isArray()) {
            for (final JsonNode objNode : runningJobs) {
                JsonNode jobdoc = objNode.get("job");
                jobs.put(jobdoc.get("jobId").textValue(), jobdoc.get("flow").textValue());
            }
        }
        return jobs;
    }

    //obtain the status of any jobID
    public String getJobStatus(String jobId) {
        JsonNode job = jobDocManager.getJobDocument(jobId);
        if (job == null) {
            throw new RuntimeException("Unable to get job document");
        }
        String status = null;
        if (job.get("job") != null) {
            status = job.get("job").get("jobStatus").textValue();
        }
        return status;
    }


    //status of all batches in a step within a jobID
    public Map<String, String> getStepBatchStatus(String jobId, String step) {
        JsonNode batch = batches.getBatches(jobId, step, null);
        Map<String, String> status = new HashMap<>();
        if (batch.isArray()) {
            for (final JsonNode objNode : batch) {
                status.put(objNode.get("batch").get("batchId").textValue(), objNode.get("batch").get("batchStatus").textValue());
            }
        }
        return status;
    }

    //status of a single batch
    public String getBatchStatus(String jobId, String batchId) {
        JsonNode batch = batches.getBatches(jobId, null, batchId);
        String status = null;
        if (batch.get("batch") != null) {
            status = batch.get("batch").get("batchStatus").textValue();
        }
        return status;
    }

    //response of a single batch
    public List<String> getBatchResponse(String jobId, String batchId) {
        JsonNode batch = batches.getBatches(jobId, null, batchId);
        ObjectMapper mapper = new ObjectMapper();
        ObjectReader reader = mapper.readerFor(new TypeReference<List<String>>() {
        });
        if (batch.get("batch") != null) {
            try {
                return reader.readValue(batch.get("batch").get("uris"));
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

        }
        return null;
    }

    public class Batches extends ResourceManager {
        private static final String NAME = "mlBatches";

        private RequestParameters params;

        public Batches(DatabaseClient client) {
            super();
            client.init(NAME, this);
        }

        private JsonNode getBatches(String jobId, String step, String batchId) {
            params = new RequestParameters();
            if (jobId == null) {
                throw new RuntimeException("Cannot get batches without jobId");
            }
            params.add("jobid", jobId);
            if (batchId != null) {
                params.add("batchid", batchId);
            }
            if (step != null) {
                params.add("step", step);
            }

            ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
            if (resultItr == null || !resultItr.hasNext()) {
                throw new RuntimeException("Unable to get batch document");
            }
            ResourceServices.ServiceResult res = resultItr.next();
            return res.getContent(new JacksonHandle()).get();
        }

    }
}
