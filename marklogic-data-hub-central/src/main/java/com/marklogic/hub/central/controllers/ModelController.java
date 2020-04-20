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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.impl.ModelManagerImpl;
import com.marklogic.hub.central.managers.ModelManager;
import com.marklogic.hub.central.models.HubConfigSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/models")
public class ModelController {

    @Autowired
    protected ModelManager modelManager;

    @Autowired
    protected HubConfigSession hubConfig;

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

    @RequestMapping(value = "/primaryEntityTypes", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<JsonNode> getPrimaryEntityTypes() {
        return ResponseEntity.ok(newService().getPrimaryEntityTypes());
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<JsonNode> createModel(@RequestBody JsonNode input) {
        return new ResponseEntity<>(newService().createModel(input), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/{modelName}/info", method = RequestMethod.PUT)
    public ResponseEntity<Void> updateModelInfo(@PathVariable String modelName, @RequestBody JsonNode input) {
        newService().updateModelInfo(modelName, input.has("description") ? input.get("description").asText() : "");
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{modelName}/entityTypes", method = RequestMethod.PUT)
    public ResponseEntity<Void> updateModelEntityTypes(@PathVariable String modelName, @RequestBody JsonNode entityTypes) {
        newService().updateModelEntityTypes(modelName, entityTypes);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private ModelsService newService() {
        return new ModelManagerImpl(hubConfig);
    }

    public void setHubConfig(HubConfigSession hubConfig) {
        this.hubConfig = hubConfig;
    }
}
