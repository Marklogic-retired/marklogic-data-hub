/*
 * Copyright 2012-2016 MarkLogic Corporation
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
package com.marklogic.quickstart.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowStatusListener;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.model.EntityModel;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.JobStatusMessage;
import com.marklogic.quickstart.service.EntityManagerService;
import com.marklogic.quickstart.service.FlowManagerService;
import com.marklogic.quickstart.service.JobService;
import org.springframework.batch.core.JobExecution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;

@Controller
@RequestMapping("/api/current-project")
class EntitiesController extends EnvironmentAware {
    @Autowired
    private EntityManagerService entityManagerService;

    @Autowired
    private FlowManagerService flowManagerService;

    @Autowired
    private SimpMessagingTemplate template;

    @RequestMapping(value = "/entities/", method = RequestMethod.GET)
    @ResponseBody
    public Collection<EntityModel> getEntities() throws ClassNotFoundException, IOException {
        return entityManagerService.getEntities(envConfig().getProjectDir());
    }

    @RequestMapping(value = "/entities/", method = RequestMethod.POST)
    @ResponseBody
    public EntityModel createEntity(@RequestBody EntityModel newEntity) throws ClassNotFoundException, IOException {
        return entityManagerService.createEntity(envConfig().getProjectDir(), newEntity);
    }

    @RequestMapping(value = "/entities/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public EntityModel getEntity(@PathVariable String entityName) throws ClassNotFoundException, IOException {
        return entityManagerService.getEntity(envConfig().getProjectDir(), entityName);
    }


    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}", method = RequestMethod.POST)
    @ResponseBody
    public FlowModel createFlow(
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @RequestBody FlowModel newFlow) throws ClassNotFoundException, IOException {
        EntityModel entity = entityManagerService.getEntity(envConfig().getProjectDir(), entityName);
        return entityManagerService.createFlow(envConfig().getProjectDir(), entity, flowType, newFlow);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/harmonize/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JobExecution> runFlow(
            @PathVariable String entityName,
            @PathVariable String flowName,
            @RequestBody JsonNode json) {

        int batchSize = json.get("batchSize").asInt();
        int threadCount = json.get("threadCount").asInt();

        ResponseEntity<JobExecution> resp;

        Flow flow = flowManagerService.getServerFlow(entityName, flowName, FlowType.HARMONIZE);
        if (flow == null) {
            resp = new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        else {
            JobExecution execution = flowManagerService.runFlow(flow, batchSize, threadCount, (jobId, percentComplete, message) -> {
                template.convertAndSend("/topic/flow-status", new JobStatusMessage(jobId, percentComplete, message, FlowType.HARMONIZE.toString()));
            });
            resp = new ResponseEntity<>(execution, HttpStatus.OK);
        }

        return resp;
    }

    @RequestMapping(value = "/entities/{entityName}/flows/input/{flowName}/save-input-options", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> saveInputFlowOptions(
        @PathVariable String entityName,
        @PathVariable String flowName,
        @RequestBody JsonNode json) throws IOException {

        flowManagerService.saveOrUpdateFlowMlcpOptionsToFile(entityName,
            flowName, json.toString());

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/input/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public JobExecution runInputFlow(
            @PathVariable String entityName,
            @PathVariable String flowName,
            @RequestBody JsonNode json) throws IOException {
        flowManagerService.saveOrUpdateFlowMlcpOptionsToFile(entityName,
                flowName, json.toString());

        return flowManagerService.runMlcp(json, (jobId, percentComplete, message) -> {
            template.convertAndSend("/topic/flow-status", new JobStatusMessage(jobId, percentComplete, message, FlowType.INPUT.toString()));
        });
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowName}/cancel/{jobId}", method = RequestMethod.DELETE)
    public ResponseEntity<?> cancelFlow(
            @PathVariable String entityName,
            @PathVariable String flowName,
            @PathVariable String jobId) throws IOException {
        JobService jm = new JobService(envConfig().getJobClient());
        jm.cancelJob(Long.parseLong(jobId));

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(
        value = "/entities/{entityName}/flows/input/{flowName}/run",
        method = RequestMethod.GET,
        produces="application/json"
    )
    @ResponseBody
    public String getInputFlowOptions(
            @PathVariable String entityName,
            @PathVariable String flowName) throws IOException {
        return flowManagerService.getFlowMlcpOptionsFromFile(entityName, flowName);
    }
}
