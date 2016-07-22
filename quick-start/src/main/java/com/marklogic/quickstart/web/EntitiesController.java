package com.marklogic.quickstart.web;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Collection;

import javax.servlet.http.HttpSession;

import com.marklogic.quickstart.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.StatusListener;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.model.EntityModel;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.model.StatusMessage;
import com.marklogic.quickstart.service.CancellableTask;
import com.marklogic.quickstart.service.EntityManagerService;
import com.marklogic.quickstart.service.FlowManagerService;
import com.marklogic.quickstart.service.ProjectManagerService;
import com.marklogic.quickstart.service.TaskManagerService;

@Controller
@Scope("session")
class EntitiesController extends BaseController {

    protected final static Logger logger = LoggerFactory.getLogger(EntitiesController.class);

    @Autowired
    private ProjectManagerService projectManagerService;

    @Autowired
    private EntityManagerService entityManagerService;

    @Autowired
    private FlowManagerService flowManagerService;

    @Autowired
    private TaskManagerService taskManagerService;

    @Autowired
    private SimpMessagingTemplate template;

    @RequestMapping(value = "/entities/", method = RequestMethod.GET)
    @ResponseBody
    public Collection<EntityModel> getEntities(HttpSession session) throws ClassNotFoundException, IOException {

        requireAuth();

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = projectManagerService.getProject(projectId);

        if (!project.getEnvironments().contains(environment)) {
            throw new NotFoundException();
        }

        return entityManagerService.getEntities(envConfig.projectDir);
    }

    @RequestMapping(value = "/entities/", method = RequestMethod.POST)
    @ResponseBody
    public EntityModel createEntity(HttpSession session,
            @RequestBody EntityModel newEntity) throws ClassNotFoundException, IOException {

        requireAuth();

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = projectManagerService.getProject(projectId);
        return entityManagerService.createEntity(envConfig.projectDir, newEntity);
    }

    @RequestMapping(value = "/entities/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public EntityModel getEntity(@PathVariable String entityName, HttpSession session) throws ClassNotFoundException, IOException {
        requireAuth();

        Integer projectId = (Integer)session.getAttribute("currentProjectId");

        // ensure project exists
        projectManagerService.getProject(projectId);

        return entityManagerService.getEntity(envConfig.mlSettings.projectDir, entityName);
    }


    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}", method = RequestMethod.POST)
    @ResponseBody
    public FlowModel createFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @RequestBody FlowModel newFlow) throws ClassNotFoundException, IOException {
        requireAuth();

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = projectManagerService.getProject(projectId);

        EntityModel entity = entityManagerService.getEntity(envConfig.projectDir, entityName);

        return entityManagerService.createFlow(envConfig.projectDir, entity, flowType, newFlow);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<BigInteger> runFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @RequestParam(required=false, defaultValue="100") Integer batchSize) {

        requireAuth();

        ResponseEntity<BigInteger> resp = null;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = projectManagerService.getProject(projectId);

        Flow flow = flowManagerService.getServerFlow(entityName, flowName, flowType);
        if (flow == null) {
            resp = new ResponseEntity<BigInteger>(HttpStatus.CONFLICT);
        }
        else {
            if (batchSize == null) {
                batchSize = 100;
            }

            CancellableTask task = flowManagerService.runFlow(flow, batchSize);
            resp = new ResponseEntity<BigInteger>(taskManagerService.addTask(task), HttpStatus.OK);
        }

        return resp;
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/run/input", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<BigInteger> runInputFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @RequestBody JsonNode json) throws IOException {

        requireAuth();

        ResponseEntity<BigInteger> resp = null;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = projectManagerService.getProject(projectId);

        flowManagerService.saveOrUpdateFlowMlcpOptionsToFile(entityName,
                flowName, json.toString());

        CancellableTask task = flowManagerService.runMlcp(json, new StatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                logger.info(message);
                template.convertAndSend("/topic/mlcp-status", new StatusMessage(percentComplete, message));
            }
        });
        return new ResponseEntity<BigInteger>(taskManagerService.addTask(task), HttpStatus.OK);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/cancel/{taskId}", method = RequestMethod.DELETE)
    public ResponseEntity<?> cancelFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @PathVariable BigInteger taskId) throws IOException {

        requireAuth();

        Integer projectId = (Integer)session.getAttribute("currentProjectId");

        Project project = projectManagerService.getProject(projectId);

        taskManagerService.stopTask(taskId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(
        value = "/entities/{entityName}/flows/{flowType}/{flowName}/run/input",
        method = RequestMethod.GET,
        produces="application/json"
    )
    @ResponseBody
    public String getInputFlowOptions(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName) throws IOException {

        requireAuth();

        Integer projectId = (Integer)session.getAttribute("currentProjectId");

        if (projectId != null) {
            projectManagerService.getProject(projectId);
        }

        return flowManagerService.getFlowMlcpOptionsFromFile(entityName, flowName);
    }
}
