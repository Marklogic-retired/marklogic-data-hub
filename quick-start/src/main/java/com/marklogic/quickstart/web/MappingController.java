/*
 * Copyright 2012-2018 MarkLogic Corporation
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
package com.marklogic.quickstart.web;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.quickstart.model.MappingModel;
import com.marklogic.quickstart.service.EntityManagerService;
import com.marklogic.quickstart.service.MappingManagerService;
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

    /*
     *GET /api/maps/{entityName} - Returns all maps for an entity
      GET /api/maps/{entityName}/{mapName} - Returns a map for an entity
      POST /api/maps/{entityName}/{mapName} - Creates a new map for an entity (JSON object in the body)
      DELETE  /api/maps/{entityName}/{mapName} - Deletes a map for an entity

     */

    @RequestMapping(value = "/mappings/", method = RequestMethod.GET)
    @ResponseBody
    public ArrayList<String> getMappings() throws ClassNotFoundException {
        return mappingManagerService.getMappings();
    }

    @RequestMapping(value = "/mappings/{mapName}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getMapping(
        @PathVariable String mapName) throws ClassNotFoundException, IOException {
        return mappingManagerService.getMapping(mapName).toJson();
    }

    @RequestMapping(value = "/mappings/{mapName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> addMapping(
        @PathVariable String mapName,
        @RequestBody JsonNode mapping) throws ClassNotFoundException, IOException {
        mappingManagerService.saveMapping(mapName, mapping);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/mappings/{mapName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteMapping(
        @PathVariable String mapName) throws ClassNotFoundException, IOException {
        mappingManagerService.deleteMapping(mapName);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
