package com.marklogic.quickstart.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.quickstart.service.JobManager;
import com.marklogic.hub.JobStatusListener;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.exception.NotFoundException;
import com.marklogic.quickstart.model.EntityModel;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.JobStatusMessage;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.service.EntityManagerService;
import com.marklogic.quickstart.service.FlowManagerService;
import com.marklogic.quickstart.service.ProjectManagerService;
import org.springframework.batch.core.JobExecution;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Collection;

@Controller
@RequestMapping("/api/projects/{projectId}/{environment}")
class EntitiesController extends BaseController {

    @Autowired
    private ProjectManagerService projectManagerService;

    @Autowired
    private EntityManagerService entityManagerService;

    @Autowired
    private FlowManagerService flowManagerService;

    @Autowired
    private SimpMessagingTemplate template;

    @RequestMapping(value = "/entities/", method = RequestMethod.GET)
    @ResponseBody
    public Collection<EntityModel> getEntities(@PathVariable int projectId,
                                               @PathVariable String environment) throws ClassNotFoundException, IOException {

        requireAuth();

        Project project = projectManagerService.getProject(projectId);

        if (!project.getEnvironments().contains(environment)) {
            throw new NotFoundException();
        }

        return entityManagerService.getEntities(envConfig.getProjectDir());
    }

    @RequestMapping(value = "/entities/", method = RequestMethod.POST)
    @ResponseBody
    public EntityModel createEntity(@PathVariable int projectId,
                                    @PathVariable String environment,
            @RequestBody EntityModel newEntity) throws ClassNotFoundException, IOException {

        requireAuth();

        Project project = projectManagerService.getProject(projectId);
        return entityManagerService.createEntity(envConfig.getProjectDir(), newEntity);
    }

    @RequestMapping(value = "/entities/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public EntityModel getEntity(@PathVariable int projectId,
                                 @PathVariable String environment,
                                 @PathVariable String entityName) throws ClassNotFoundException, IOException {
        requireAuth();

        // ensure project exists
        projectManagerService.getProject(projectId);

        return entityManagerService.getEntity(envConfig.getProjectDir(), entityName);
    }


    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}", method = RequestMethod.POST)
    @ResponseBody
    public FlowModel createFlow(
            @PathVariable int projectId,
            @PathVariable String environment,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @RequestBody FlowModel newFlow) throws ClassNotFoundException, IOException {
        requireAuth();

        Project project = projectManagerService.getProject(projectId);

        EntityModel entity = entityManagerService.getEntity(envConfig.getProjectDir(), entityName);

        return entityManagerService.createFlow(envConfig.getProjectDir(), entity, flowType, newFlow);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JobExecution> runFlow(
            @PathVariable int projectId,
            @PathVariable String environment,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @RequestBody JsonNode json) {

        requireAuth();

        int batchSize = json.get("batchSize").asInt();
        int threadCount = json.get("threadCount").asInt();

        ResponseEntity<JobExecution> resp = null;

        Project project = projectManagerService.getProject(projectId);

        Flow flow = flowManagerService.getServerFlow(entityName, flowName, flowType);
        if (flow == null) {
            resp = new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        else {
            JobExecution execution = flowManagerService.runFlow(flow, batchSize, threadCount, new JobStatusListener() {
                @Override
                public void onStatusChange(long jobId, int percentComplete, String message) {
                    template.convertAndSend("/topic/flow-status", new JobStatusMessage(Long.toString(jobId), percentComplete, message, flowType.toString()));
                }
                @Override
                public void onJobFinished() {}
            });
            resp = new ResponseEntity<>(execution, HttpStatus.OK);
        }

        return resp;
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/save-input-options", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> saveInputFlowOptions(
        @PathVariable int projectId,
        @PathVariable String environment,
        @PathVariable String entityName,
        @PathVariable FlowType flowType,
        @PathVariable String flowName,
        @RequestBody JsonNode json) throws IOException {

        requireAuth();

        ResponseEntity<BigInteger> resp = null;

        projectManagerService.getProject(projectId);

        flowManagerService.saveOrUpdateFlowMlcpOptionsToFile(entityName,
            flowName, json.toString());

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/run/input", method = RequestMethod.POST)
    @ResponseBody
    public JobExecution runInputFlow(
            @PathVariable int projectId,
            @PathVariable String environment,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @RequestBody JsonNode json) throws IOException {

        requireAuth();

        ResponseEntity<BigInteger> resp = null;

        Project project = projectManagerService.getProject(projectId);

        flowManagerService.saveOrUpdateFlowMlcpOptionsToFile(entityName,
                flowName, json.toString());

        return flowManagerService.runMlcp(json, new JobStatusListener() {
            @Override
            public void onStatusChange(long jobId, int percentComplete, String message) {
                template.convertAndSend("/topic/flow-status", new JobStatusMessage(Long.toString(jobId), percentComplete, message, flowType.toString()));
            }
            @Override
            public void onJobFinished() {}
        });
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/cancel/{jobId}", method = RequestMethod.DELETE)
    public ResponseEntity<?> cancelFlow(
            @PathVariable int projectId,
            @PathVariable String environment,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @PathVariable String jobId) throws IOException {

        requireAuth();

        Project project = projectManagerService.getProject(projectId);

        JobManager jm = new JobManager(envConfig.getMlSettings(), envConfig.getJobClient());
        jm.cancelJob(Long.parseLong(jobId));

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(
        value = "/entities/{entityName}/flows/{flowType}/{flowName}/run/input",
        method = RequestMethod.GET,
        produces="application/json"
    )
    @ResponseBody
    public String getInputFlowOptions(
            @PathVariable int projectId,
            @PathVariable String environment,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName) throws IOException {

        requireAuth();
        projectManagerService.getProject(projectId);
        return flowManagerService.getFlowMlcpOptionsFromFile(entityName, flowName);
    }
}
