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

import com.marklogic.hub.HubConfig;
import com.marklogic.quickstart.model.Project;
import com.marklogic.quickstart.service.ProjectManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping(value = "/api/projects")
public class ProjectsController {

    @Autowired
    private ProjectManagerService pm;

    @RequestMapping(value = "/", method = RequestMethod.GET)
    @ResponseBody
    public Map<String, Object> getProjects() throws ClassNotFoundException, IOException {
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
}
