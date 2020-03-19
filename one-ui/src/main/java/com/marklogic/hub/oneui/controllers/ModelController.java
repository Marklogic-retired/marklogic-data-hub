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

import com.marklogic.hub.oneui.managers.ModelManager;
import com.marklogic.hub.oneui.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/api/models")
public class ModelController {

    @Autowired
    protected ModelManager modelManager;

    @Autowired
    private HubConfigSession hubConfig;

    @Bean
    @Scope(proxyMode = ScopedProxyMode.TARGET_CLASS, value = "request")
    ModelManager modelManager() {
        return new ModelManager(hubConfig);
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getModels() {
        return ResponseEntity.ok(modelManager.getModels());
    }

    @RequestMapping(value = "/{modelName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getModel(@PathVariable String modelName) {
        return ResponseEntity.ok(modelManager.getModel(modelName));
    }

    @RequestMapping(value = "/job-info", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getLatestJobInfoForAllModels() {
        return ResponseEntity.ok(modelManager.getLatestJobInfoForAllModels());
    }

    @RequestMapping(value = "/{modelName}/job-info", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getLatestJobInfo(@PathVariable String modelName) {
        return ResponseEntity.ok(modelManager.getLatestJobInfo(modelName));
    }
}
