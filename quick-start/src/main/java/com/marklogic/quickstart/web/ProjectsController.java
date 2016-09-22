package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.StatusListener;
import com.marklogic.hub.Tracing;
import com.marklogic.quickstart.exception.NotAuthorizedException;
import com.marklogic.quickstart.listeners.DeployUserModulesListener;
import com.marklogic.quickstart.listeners.ValidateListener;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.LoginInfo;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.model.StatusMessage;
import com.marklogic.quickstart.service.DataHubService;
import com.marklogic.quickstart.service.FileSystemEventListener;
import com.marklogic.quickstart.service.FileSystemWatcherService;
import com.marklogic.quickstart.service.ProjectManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.WatchEvent;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping(value = "/api/projects")
public class ProjectsController extends BaseController implements FileSystemEventListener, ValidateListener, DeployUserModulesListener {

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private SimpMessagingTemplate template;

    @Autowired
    private ProjectManagerService pm;

    @RequestMapping(value = "/", method = RequestMethod.GET)
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

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @ResponseBody
    public Project addProject(@RequestParam String path) throws ClassNotFoundException, IOException {
        return pm.addProject(path);
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.GET)
    @ResponseBody
    public Project getProject(@PathVariable int projectId) {
        return pm.getProject(projectId);
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> removeProject(@PathVariable int projectId) throws IOException {
        pm.removeProject(projectId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/{projectId}/initialize", method = RequestMethod.POST)
    @ResponseBody
    public Project initializeProject(@PathVariable int projectId, @RequestBody HubConfig config) {
        Project project = pm.getProject(projectId);
        project.initialize(config);
        return project;
    }

    @RequestMapping(value = "/{projectId}/defaults", method = RequestMethod.GET)
    @ResponseBody
    public HubConfig getDefaults(@PathVariable int projectId) {
        Project project = pm.getProject(projectId);
        return new HubConfig(project.path);
    }


    @RequestMapping(value = "/{projectId}/{environment}", method = RequestMethod.GET)
    @ResponseBody
    public String getEnvironment(@PathVariable int projectId,
            @PathVariable String environment) throws JsonProcessingException {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);
        return envConfig.toJson();
    }

    @RequestMapping(value = "/{projectId}/{environment}/login", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> loginToProject(@PathVariable int projectId,
            @PathVariable String environment,
            @RequestBody LoginInfo loginInfo,
            HttpSession session) throws IOException {

        if (loginInfo.username == null || loginInfo.password == null) {
            throw new NotAuthorizedException();
        }

        Project project = pm.getProject(projectId);
        try {
            // this forces an auth with the given credentials
            envConfig.init(project.path, environment, loginInfo);
            pm.setLastProject(projectId);
            session.setAttribute("loginInfo", loginInfo);
            session.setAttribute("currentProjectId", projectId);
            session.setAttribute("currentEnvironment", environment);

            if (envConfig.isInstalled()) {
                installUserModules(envConfig.getMlSettings(), false);
                startProjectWatcher();
            }


            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        catch(HttpClientErrorException e) {
            return new ResponseEntity<>(e.getStatusCode());
        }
    }

    @RequestMapping(value = "/{projectId}/{environment}/logout", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> logoutFromProject(HttpSession session) throws IOException {

        String pluginDir = Paths.get(envConfig.getProjectDir(), "plugins").toString();
        watcherService.removeListener(this);
        watcherService.unwatch(pluginDir);

        Enumeration<String> attrNames = session.getAttributeNames();
        while(attrNames.hasMoreElements()) {
            session.removeAttribute(attrNames.nextElement());
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/{projectId}/{environment}/install", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> install(@PathVariable int projectId,
            @PathVariable String environment) throws IOException {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        final EnvironmentConfig cachedConfig = envConfig;

        // install the hub
        boolean installed = dataHubService.install(envConfig.getMlSettings(), new StatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                template.convertAndSend("/topic/install-status", new StatusMessage(percentComplete, message));
            }
        });

        envConfig.setInitialized(installed);
        if (installed) {
            if (environment.equals("local")) {
                Tracing tracing = new Tracing(envConfig.getStagingClient());
                tracing.enable();
            }
            logger.info("OnFinished: installing user modules");
            installUserModules(cachedConfig.getMlSettings(), true);
            startProjectWatcher();
        }

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/{projectId}/{environment}/uninstall", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> unInstall(@PathVariable int projectId,
            @PathVariable String environment) {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        // uninstall the hub
        dataHubService.uninstall(envConfig.getMlSettings(), new StatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                template.convertAndSend("/topic/uninstall-status", new StatusMessage(percentComplete, message));
            }
        });
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{projectId}/{environment}/last-deployed", method = RequestMethod.GET)
    @ResponseBody
    public String getLastDeployed(@PathVariable int projectId,
                                                  @PathVariable String environment) throws IOException {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        // reinstall the user modules
        return dataHubService.getLastDeployed(envConfig.getMlSettings());
    }

    @RequestMapping(value = "/{projectId}/{environment}/reinstall-user-modules", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> reinstallUserModules(@PathVariable int projectId,
                                     @PathVariable String environment) throws IOException {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        // reinstall the user modules
        dataHubService.reinstallUserModules(envConfig.getMlSettings(), this, this);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/{projectId}/{environment}/validate-user-modules", method = RequestMethod.POST)
    @ResponseBody
    public String validateUserModules(@PathVariable int projectId,
                                                @PathVariable String environment) throws IOException {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        // start the module validation
        dataHubService.validateUserModules(envConfig.getMlSettings(), this);

        return "{}";
    }

    @RequestMapping(value = "/{projectId}/{environment}/uninstall-user-modules", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> unInstallUserModules(@PathVariable int projectId,
                                       @PathVariable String environment) {

        requireAuth();

        // make sure the project exists
        pm.getProject(projectId);

        // uninstall the hub
        dataHubService.uninstallUserModules(envConfig.getMlSettings());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    private void startProjectWatcher() throws IOException {
        String pluginDir = Paths.get(envConfig.getProjectDir(), "plugins").toString();
        if (!watcherService.hasListener(this)) {
            watcherService.watch(pluginDir);
            watcherService.addListener(this);
        }
    }

    private void installUserModules(HubConfig hubConfig, boolean force) {
        dataHubService.installUserModules(hubConfig, force, this, this);
    }

    @Override
    public void onValidate(JsonNode validation) {
        template.convertAndSend("/topic/validate-status", validation);
    }

    @Override
    public void onWatchEvent(HubConfig hubConfig, Path path, WatchEvent<Path> event) {
        installUserModules(hubConfig, false);
    }

    @Override
    public void onDeploy(String status) {
        template.convertAndSend("/topic/deploy-status", status);
    }
}
