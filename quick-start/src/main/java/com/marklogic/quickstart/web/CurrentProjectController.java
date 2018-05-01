/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.quickstart.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.DatabaseKind;
import com.marklogic.hub.HubConfig;
import com.marklogic.hub.InstallInfo;
import com.marklogic.hub.Tracing;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.CantUpgradeException;
import com.marklogic.quickstart.EnvironmentAware;
import com.marklogic.quickstart.auth.ConnectionAuthenticationToken;
import com.marklogic.quickstart.listeners.DeployUserModulesListener;
import com.marklogic.quickstart.listeners.ValidateListener;
import com.marklogic.quickstart.model.EnvironmentConfig;
import com.marklogic.quickstart.model.StatusMessage;
import com.marklogic.quickstart.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.HashMap;

@Controller
@RequestMapping(value = "/api/current-project")
@Scope(proxyMode= ScopedProxyMode.TARGET_CLASS, value="session")
public class CurrentProjectController extends EnvironmentAware implements FileSystemEventListener, ValidateListener, DeployUserModulesListener, AuthenticationSuccessHandler, LogoutSuccessHandler {

    @Autowired
    private DataHubService dataHubService;

    @Autowired
    EntityManagerService entityManagerService;

    @Autowired
    private FileSystemWatcherService watcherService;

    @Autowired
    private SimpMessagingTemplate template;

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public String getEnvironment() throws JsonProcessingException {
        return envConfig().toJson();
    }

    @RequestMapping(value = "/install", method = RequestMethod.PUT, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public ResponseEntity<?> install() throws IOException {

        final EnvironmentConfig cachedConfig = envConfig();

        // install the hub
        dataHubService.install(envConfig().getMlSettings(), new HubDeployStatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                template.convertAndSend("/topic/install-status", new StatusMessage(percentComplete, message));
            }

            @Override
            public void onError() {}
        });

        envConfig().checkIfInstalled();
        boolean installed = envConfig().getInstallInfo().isInstalled();

        envConfig().setInitialized(installed);
        if (installed) {
            if (envConfig().getEnvironment().equals("local")) {
                Tracing tracing = Tracing.create(envConfig().getStagingClient());
                tracing.enable();
            }
            logger.info("OnFinished: installing user modules");
            installUserModules(cachedConfig.getMlSettings(), true);
            startProjectWatcher();
        }

        return new ResponseEntity<>(envConfig().toJson(), HttpStatus.OK);
    }

    @RequestMapping(value = "/uninstall", method = RequestMethod.DELETE, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public ResponseEntity<?> unInstall() throws IOException {

        // uninstall the hub
        dataHubService.uninstall(envConfig().getMlSettings(), new HubDeployStatusListener() {
            @Override
            public void onStatusChange(int percentComplete, String message) {
                template.convertAndSend("/topic/uninstall-status", new StatusMessage(percentComplete, message));
            }

            @Override
            public void onError() {}
        });
        envConfig().checkIfInstalled();
        envConfig().getInstallInfo().isInstalled();

        return new ResponseEntity<>(envConfig().toJson(), HttpStatus.OK);
    }

    @RequestMapping(value = "/update-indexes", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> updateIndexes() throws IOException {

        // reinstall the user modules
        dataHubService.updateIndexes(envConfig().getMlSettings());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/last-deployed", method = RequestMethod.GET)
    @ResponseBody
    public String getLastDeployed() throws IOException {

        // reinstall the user modules
        return dataHubService.getLastDeployed(envConfig().getMlSettings());
    }

    @RequestMapping(value = "/reinstall-user-modules", method = RequestMethod.POST)
    public ResponseEntity<?> reinstallUserModules() throws IOException {
        // reinstall the user modules
        dataHubService.reinstallUserModules(envConfig().getMlSettings(), this, this);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/validate-user-modules", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public String validateUserModules() throws IOException {
        // start the module validation
        dataHubService.validateUserModules(envConfig().getMlSettings(), this);

        return "{}";
    }

    @RequestMapping(value = "/uninstall-user-modules", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> unInstallUserModules() {
        // uninstall the hub
        dataHubService.uninstallUserModules(envConfig().getMlSettings());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/stats", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public String getProjectStats() {
        HubStatsService hs = new HubStatsService(envConfig().getStagingClient());
        return hs.getStats();
    }

    @RequestMapping(value = "/clear/{database}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> clearDatabase(@PathVariable String database) {
        dataHubService.clearContent(envConfig().getMlSettings(), database);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/clear-all", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> clearDatabase() {
        HubConfig config = envConfig().getMlSettings();
        String[] databases = { config.getDbName(DatabaseKind.STAGING), config.getDbName(DatabaseKind.FINAL), config.getDbName(DatabaseKind.JOB), config.getDbName(DatabaseKind.TRACE) };
        for (String database: databases) {
            dataHubService.clearContent(envConfig().getMlSettings(), database);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/update-hub", method = RequestMethod.POST)
    public ResponseEntity<?> updateHub() throws IOException, CantUpgradeException {
        try {
            if (dataHubService.updateHub(envConfig().getMlSettings())) {
                installUserModules(envConfig().getMlSettings(), true);
                startProjectWatcher();
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
        } catch (CantUpgradeException e) {
            return new ResponseEntity<>(e, HttpStatus.BAD_REQUEST);
        }
        return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
    }

    @RequestMapping(value = "/preinstall-check", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    @ResponseBody
    public String preInstallCheck() {
        HashMap response = dataHubService.preInstallCheck(envConfig().getMlSettings());
        String jsonResponse = null;
        try {
            jsonResponse = new ObjectMapper().writeValueAsString(response);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return jsonResponse;
    }

    private void startProjectWatcher() throws IOException {
        String pluginDir = Paths.get(envConfig().getProjectDir(), "plugins").toString();
        if (!watcherService.hasListener(this)) {
            watcherService.watch(pluginDir);
            watcherService.addListener(this);
        }
    }

    private void installUserModules(HubConfig hubConfig, boolean force) {
        dataHubService.installUserModulesAsync(hubConfig, force, this, this);
    }

    @Override
    public void onValidate(JsonNode validation) {
        template.convertAndSend("/topic/validate-status", validation);
    }

    /**
     * Called when the filesystem watcher detects a file change. We then install the user modules
     * @param hubConfig - must pass the hub config because this runs in a separate thread and doesn't
     *                  have access to the current spring boot context
     */
    @Override
    public void onWatchEvent(HubConfig hubConfig) {
        installUserModules(hubConfig, false);
    }

    @Override
    public void onDeploy(String status) {
        template.convertAndSend("/topic/deploy-status", status);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken)authentication;
        EnvironmentConfig envConfig = authenticationToken.getEnvironmentConfig();
        envConfig.checkIfInstalled();

        InstallInfo installInfo = envConfig.getInstallInfo();
        if (installInfo.isInstalled() && envConfig.getRunningVersion().equals(envConfig.getInstalledVersion())) {
            installUserModules(envConfig.getMlSettings(), false);
            startProjectWatcher();
        }

        clearAuthenticationAttributes(request);
    }

    private void clearAuthenticationAttributes(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session == null) {
            return;
        }

        session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
    }

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        ConnectionAuthenticationToken authenticationToken = (ConnectionAuthenticationToken)authentication;
        EnvironmentConfig envConfig = authenticationToken.getEnvironmentConfig();
        String pluginDir = Paths.get(envConfig.getProjectDir(), "plugins").toString();
        watcherService.removeListener(this);
        watcherService.unwatch(pluginDir);
    }
}
