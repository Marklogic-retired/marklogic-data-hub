/*
 * Copyright 2012-2020 MarkLogic Corporation
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
package com.marklogic.hub.oneui.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.MarkLogicServerException;
import com.marklogic.hub.oneui.managers.JobsManager;
import com.marklogic.hub.oneui.managers.ModelManager;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/api/jobs")
public class JobsController {

    private static final Logger logger = LoggerFactory.getLogger(JobsController.class);

    @Autowired
    private JobsManager jobsManager;

    @Autowired
    private HubConfigSession hubConfig;

    @Autowired
    private ModelManager modelManager;

    @Bean
    @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "request")
    JobsManager jobsManager() {
        return new JobsManager(hubConfig, modelManager);
    }

    @RequestMapping(value = "/models", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getLatestJobInfoForAllModels() {
        List<JsonNode> modelList = new ArrayList<>();
        try {
            modelList = jobsManager.getLatestJobInfoForAllModels();
        }
        catch (MarkLogicServerException e) {
            /*
             * As MarkLogic server throws a FailedRequestException for both data-service module not found
             * and if the user is unauthorized to access the module; we need to fail silently and log the
             * issue.
             */
            logger.error(e.getMessage());
        }
        return new ResponseEntity<>(modelList, HttpStatus.OK);
    }

    @RequestMapping(value = "/models/{modelName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getLatestJobInfo(@PathVariable String modelName) {
        JsonNode json = null;
        try {
            json = jobsManager.getLatestJobInfo(modelName);
        }
        catch (MarkLogicServerException e) {
            /*
             * As MarkLogic server throws a FailedRequestException for both data-service module not found
             * and if the user is unauthorized to access the module; we need to fail silently and log the
             * issue.
             */
            logger.error(e.getMessage());
        }
        return new ResponseEntity<>(json, HttpStatus.OK);
    }
}
