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
import com.marklogic.hub.deploy.util.HubDeployStatusListener;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.oneui.models.StatusMessage;
import com.marklogic.hub.oneui.services.DataHubService;
import com.marklogic.hub.oneui.services.EnvironmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpSession;
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
    public JsonNode install(@RequestBody ObjectNode payload, HttpSession session) {
        environmentService.setProjectDirectory(payload.get("directory").asText(""));
        String directory = environmentService.getProjectDirectory();
        hubConfig.createProject(directory);
        hubConfig.initHubProject();
        // TODO do we need to allow a different environments for curation UI?
        hubConfig.withPropertiesFromEnvironment("local");
        hubConfig.refreshProject();
        final DataHubConfigurationException[] dataHubConfigurationException = {null};
        dataHubService.install(new HubDeployStatusListener() {
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
                dataHubConfigurationException[0] = new DataHubConfigurationException(exception.getMessage());
            }
        });
        if (dataHubConfigurationException[0] != null) {
            throw dataHubConfigurationException[0];
        }
        return payload;
    }

    @RequestMapping(value = "/reset", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode reset() {
        environmentService.reset();
        ObjectNode obj = mapper.createObjectNode();
        obj.put("reset", true);
        return obj;
    }
}
