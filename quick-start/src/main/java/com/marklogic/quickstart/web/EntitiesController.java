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
import com.marklogic.hub.JobStatusListener;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.JobStatusMessage;
import com.marklogic.quickstart.model.entity_services.EntityModel;
import com.marklogic.quickstart.service.EntityManagerService;
import com.marklogic.quickstart.service.FlowManagerService;
import com.marklogic.quickstart.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

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
        return entityManagerService.getEntities();
    }

    @RequestMapping(value = "/entities/", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> saveEntities(@RequestBody List<EntityModel> entities) throws ClassNotFoundException, IOException {

        for (EntityModel entity : entities) {
            entityManagerService.saveEntity(entity);
        }
        entityManagerService.saveSearchOptions();
        entityManagerService.saveAllUiData(entities);
        entityManagerService.saveDbIndexes();

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/entities/ui/", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> saveEntitiesUiState(@RequestBody List<EntityModel> entities) throws ClassNotFoundException, IOException {
        entityManagerService.saveAllUiData(entities);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/entities/{entityName}", method = RequestMethod.PUT)
    @ResponseBody
    public EntityModel saveEntity(@RequestBody EntityModel entity) throws ClassNotFoundException, IOException {
        entityManagerService.saveEntityUiData(entity);
        EntityModel m = entityManagerService.saveEntity(entity);
        entityManagerService.saveSearchOptions();
        entityManagerService.saveDbIndexes();
        return m;
    }

    @RequestMapping(value = "/entities/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public EntityModel getEntity(@PathVariable String entityName) throws ClassNotFoundException, IOException {
        return entityManagerService.getEntity(entityName);
    }

    @RequestMapping(value = "/entities/{entityName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteEntity(@PathVariable String entityName) throws ClassNotFoundException, IOException {
        entityManagerService.deleteEntity(entityName);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}", method = RequestMethod.POST)
    @ResponseBody
    public FlowModel createFlow(
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @RequestBody FlowModel newFlow) throws ClassNotFoundException, IOException {
        return entityManagerService.createFlow(envConfig().getProjectDir(), entityName, flowType, newFlow);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/harmonize/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> runHarmonizeFlow(
            @PathVariable String entityName,
            @PathVariable String flowName,
            @RequestBody JsonNode json) {

        int batchSize = json.get("batchSize").asInt();
        int threadCount = json.get("threadCount").asInt();

        ResponseEntity<?> resp;

        Flow flow = flowManagerService.getServerFlow(entityName, flowName, FlowType.HARMONIZE);
        if (flow == null) {
            resp = new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        else {
            flowManagerService.runFlow(flow, batchSize, threadCount, new JobStatusListener() {
                @Override
                public void onStatusChange(String jobId, int percentComplete, String message) {
                    template.convertAndSend("/topic/flow-status", new JobStatusMessage(jobId, percentComplete, message, FlowType.HARMONIZE.toString()));
                }
                @Override
                public void onJobFinished() {}
            });
            resp = new ResponseEntity<>(HttpStatus.OK);
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
    public ResponseEntity<?> runInputFlow(
            @PathVariable String entityName,
            @PathVariable String flowName,
            @RequestBody JsonNode json) throws IOException {

        ResponseEntity<?> resp;

        Flow flow = flowManagerService.getServerFlow(entityName, flowName, FlowType.INPUT);
        if (flow == null) {
            resp = new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        else {
            flowManagerService.saveOrUpdateFlowMlcpOptionsToFile(entityName,
                flowName, json.toString());

            flowManagerService.runMlcp(flow, json, new JobStatusListener() {
                @Override
                public void onStatusChange(String jobId, int percentComplete, String message) {
                    template.convertAndSend("/topic/flow-status", new JobStatusMessage(jobId, percentComplete, message, FlowType.INPUT.toString()));
                }

                @Override
                public void onJobFinished() {
                }
            });
            resp = new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return resp;
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
