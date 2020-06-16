/*
 * Copyright (c) 2020 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.job.JobDocManager;
import io.swagger.annotations.ApiModelProperty;
import io.swagger.annotations.ApiOperation;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

@Controller
@RequestMapping(value = "/api/jobs")
public class JobsController extends BaseController {

    @RequestMapping(value = "/{jobId}", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get the Job document associated with the given ID", response = Job.class)
    public JsonNode getJob(@PathVariable String jobId) {
        JsonNode jobsObj = getJobs(getJobDocManager(), jobId, null);
        return flattenJobsJson(jobsObj);
    }

    private JsonNode getJobs(JobDocManager jobDocManager, String jobId, String flowName) {
        JsonNode jobsJson = jobDocManager.getJobDocument(jobId, flowName);
        if (jobsJson == null) {
            throw new RuntimeException("Unable to get job document");
        }
        return flattenJobsJson(jobsJson);
    }

    private JobDocManager getJobDocManager() {
        return new JobDocManager(getHubClient().getJobsClient());
    }

    private JsonNode flattenJobsJson(JsonNode jobJSON) {
        if (jobJSON.isArray()) {
            ArrayNode array = new ObjectMapper().createArrayNode();
            jobJSON.elements().forEachRemaining((json) -> {
                array.add(flattenJobsJson(json));
            });
            return array;
        } else if (jobJSON.has("job")) {
            return jobJSON.get("job");
        } else {
            return jobJSON;
        }
    }

    public static class Job {
        public String jobId;
        public String flowId;
        public String startTime;
        public String endTime;
        public Map<String, Object> steps;
        public String user;
        @ApiModelProperty("Name of the flow being processed")
        public String flow;
        @ApiModelProperty("ID of Entity Type related to the Job")
        public String targetEntityType;
        public Integer lastAttemptedStep;
        public Integer lastCompletedStep;
        public String status;
        public Integer successfulEvents;
        public Integer failedEvents;
    }
}
