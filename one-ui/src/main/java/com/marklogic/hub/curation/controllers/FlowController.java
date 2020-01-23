/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.curation.controllers;

import com.marklogic.hub.curation.services.FlowManagerService;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.oneui.models.StepModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/api/flows")
public class FlowController {

    @Autowired
    private FlowManagerService flowManagerService;

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> createFlow(@RequestBody String flowJson) {
        Flow flow = flowManagerService.createFlow(flowJson);
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> updateFlow(@PathVariable String flowName, @RequestBody String flowJson) {
        Flow flow = flowManagerService.updateFlow(flowJson);
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlow(@PathVariable String flowName) {
        Flow flow = flowManagerService.getFlow(flowName);
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteFlow(@PathVariable String flowName) {
        flowManagerService.deleteFlow(flowName);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getStep(@PathVariable String flowName, @PathVariable String stepId) {
        StepModel stepModel = flowManagerService.getStep(flowName, stepId);
        return new ResponseEntity<>(stepModel, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> createStep(@PathVariable String flowName, @RequestParam(value = "stepOrder", required = false) Integer stepOrder, @RequestBody String stepJson) {
        StepModel stepModel = flowManagerService.createStep(flowName, stepOrder, null, stepJson);
        return new ResponseEntity<>(stepModel, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> createStep(@PathVariable String flowName, @PathVariable String stepId, @RequestBody String stepJson) {
        StepModel stepModel = flowManagerService.createStep(flowName, null, stepId, stepJson);
        return new ResponseEntity<>(stepModel, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps/{stepId}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteStep(@PathVariable String flowName, @PathVariable String stepId) {
        flowManagerService.deleteStep(flowName, stepId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

}
