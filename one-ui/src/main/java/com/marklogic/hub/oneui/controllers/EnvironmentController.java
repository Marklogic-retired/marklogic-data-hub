/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.oneui.exceptions.BadRequestException;
import com.marklogic.hub.oneui.exceptions.ProjectDirectoryException;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.models.StatusMessage;
import com.marklogic.hub.oneui.services.DataHubService;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/api/environment")
public class EnvironmentController {
    protected final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired
    EnvironmentService environmentService;

    @Autowired
    HubConfigSession hubConfig;

    @Autowired
    DataHubService dataHubService;

    @Autowired
    private SimpMessagingTemplate template;

    static final Map<String, Object> stompHeaders = new HashMap<String, Object>(){{
        put("content-type","application/json");
    }};

    private ObjectMapper mapper = new ObjectMapper();

    @RequestMapping(value = "/initialized", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode isInitialized() {
        ObjectNode obj = mapper.createObjectNode();
        obj.put("isInitialized", environmentService.getEnvironment() != null);
        return obj;
    }

    @RequestMapping(value = "/project", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getProject() {
        ObjectNode obj = mapper.createObjectNode();
        obj.put("isInitialized", environmentService.getEnvironment() != null);
        obj.put("directory", environmentService.getProjectDirectory());
        return obj;
    }

    @RequestMapping(value = "/install", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode install(@RequestBody ObjectNode payload) throws Exception {
        String originalDirectory = environmentService.getProjectDirectory();
        final Exception[] dataHubConfigurationException = {null};
        HubDeployStatusListener listener = new HubDeployStatusListener() {
            int lastPercentageComplete = 0;
            @Override
            public void onStatusChange(int percentComplete, String message) {
                if (percentComplete >= 0) {
                    logger.info(percentComplete + "% " + message);
                    lastPercentageComplete = percentComplete;
                    template.convertAndSend("/topic/install-status", new StatusMessage(percentComplete, message), stompHeaders);
                }
            }

            @Override
            public void onError(String commandName, Exception exception) {
                String message = "Error encountered running command: " + commandName;
                template.convertAndSend("/topic/install-status", new StatusMessage(lastPercentageComplete, message));
                logger.error(message, exception);
                dataHubConfigurationException[0] = exception;
            }
        };
        String directory = payload.get("directory").asText("");
        // setting the project directory will resolve any relative paths
        try {
            Path directoryPath = Paths.get(directory);
            if (StringUtils.isEmpty(directory)) {
                throw new BadRequestException("Property 'directory', identifying project location, not specified");
            } else if (!directoryPath.isAbsolute()) {
                throw new ProjectDirectoryException("The Project Directory field requires an absolute path. (" + directory + ")", "Enter the absolute path to an existing local directory.");
            } else if (!directoryPath.toFile().exists()) {
                throw new ProjectDirectoryException("The specified project directory cannot be read. (" + directory + ")", "Verify that the directory exists and that the user account running the service has permission to read it.");
            }
            hubConfig.createProject(directory);
            // Set the AppConfig with a new AppConfig with the new project directory to ensure it doesn't try to use the current directory
            hubConfig.setAppConfig(new AppConfig(Paths.get(directory).toFile()));
            hubConfig.initHubProject();
            hubConfig.refreshProject();
            dataHubService.install(listener);
        } catch (Exception e) {
            listener.onError("Initializing", e);
        }
        if (dataHubConfigurationException[0] != null) {
            Exception exception = dataHubConfigurationException[0];
            Throwable rootCause = dataHubConfigurationException[0].getCause();
            if (exception instanceof IOException || rootCause instanceof IOException) {
                exception = new ProjectDirectoryException(exception.getMessage(), "Verify that the directory exists and that the user account running the service has permission to read it.", exception);
            }
            throw exception;
        }
        environmentService.setProjectDirectory(directory);
        return payload;
    }

    @RequestMapping(value = "/project-download", produces = "application/zip")
    public void downloadProject(HttpServletRequest request, HttpServletResponse response) {
        HubProject project = hubConfig.getHubProject();
        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
        response.addHeader("Content-Disposition", "attachment; filename=datahub-project.zip");
        try (OutputStream out = response.getOutputStream()) {
            project.exportProject(out);
            response.flushBuffer();
        } catch (IOException e) {
            throw new RuntimeException("Unable to download project;cause: " + e.getMessage());
        }
    }

    @RequestMapping(value = "/reset", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode reset() {
        environmentService.reset();
        ObjectNode obj = mapper.createObjectNode();
        obj.put("reset", true);
        return obj;
    }

    @RequestMapping(value = "/project-info", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getProjectInfo() {
        return environmentService.getProjectInfo();
    }
}
