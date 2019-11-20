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

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.impl.HubConfigImpl;
import com.marklogic.hub.mapping.Mapping;
import com.marklogic.hub.mapping.MappingFunctions;
import com.marklogic.hub.web.model.MappingModel;
import com.marklogic.hub.web.service.MappingManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;

@Controller
@RequestMapping("/api/current-project")
public class MappingController {

    @Autowired
    private MappingManagerService mappingManagerService;

    @Autowired
    HubConfigImpl hubConfig;

    /*
     *GET /api/maps/{entityName} - Returns all maps for an entity
      GET /api/maps/{entityName}/{mapName} - Returns a map for an entity
      POST /api/maps/{entityName}/{mapName} - Creates a new map for an entity (JSON object in the body)
      DELETE  /api/maps/{entityName}/{mapName} - Deletes a map for an entity

     */

    @RequestMapping(value = "/mappings", method = RequestMethod.GET)
    @ResponseBody
    public ArrayList<Mapping> getMappings() throws ClassNotFoundException {
        return mappingManagerService.getMappings();
    }

    @RequestMapping(value = "/mappings/names", method = RequestMethod.GET)
    @ResponseBody
    public ArrayList<String> getMappingsNames() throws ClassNotFoundException {
        return mappingManagerService.getMappingsNames();
    }

    @RequestMapping(value = "/mappings/{mapName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getMapping(
        @PathVariable String mapName,
        @RequestParam(value = "createIfNotExisted", required = false) Boolean createIfNotExisted) throws IOException {
        MappingModel mappingModel = mappingManagerService.getMapping(mapName, createIfNotExisted);
        return (mappingModel == null) ? new ResponseEntity<>(HttpStatus.NOT_FOUND) : new ResponseEntity<>(mappingModel.toJson(), HttpStatus.OK);
    }

    @RequestMapping(value = "/mappings/{mapName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> addMapping(
        @PathVariable String mapName,
        @RequestBody JsonNode mapping) throws IOException {
        mappingManagerService.saveMapping(mapName, mapping);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/mappings/{mapName}/validation", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode validateMapping(@PathVariable String mapName, @RequestBody JsonNode mapping, @RequestParam(value = "uri", required = true) String uri, @RequestParam(value = "db", required = true) String db) throws IOException {
        return mappingManagerService.validateMapping(mapping.toString(), uri, db);
    }

    @RequestMapping(value = "/mappings/{mapName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteMapping(
        @PathVariable String mapName) throws ClassNotFoundException, IOException {
        mappingManagerService.deleteMapping(mapName);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/mappings/functions", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getMappingFunctions() {
        MappingFunctions mappingFunctions = new MappingFunctions(hubConfig.newStagingClient());
        return mappingFunctions.getMappingFunctions();
    }
}
