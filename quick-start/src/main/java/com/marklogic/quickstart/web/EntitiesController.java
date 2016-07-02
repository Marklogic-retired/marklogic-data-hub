package com.marklogic.quickstart.web;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Collection;

import javax.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowType;
import com.marklogic.quickstart.model.EntityModel;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.FlowModel;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.service.CancellableTask;
import com.marklogic.quickstart.service.EntityManagerService;
import com.marklogic.quickstart.service.FlowManagerService;
import com.marklogic.quickstart.service.ProjectManagerService;
import com.marklogic.quickstart.service.TaskManagerService;

@Controller
@Scope("session")
public class EntitiesController {

    @Autowired
    private ProjectManagerService projectManagerService;

    @Autowired
    private EntityManagerService entityManagerService;

    @Autowired
    private FlowManagerService flowManagerService;

    @Autowired
    private TaskManagerService taskManagerService;

    @Autowired
    EnvironmentConfig envConfig;

    @RequestMapping(value = "/entities/", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Collection<EntityModel>> getEntities(HttpSession session) throws ClassNotFoundException, IOException {
        ResponseEntity<Collection<EntityModel>> resp;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null && project.getEnvironments().contains(environment)) {
            Collection<EntityModel> entities = entityManagerService.getEntities(envConfig.projectDir);
            resp = new ResponseEntity<Collection<EntityModel>>(entities, HttpStatus.OK);
        }
        else {
            resp = new ResponseEntity<Collection<EntityModel>>(HttpStatus.UNAUTHORIZED);
        }

        return resp;
    }

    @RequestMapping(value = "/entities/", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<EntityModel> createEntity(HttpSession session,
            @RequestBody EntityModel newEntity) throws ClassNotFoundException, IOException {
        ResponseEntity<EntityModel> resp;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null) {
            EntityModel entity = entityManagerService.createEntity(envConfig.projectDir, newEntity);
            resp = new ResponseEntity<EntityModel>(entity, HttpStatus.OK);
        }
        else {
            resp = new ResponseEntity<EntityModel>(HttpStatus.UNAUTHORIZED);
        }

        return resp;
    }

    @RequestMapping(value = "/entities/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<EntityModel> getEntity(@PathVariable String entityName, HttpSession session) throws ClassNotFoundException, IOException {
        ResponseEntity<EntityModel> resp;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null) {
            EntityModel entity = entityManagerService.getEntity(envConfig.mlSettings.projectDir, entityName);
            resp = new ResponseEntity<EntityModel>(entity, HttpStatus.OK);
        }
        else {
            resp = new ResponseEntity<EntityModel>(HttpStatus.UNAUTHORIZED);
        }

        return resp;
    }


    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<FlowModel> createFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @RequestBody FlowModel newFlow) throws ClassNotFoundException, IOException {
        ResponseEntity<FlowModel> resp;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null) {
            EntityModel entity = entityManagerService.getEntity(envConfig.projectDir, entityName);
            if (entity != null) {
                FlowModel flow = entityManagerService.createFlow(envConfig.projectDir, entity, flowType, newFlow);
                resp = new ResponseEntity<FlowModel>(flow, HttpStatus.OK);
            }
            else {
                resp = new ResponseEntity<FlowModel>(HttpStatus.NOT_FOUND);
            }
        }
        else {
            resp = new ResponseEntity<FlowModel>(HttpStatus.UNAUTHORIZED);
        }

        return resp;
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<BigInteger> runFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @RequestParam(required=false, defaultValue="100") Integer batchSize) {
        ResponseEntity<BigInteger> resp = null;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null) {
            Flow flow = flowManagerService.getServerFlow(entityName, flowName, flowType);
            if (flow != null) {
                if (batchSize == null) {
                    batchSize = 100;
                }

                CancellableTask task = flowManagerService.runFlow(flow, batchSize);
                resp = new ResponseEntity<BigInteger>(taskManagerService.addTask(task), HttpStatus.OK);
            }
            else {
                // this means that the flow hasn't been deployed
                resp = new ResponseEntity<BigInteger>(HttpStatus.CONFLICT);
            }
        }

        if (resp == null) {
            resp = new ResponseEntity<BigInteger>(HttpStatus.UNAUTHORIZED);
        }

        return resp;
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/run/input", method = RequestMethod.POST)
    public ResponseEntity<BigInteger> runInputFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @RequestBody JsonNode json) throws IOException {

        ResponseEntity<BigInteger> resp = null;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null) {

            flowManagerService.saveOrUpdateFlowMlcpOptionsToFile(entityName,
                    flowName, json.toString());

            CancellableTask task = flowManagerService.runMlcp(json);
            return new ResponseEntity<BigInteger>(taskManagerService.addTask(task), HttpStatus.OK);
        }
        if (resp == null) {
            resp = new ResponseEntity<BigInteger>(HttpStatus.UNAUTHORIZED);
        }
        return resp;
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/cancel/{taskId}", method = RequestMethod.DELETE)
    public ResponseEntity<?> cancelFlow(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName,
            @PathVariable BigInteger taskId) throws IOException {

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (taskId != null && projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null) {
            taskManagerService.stopTask(taskId);
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/entities/{entityName}/flows/{flowType}/{flowName}/run/input", method = RequestMethod.GET)
    public ResponseEntity<JsonNode> getInputFlowOptions(
            HttpSession session,
            @PathVariable String entityName,
            @PathVariable FlowType flowType,
            @PathVariable String flowName) throws IOException {

        ResponseEntity<JsonNode> resp = null;

        Integer projectId = (Integer)session.getAttribute("currentProjectId");
        String environment = (String)session.getAttribute("currentEnvironment");

        Project project = null;
        if (projectId != null) {
            project = projectManagerService.getProject(projectId);
        }

        if (environment != null && project != null) {

            String optionsFileContent = flowManagerService.getFlowMlcpOptionsFromFile(entityName, flowName);
            ObjectMapper mapper = new ObjectMapper();
            return new ResponseEntity<JsonNode>(mapper.readTree(optionsFileContent), HttpStatus.OK);
        }
        if (resp == null) {
            resp = new ResponseEntity<JsonNode>(HttpStatus.UNAUTHORIZED);
        }
        return resp;
    }
}
