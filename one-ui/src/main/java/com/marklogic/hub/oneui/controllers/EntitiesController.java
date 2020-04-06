/*
 * Copyright (c) 2020 MarkLogic Corporation
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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collection;
import java.util.stream.Collectors;

/**
 * TODO Should merge this into ModelController so that we have one controller for endpoints dealing with
 * entity models.
 */
@Controller
@RequestMapping("/api/entities")
class EntitiesController {

    @Autowired
    protected HubConfigSession hubConfig;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public Collection<JsonNode> getEntities() {
        return getEntitiesManager().getEntities().stream().map((HubEntity::toJson)).collect(Collectors.toList());
    }

    @RequestMapping(value = "/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getEntity(@PathVariable String entityName, @RequestParam(required = false) Boolean extendSubEntities) throws ClassNotFoundException, IOException {
        boolean extSubEntities = (extendSubEntities != null) && extendSubEntities;
        return getEntitiesManager().getEntityFromProject(entityName, extSubEntities).toJson();
    }

    private EntityManager getEntitiesManager() {
        return new EntityManagerImpl(hubConfig);
    }
}
