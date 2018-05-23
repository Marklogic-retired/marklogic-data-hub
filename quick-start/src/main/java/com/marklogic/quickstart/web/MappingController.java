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
import com.marklogic.quickstart.service.EntityManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Controller
public class MappingController {


    @Autowired
    private EntityManagerService entityManagerService;

    /*
     *GET /api/maps/{entityName} - Returns all maps for an entity
      GET /api/maps/{entityName}/{mapName} - Returns a map for an entity
      POST /api/maps/{entityName}/{mapName} - Creates a new map for an entity (JSON object in the body)
      DELETE  /api/maps/{entityName}/{mapName} - Deletes a map for an entity

     */

    @RequestMapping(value = "/entities/{entityName}/maps", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getMaps(
        @PathVariable String entityName) throws ClassNotFoundException, IOException {

        return entityManagerService.getAllMappingsForEntity(entityName);
    }

    @RequestMapping(value = "/entities/{entityName}/maps/{mapName}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getEntityMap(
        @PathVariable String entityName,
        @PathVariable String mapName) throws ClassNotFoundException, IOException {

        return entityManagerService.getMappingForEntity(entityName, mapName);
    }

    @RequestMapping(value = "/entities/{entityName}/maps/{mapName}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> addEntityMap(
        @PathVariable String entityName,
        @PathVariable String mapName,
        @RequestBody JsonNode mapping) throws ClassNotFoundException, IOException {
        entityManagerService.saveMappingForEntity(entityName, mapName, mapping);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/entities/{entityName}/maps/{mapName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteEntityMap(
        @PathVariable String entityName,
        @PathVariable String mapName) throws ClassNotFoundException, IOException {
        entityManagerService.deleteMappingForEntity(entityName, mapName);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
