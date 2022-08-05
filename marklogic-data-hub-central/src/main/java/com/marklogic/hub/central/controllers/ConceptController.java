/*
 * Copyright 2012-2022 MarkLogic Corporation
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
import com.marklogic.hub.central.schemas.ModelDescriptor;
import com.marklogic.hub.dataservices.ConceptService;
import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;


@Controller
@RequestMapping("/api/concepts")
public class ConceptController extends BaseController {

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Create a new concept class and return the persisted model descriptor", response = ModelDescriptor.class)
    @ApiImplicitParam(name = "conceptModel", required = true, paramType = "body", dataTypeClass = ModelController.CreateModelInput.class)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<JsonNode> createDraftModel(@RequestBody @ApiParam(name = "conceptModel", hidden = true) JsonNode input) {
        JsonNode modelNode = newService().createDraftModel(input);
        return new ResponseEntity<>(modelNode, HttpStatus.CREATED);
    }

    @RequestMapping(value = "/{modelName}", method = RequestMethod.DELETE)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> deleteDraftModel(@PathVariable String modelName) {
        newService().deleteDraftModel(modelName);
        return emptyOk();
    }

    @RequestMapping(value = "/{modelName}/info", method = RequestMethod.PUT)
    @ApiImplicitParam(name = "conceptModel", required = true, paramType = "body", dataTypeClass = ModelController.UpdateModelInfoInput.class)
    @Secured("ROLE_writeEntityModel")
    public ResponseEntity<Void> updateDraftModelInfo(@PathVariable String modelName, @RequestBody @ApiParam(name = "conceptModel", hidden = true) JsonNode input) {
        if(input.get("name") != null && !(input.get("name").asText().equals(modelName))){
            throw new RuntimeException("Unable to update concept class; incorrect model name: " + input.get("name").asText());
        }
        newService().updateDraftModelInfo(modelName, input);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    @RequestMapping(value = "/{conceptName}/references", method = RequestMethod.GET)
    @ApiOperation(value = "Get entities names that refer to this concept class.", response = ModelController.ModelReferencesInfo.class)
    public ResponseEntity<JsonNode> getModelReferences(@PathVariable String conceptName) {
        return ResponseEntity.ok(newService().getModelReferences(conceptName));
    }

    private ConceptService newService() {
        return ConceptService.on(getHubClient().getStagingClient());
    }



}
