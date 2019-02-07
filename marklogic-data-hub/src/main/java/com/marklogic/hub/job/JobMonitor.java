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

package com.marklogic.hub.job;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.HubConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

@Component
public class JobMonitor extends ResourceManager{
    private static final String NAME = "ml:jobStatus";
    private DatabaseClient client;
    @Autowired
    private HubConfig hubConfig;

    public JobMonitor() {
        super();
    }

    public void setupClient() {
        this.client = hubConfig.newJobDbClient();
        client.init(NAME, this);
    }

    public Map<String, String> getCurrentJobs() {
        return run(null, null, JobStatus.RUNNING, null, new TypeReference<Map<String, String>>(){});
    }

    public String getJobStatus(String jobId) {
        Map<String, String> res = run(jobId, null, null, null, new TypeReference<Map<String, String>>(){});
        if (res == null) {
            return null;
        }
        return res.values().stream().findFirst().get();
    }

    public String getBatchStatus(String jobId, String batchId, String step) {
        Map<String, String> res = run(jobId, batchId, null, step, new TypeReference<Map<String, String>>(){});
        if (res == null) {
            return null;
        }
        return res.values().stream().findFirst().get();
    }

    public List<String> getBatchResponse(String jobId, String batchId) {
        Map<String, List<String>> res = run(jobId, batchId,null , null, new TypeReference<Map<String, List<String>>>(){});
        return res.values().stream().findFirst().get();
    }

    public Map<String, String> getNextStep(String jobId) {
        return null;
    }


    private <K,V> Map<K, V> run(String jobId, String batchId, JobStatus status, String step, TypeReference<Map<K,V>> type) {
        Map<K, V> resp;

        RequestParameters params = new RequestParameters();
        if(jobId != null) {
            params.add("jobid", jobId);
        }
        if(batchId != null) {
            params.add("batchid", batchId);
        }
        if(status != null) {
            params.add("status", status.toString());

        }
        if(step != null) {
            params.add("step", step);
        }

        ResourceServices.ServiceResultIterator resultItr = this.getServices().get(params);
        try {
            if (resultItr == null || !resultItr.hasNext()) {
                return null;
            }
            else {
                ResourceServices.ServiceResult res = resultItr.next();
                StringHandle handle = new StringHandle();
                ObjectMapper objectMapper = new ObjectMapper();
                resp = objectMapper.readValue(res.getContent(handle).get(), type);
            }
        }
        catch(Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
        finally {
            if (resultItr != null) {
                resultItr.close();
            }
        }
        return resp;

    }
}
