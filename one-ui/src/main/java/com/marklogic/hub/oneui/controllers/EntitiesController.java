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
package com.marklogic.hub.oneui.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.EntityManager;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.hub.impl.EntityManagerImpl;
import com.marklogic.hub.oneui.models.HubConfigSession;
import com.marklogic.hub.scaffold.Scaffolding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/api/entities")
class EntitiesController {
    @Autowired
    protected HubConfigSession hubConfig;

    @Autowired
    Scaffolding scaffolding;

    @RequestMapping(value = "/create", method = RequestMethod.POST)
    @ResponseBody
    public JsonNode createEntity(@RequestBody HubEntity newEntity) {
        scaffolding.createEntity(newEntity.getInfo().getTitle());
        return getEntitiesManager().getEntityFromProject(newEntity.getInfo().getTitle()).toJson();
    }

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public Collection<JsonNode> getEntities() {
        return getEntitiesManager().getEntities().stream().map((HubEntity::toJson)).collect(Collectors.toList());
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> saveEntities(@RequestBody List<HubEntity> entities) throws ClassNotFoundException, IOException {
        EntityManager entityManagerService = getEntitiesManager();
        for (HubEntity entity : entities) {
            entityManagerService.saveEntity(entity, false);
        }
        entityManagerService.savePii();
        entityManagerService.deployQueryOptions();
        entityManagerService.saveDbIndexes();

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @RequestMapping(value = "/{entityName}", method = RequestMethod.PUT)
    @ResponseBody
    public HubEntity saveEntity(@RequestBody HubEntity entity) throws ClassNotFoundException, IOException {
        EntityManager entityManagerService = getEntitiesManager();
        HubEntity m = entityManagerService.saveEntity(entity, false);
        entityManagerService.savePii();
        entityManagerService.deployQueryOptions();
        entityManagerService.saveDbIndexes();
        return m;
    }

    @RequestMapping(value = "/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getEntity(@PathVariable String entityName, @RequestParam(required = false)Boolean extendSubEntities) throws ClassNotFoundException, IOException {
        boolean extSubEntities = (extendSubEntities != null) && extendSubEntities;
        return getEntitiesManager().getEntityFromProject(entityName, extSubEntities).toJson();
    }

    @RequestMapping(value = "/{entityName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteEntity(@PathVariable String entityName) throws ClassNotFoundException, IOException {
        getEntitiesManager().deleteEntity(entityName);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    private EntityManager getEntitiesManager() {
        return new EntityManagerImpl(hubConfig);
    }
}
