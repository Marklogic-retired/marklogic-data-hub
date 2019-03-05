/*
 * Copyright 2012-2019 MarkLogic Corporation
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
package com.marklogic.hub.web.web;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.web.model.HubSettings;
import com.marklogic.hub.web.model.Project;
import com.marklogic.hub.web.service.ProjectManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping(value = "/api/projects")
public class ProjectsController {

    @Autowired
    private ProjectManagerService pm;


    @Autowired
    // this field wires quick-start to the main application context
    private HubConfigImpl hubConfig;

    @Autowired
    private DataHub dataHub;

    @Autowired
    private HubSettings hubSettings;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getProjects() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("projects", pm.getProjects().values());
        int lastProjectId = pm.getLastProject();
        if (lastProjectId >= 0) {
            resp.put("lastProject", lastProjectId);
        }
        return resp;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST)
    @ResponseBody
    public Project addProject(@RequestParam String path) {
        return pm.addProject(path);
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.GET)
    @ResponseBody
    public Project getProject(@PathVariable int projectId) {
        return pm.getProject(projectId);
    }

    @RequestMapping(value = "/{projectId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> removeProject(@PathVariable int projectId) {
        pm.removeProject(projectId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/reset", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> resetProject() {
        pm.reset();
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/{projectId}/initialize", method = RequestMethod.POST)
    @ResponseBody
    public Project initializeProject(@PathVariable int projectId, @RequestBody JsonNode hubConfigDelta) {
        Project project = pm.getProject(projectId);
        ObjectMapper om = new ObjectMapper();
        om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        try {
            hubConfig = om.readerForUpdating(hubConfig).readValue(hubConfigDelta);
            hubConfig.createProject(project.path);
            dataHub.initProject();
            return project;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @RequestMapping(value = "/{projectId}/defaults", method = RequestMethod.GET)
    @ResponseBody
    public HubSettings getDefaults(@PathVariable int projectId) {
        Project project = pm.getProject(projectId);
        hubSettings.setProjectDir(project.path);

        return hubSettings;
    }
}
