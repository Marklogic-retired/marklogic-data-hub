/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.curation.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.FlowManager;
import com.marklogic.hub.impl.FlowManagerImpl;
import com.marklogic.hub.job.JobDocManager;
import com.marklogic.hub.oneui.managers.MapSearchableManager;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.Collections;
import java.util.List;

@Controller
@RequestMapping(value="/api/jobs")
public class JobsController extends MapSearchableManager {
    @Autowired
    private HubConfigSession hubConfig;


    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getJobs(@RequestParam(value = "flowName", required = false) String flowName) {
        JobDocManager jobDocManager = getJobDocManager();
        ArrayNode jobsArray;
        if (flowName == null) {
            FlowManager flowManager = new FlowManagerImpl(hubConfig);
            List<String> flowNames = flowManager.getFlowNames();
            jobsArray = new ObjectMapper().createArrayNode();
            flowNames.forEach((name) -> {
                    jobsArray.addAll((ArrayNode) getJobs(jobDocManager, null, name));
            });
        } else {
            jobsArray = (ArrayNode) getJobs(jobDocManager, null, flowName);
        }
        return new ResponseEntity<>(flattenJobsJson(jobsArray), HttpStatus.OK);
    }

    @RequestMapping(value = "/{jobId}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getJob(@PathVariable String jobId) {
        JsonNode jobsObj = getJobs(getJobDocManager(), jobId, null);
        return flattenJobsJson(jobsObj);
    }

    @RequestMapping(value = "latest/{flowName}", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public JsonNode getLatestJobDocForFlow(@PathVariable String flowName) {
        return flattenJobsJson(getJobDocManager().getLatestJobDocumentForFlow(flowName));
    }

    @RequestMapping(value = "latest", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public JsonNode getLatestJobDocsPerFlow() {
        return flattenJobsJson(getJobDocManager().getLatestJobDocumentForFlows(Collections.emptyList()));
    }

    private JsonNode getJobs(JobDocManager jobDocManager, String jobId, String flowName) {
        JsonNode jobsJson = jobDocManager.getJobDocument(jobId, flowName);
        if (jobsJson == null) {
            throw new RuntimeException("Unable to get job document");
        }
        return flattenJobsJson(jobsJson);
    }

    private JobDocManager getJobDocManager() {
        return new JobDocManager(hubConfig.newJobDbClient());
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
}
