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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.dataservices.ModelsService;
import com.marklogic.hub.entity.HubEntity;
import com.marklogic.hub.impl.EntityManagerImpl;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * TODO Should merge this into ModelController so that we have one controller for endpoints dealing with
 * entity models.
 */
@Controller
@RequestMapping("/api/entities")
public class EntitiesController extends BaseController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public List<JsonNode> getEntityModels() {
        ArrayNode array = (ArrayNode) ModelsService.on(getHubConfig().newFinalClient(null)).getPrimaryEntityTypes();
        List<JsonNode> models = new ArrayList<>();
        array.iterator().forEachRemaining(node -> {
            models.add(node.get("model"));
        });
        return models;
    }

    @RequestMapping(value = "/{entityName}", method = RequestMethod.GET)
    @ResponseBody
    public JsonNode getEntity(@PathVariable String entityName, @RequestParam(required = false) Boolean extendSubEntities) {
        JsonNode entityModel = null;
        for (JsonNode model : getEntityModels()) {
            if (!model.has("info")) {
                continue;
            }
            if (!model.get("info").has("title")) {
                continue;
            }
            if (entityName.equals(model.get("info").get("title").asText())) {
                entityModel = model;
                break;
            }
        }
        if (entityModel == null) {
            throw new RuntimeException("Unable to find entity model with name: " + entityName);
        }

        HubEntity hubEntity = HubEntity.fromJson(entityName + ".entity.json", entityModel);
        return new EntityManagerImpl(null).getEntityFromProject(entityName, Arrays.asList(hubEntity), null,
            (extendSubEntities != null) && extendSubEntities).toJson();
    }
}
