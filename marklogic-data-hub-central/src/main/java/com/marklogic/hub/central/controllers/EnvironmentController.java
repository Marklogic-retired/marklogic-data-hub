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
import com.marklogic.hub.central.HubCentral;
import com.marklogic.hub.impl.Versions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@Controller
public class EnvironmentController extends BaseController {

    @Autowired
    HubCentral hubCentral;

    @Autowired
    Environment environment;

    private ObjectMapper mapper = new ObjectMapper();

    @RequestMapping(value = "/api/info", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Map<String, String>> getInfo() {
        Map<String, String> infoMap = new HashMap<>();
        infoMap.put("session.timeout", environment.getProperty("server.servlet.session.timeout"));
        return new ResponseEntity<>(infoMap, HttpStatus.OK);
    }

    @RequestMapping(value = "/api/environment/initialized", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode isInitialized() {
        ObjectNode obj = mapper.createObjectNode();
        obj.put("isInitialized", true);
        return obj;
    }

    @RequestMapping(value = "/api/environment/project", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getProject() {
        ObjectNode obj = mapper.createObjectNode();
        obj.put("isInitialized", true);
        return obj;
    }

    @RequestMapping(value = "/api/environment/project-download", produces = "application/zip")
    public void downloadProject(HttpServletRequest request, HttpServletResponse response) {
        // TODO Will be re-implemented
//        HubProject project = hubConfig.getHubProject();
//        response.setContentType(MediaType.APPLICATION_OCTET_STREAM_VALUE);
//        response.addHeader("Content-Disposition", "attachment; filename=datahub-project.zip");
//        try (OutputStream out = response.getOutputStream()) {
//            project.exportProject(out);
//            response.flushBuffer();
//        } catch (IOException e) {
//            throw new RuntimeException("Unable to download project;cause: " + e.getMessage());
//        }
    }

    @RequestMapping(value = "/api/environment/reset", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode reset() {
        // TODO Will be re-implemented
        ObjectNode node = mapper.createObjectNode();
        node.put("reset", true);
        return node;
    }

    @RequestMapping(value = "/api/environment/project-info", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getProjectInfo() {
        Versions versions = new Versions(getHubConfig());
        ObjectNode node = new ObjectMapper().createObjectNode();
        node.put("projectName", hubCentral.getProjectName());
        node.put("dataHubVersion", versions.getHubVersion());
        node.put("marklogicVersion", versions.getMarkLogicVersion());
        node.put("host", hubCentral.getHost());
        return node;
    }

    @RequestMapping(value = "/api/environment/project-upload", method = RequestMethod.POST)
    @ResponseBody
    public void uploadProject(@RequestParam("zipfile") MultipartFile uploadedFile) {
        // TODO Will be re-implemented
    }
}
