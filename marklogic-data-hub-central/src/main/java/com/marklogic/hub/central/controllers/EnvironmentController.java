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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.appdeployer.AppConfig;
import com.marklogic.hub.HubProject;
import com.marklogic.hub.central.exceptions.BadRequestException;
import com.marklogic.hub.central.exceptions.ProjectDirectoryException;
import com.marklogic.hub.central.listener.UIDeployListener;
import com.marklogic.hub.central.models.HubConfigSession;
import com.marklogic.hub.central.services.DataHubProjectUtils;
import com.marklogic.hub.central.services.DataHubService;
import com.marklogic.hub.central.services.EnvironmentService;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

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
    public void install(@RequestBody ObjectNode payload) throws Exception {
        String directory = payload.get("directory").asText("");
        install(directory, new UIDeployListener(template, false));
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

    @RequestMapping(value = "/project-upload", method = RequestMethod.POST)
    @ResponseBody
    public void uploadProject(@RequestParam("zipfile") MultipartFile uploadedFile) throws Exception {
        UIDeployListener listener = new UIDeployListener(template, false);

        HubProject project = hubConfig.getHubProject();
        DataHubProjectUtils.replaceProject(project, uploadedFile.getInputStream(), listener);

        dataHubService.unInstall(new UIDeployListener(template,true));
        install(project.getProjectDirString(), listener);
    }

    private void install(String directory, UIDeployListener listener) throws Exception {
        if (StringUtils.isEmpty(directory)) {
            throw new BadRequestException("Property 'directory', identifying project location, not specified");
        }
        try {
            // setting the project directory will resolve any relative paths
            Path directoryPath = Paths.get(directory);
            if (!directoryPath.isAbsolute()) {
                throw new ProjectDirectoryException("The Project Directory field requires an absolute path. You entered: " + directory, "Enter the absolute path to an existing local directory.");
            } else if (!directoryPath.toFile().exists()) {
                throw new ProjectDirectoryException("The specified directory does not exist: " + directory, "Create the directory and specify its absolute path.");
            }
            hubConfig.createProject(directory);
            // Set the AppConfig with a new AppConfig with the new project directory to ensure it doesn't try to use the current directory
            hubConfig.setAppConfig(new AppConfig(Paths.get(directory).toFile()));
            hubConfig.initHubProject();
            hubConfig.refreshProject();
            dataHubService.install(listener);
        } catch (Exception e) {
            listener.onError("Initializing ", e);
        }
        if (listener.getException() != null) {
            environmentService.setIsInDirtyState(true);
            throw listener.getException();
        } else {
            environmentService.setIsInDirtyState(false);
        }
        environmentService.setProjectDirectory(directory);
    }
}
