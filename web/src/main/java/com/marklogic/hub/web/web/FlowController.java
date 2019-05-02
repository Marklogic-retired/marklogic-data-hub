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
package com.marklogic.hub.web.web;

import com.marklogic.hub.error.DataHubProjectException;
import com.marklogic.hub.web.exception.DataHubException;
import com.marklogic.hub.web.model.FlowStepModel;
import com.marklogic.hub.web.model.StepModel;
import com.marklogic.hub.web.service.FlowManagerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/flows")
public class FlowController {
    @Autowired
    private FlowManagerService flowManagerService;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlows() {
        List<FlowStepModel> flowSteps;
        try {
            flowSteps = flowManagerService.getFlows();
        } catch (Exception ex) {
            throw new DataHubException(ex.getMessage(), ex);
        }
        return new ResponseEntity<>(flowSteps, HttpStatus.OK);
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> createFlow(@RequestBody String flowJson) {
        FlowStepModel flow = null;
        try {
            flow = flowManagerService.createFlow(flowJson, true);
            if (flow == null) {
                throw new DataHubException("Flow request payload is invalid.");
            }
        } catch (Exception dpe) {
            throw new DataHubException(dpe.getMessage());
        }
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.PUT)
    @ResponseBody
    public ResponseEntity<?> updateFlow(@PathVariable String flowName, @RequestBody String flowJson) {
        FlowStepModel flow = null;
        try {
            flow = flowManagerService.createFlow(flowJson, false);
        } catch (Exception dpe) {
            throw new DataHubException(dpe.getMessage());
        }
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlow(@PathVariable String flowName) {
        FlowStepModel flow = null;
        try {
            flow = flowManagerService.getFlow(flowName, false);
        } catch (DataHubProjectException dpe) {
            throw new DataHubException(dpe.getMessage());
        }
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/names/", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<?> getFlowNames() {
        List<String> names = flowManagerService.getFlowNames();
        return new ResponseEntity<>(names, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<?> deleteFlow(@PathVariable String flowName) {
        try {
            flowManagerService.deleteFlow(flowName);
        } catch (DataHubProjectException dpe) {
            throw new DataHubException(dpe.getMessage());
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.GET)
    @ResponseBody
    public List<StepModel> getSteps(@PathVariable String flowName) {
        return flowManagerService.getSteps(flowName);
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

    @RequestMapping(value = "/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> runFlow(@PathVariable String flowName, @RequestBody(required = false) List<String> steps) {
        FlowStepModel flow = flowManagerService.runFlow(flowName, steps);
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/stop", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<?> stopFlow(@PathVariable String flowName) {
        FlowStepModel flow = flowManagerService.stop(flowName);
        return new ResponseEntity<>(flow, HttpStatus.OK);
    }
}
