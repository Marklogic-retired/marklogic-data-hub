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
import com.marklogic.hub.central.managers.ModelManager;
import com.marklogic.hub.central.schemas.ModelDescriptor;
import com.marklogic.hub.central.schemas.PrimaryEntityType;
import com.marklogic.hub.dataservices.ModelsService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping("/api/models")
public class ModelController extends BaseController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation("This should no longer be used, use /primaryEntityTypes instead")
    @Secured("ROLE_readEntityModel")
    public ResponseEntity<?> getModels() {
        return ResponseEntity.ok(newModelManager().getModels());
    }

    @RequestMapping(value = "/job-info", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get info about the latest job info for each model", response = LatestJobInfoList.class)
    @Secured("ROLE_readEntityModel")
    public ResponseEntity<List<JsonNode>> getLatestJobInfoForAllModels() {
        return ResponseEntity.ok(newModelManager().getLatestJobInfoForAllModels());
    }

    @RequestMapping(value = "/primaryEntityTypes", method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get primary entity types; does not include entity definitions that are considered 'structured' types", response = PrimaryEntityTypeList.class)
    @Secured("ROLE_readEntityModel")
    public ResponseEntity<JsonNode> getPrimaryEntityTypes() {
        // This must use the final client instead of staging so that the entityInstanceCount is derived from final
        return ResponseEntity.ok(ModelsService.on(getHubClient().getFinalClient()).getPrimaryEntityTypes());
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Create a new model and return the persisted model descriptor", response = ModelDescriptor.class)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "CreateModelInput")
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<JsonNode> createModel(@RequestBody @ApiParam(hidden = true) JsonNode input) {
        return new ResponseEntity<>(newService().createModel(input), HttpStatus.CREATED);
    }

    @RequestMapping(value = "/{modelName}/info", method = RequestMethod.PUT)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> updateModelInfo(@PathVariable String modelName, @RequestBody UpdateModelInfoInput input) {
        newService().updateModelInfo(modelName, input.description);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{modelName}/entityTypes", method = RequestMethod.PUT)
    @ApiImplicitParam(required = true, paramType = "body", dataType = "ModelDefinitions")
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> updateModelEntityTypes(@ApiParam(hidden = true) @RequestBody JsonNode entityTypes, @PathVariable String modelName) {
        newService().updateModelEntityTypes(modelName, entityTypes);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    private ModelManager newModelManager() {
        return new ModelManager(getHubClient());
    }

    private ModelsService newService() {
        return ModelsService.on(getHubClient().getStagingClient());
    }

    public static class PrimaryEntityTypeList extends ArrayList<PrimaryEntityType> {
    }

    public static class LatestJobInfoList extends ArrayList<LatestJobInfo> {
    }

    public static class LatestJobInfo {
        public String entityCollection;
        public String latestJobId;
        public Date latestJobDateTime;
    }

    public static class CreateModelInput {
        public String name;
        public String description;
    }

    public static class UpdateModelInfoInput {
        public String description;
    }
}
