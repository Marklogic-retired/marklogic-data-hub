package com.marklogic.quickstart.web;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.WatchEvent;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpClientErrorException;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StatusListener;
import com.marklogic.quickstart.exception.NotAuthorizedException;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.StatusMessage;
import com.marklogic.quickstart.model.LoginInfo;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.service.DataHubService;
import com.marklogic.quickstart.service.FileSystemEventListener;
import com.marklogic.quickstart.service.FileSystemWatcherService;
import com.marklogic.quickstart.service.ProjectManagerService;

@Controller
@Scope("session")
public class ProjectsController implements FileSystemEventListener {
    protected final static Logger logger = LoggerFactory.getLogger(ProjectsController.class);

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    EnvironmentConfig envConfig;

    @Autowired
    private ProjectManagerService pm;

    @RequestMapping(value = "/projects/", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getProjects() throws ClassNotFoundException, IOException {
        Map<String, Object> resp = new HashMap<String, Object>();
        resp.put("projects", pm.projects.values());
        int lastProjectId = pm.getLastProject();
        if (lastProjectId >= 0) {
            resp.put("lastProject", lastProjectId);
        }
        return resp;
    }

    @RequestMapping(value = "/projects/", method = RequestMethod.POST)
    @ResponseBody
    public Project addProject(@RequestParam String path) throws ClassNotFoundException, IOException {
        return pm.addProject(path);
    }

    @RequestMapping(value = "/projects/{projectId}", method = RequestMethod.GET)
    @ResponseBody
    public Project getProject(@PathVariable int projectId) {
        return pm.getProject(projectId);
    }

    @RequestMapping(value = "/projects/{projectId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> removeProject(@PathVariable int projectId) throws IOException {
        pm.removeProject(projectId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/projects/{projectId}/initialize", method = RequestMethod.POST)
    @ResponseBody
    public Project initializeProject(@PathVariable int projectId, @RequestBody HubConfig config) {
        Project project = pm.getProject(projectId);
        project.initialize(config);
        return project;
    }

    @RequestMapping(value = "/projects/{projectId}/defaults", method = RequestMethod.GET)
    @ResponseBody
    public HubConfig getDefaults(@PathVariable int projectId) {
        Project project = pm.getProject(projectId);
        return new HubConfig(project.path);
    }


    @RequestMapping(value = "/projects/{projectId}/{environment}", method = RequestMethod.GET)
    @ResponseBody
    public EnvironmentConfig getEnvironment(@PathVariable int projectId,
            @PathVariable String environment) {

        Project project = pm.getProject(projectId);
        EnvironmentConfig ec = new EnvironmentConfig();
        ec.init(project.path, environment);
        return ec;
    }

    @RequestMapping(value = "/projects/{projectId}/{environment}/login", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> loginToProject(@PathVariable int projectId,
            @PathVariable String environment,
            @RequestBody LoginInfo loginInfo,
            HttpSession session) throws IOException {

        Project project = pm.getProject(projectId);
        try {
            // this forces an auth with the given credentials
            envConfig.init(project.path, environment, loginInfo);
            pm.setLastProject(projectId);
            session.setAttribute("loginInfo", loginInfo);
            session.setAttribute("currentProjectId", projectId);
            session.setAttribute("currentEnvironment", environment);

            dataHubService.installUserModules();

            String pluginDir = Paths.get(envConfig.projectDir, "plugins").toString();
            watcherService.watch(pluginDir, this);

            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch(HttpClientErrorException e) {
            return new ResponseEntity<>(e.getStatusCode());
        }
    }

    @RequestMapping(value = "/projects/{projectId}/{environment}/logout", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<HttpStatus> logoutFromProject(HttpSession session) {

        Enumeration<String> attrNames = session.getAttributeNames();
        while(attrNames.hasMoreElements()) {
            session.removeAttribute(attrNames.nextElement());
        }
        return new ResponseEntity<HttpStatus>(HttpStatus.NO_CONTENT);
    }

    @MessageMapping("/install-status")
    @SendTo("/topic/install-status")
    @ResponseBody
    public StatusMessage installStatus(String message) {
        return new StatusMessage(0, message);
    }

    @RequestMapping(value = "/projects/{projectId}/{environment}/install", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> install(@PathVariable int projectId,
            @PathVariable String environment) {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        // install the hub
        dataHubService.install(envConfig.mlSettings, new StatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                template.convertAndSend("/topic/install-status", new StatusMessage(percentComplete, message));
            }
        });

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/projects/{projectId}/{environment}/uninstall", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> unInstall(@PathVariable int projectId,
            @PathVariable String environment) {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        // uninstall the hub
        dataHubService.uninstall(envConfig.mlSettings, new StatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                template.convertAndSend("/topic/uninstall-status", new StatusMessage(percentComplete, message));
            }
        });
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private void requireAuth() {
        if (!envConfig.isInitialized()) {
            throw new NotAuthorizedException();
        }
    }
    @Override
    public void onWatchEvent(Path path, WatchEvent<Path> event) {
        dataHubService.installUserModules();
    }
}
