/*
 * Copyright (c) 2020 MarkLogic Corporation
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
package com.marklogic.hub.central.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import io.swagger.annotations.ApiOperation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/api/newFlows")
public class NewFlowController extends BaseController {

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get all user flows with a few key data points for each step, " +
        "regardless of whether it's referenced or inline", response = FlowsWithStepDetails.class)
    public ResponseEntity<JsonNode> getFlowsWithStepDetails() {
        return ResponseEntity.ok(newFlowService().getFlowsWithStepDetails());
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Create a flow", response = FlowInfo.class)
    public ResponseEntity<JsonNode> createFlow(@RequestBody FlowInfo info) {
        return jsonCreated(newFlowService().createFlow(info.name, info.description));
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.PUT)
    @ResponseBody
    @ApiOperation(value = "Update a flow", response = FlowInfo.class)
    public ResponseEntity<JsonNode> updateFlowInfo(@PathVariable String flowName, @RequestBody UpdateFlowInfo info) {
        return ResponseEntity.ok(newFlowService().updateFlowInfo(flowName, info.description));
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.DELETE)
    @ResponseBody
    public ResponseEntity<Void> deleteFlow(@PathVariable String flowName) {
        newFlowService().deleteFlow(flowName);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.POST)
    @ApiOperation(value = "Add a step to a flow", response = FlowWithStepDetails.class)
    public ResponseEntity<JsonNode> addStepToFlow(@PathVariable String flowName, @RequestBody AddStepInfo info) {
        return ResponseEntity.ok(newFlowService().addStepToFlow(flowName, info.stepName, info.stepDefinitionType));
    }

    @RequestMapping(value = "/{flowName}/steps/{stepNumber}", method = RequestMethod.DELETE)
    @ApiOperation(value = "Remove a step from a flow", response = FlowWithStepDetails.class)
    public ResponseEntity<JsonNode> removeStepFromFlow(@PathVariable String flowName, @PathVariable String stepNumber) {
        return ResponseEntity.ok(newFlowService().removeStepFromFlow(flowName, stepNumber));
    }

    @RequestMapping(value = "/{flowName}/steps/{stepNumber}", method = RequestMethod.POST)
    @ResponseBody
    public ResponseEntity<RunFlowResponse> runStep(@PathVariable String flowName, @PathVariable String stepNumber) {
        FlowInputs inputs = new FlowInputs(flowName, stepNumber);
        return ResponseEntity.ok(newFlowRunner().runFlow(inputs));
    }

    /**
     * Included for testing purposes.
     *
     * @return
     */
    protected FlowRunner newFlowRunner() {
        return new FlowRunnerImpl(getHubClient());
    }

    private FlowService newFlowService() {
        return FlowService.on(getHubClient().getStagingClient());
    }

    public static class FlowInfo {
        public String name;
        public String description;
    }

    public static class UpdateFlowInfo {
        public String description;
    }

    public static class FlowsWithStepDetails extends ArrayList<FlowWithStepDetails> {
    }

    public static class FlowWithStepDetails extends FlowInfo {
        public List<StepDetails> steps;
    }

    public static class StepDetails {
        public String stepNumber;
        public String stepName;
        public String stepDefinitionType;
    }

    public static class AddStepInfo {
        public String stepName;
        public String stepDefinitionType;

        public AddStepInfo() {
        }

        public AddStepInfo(String stepName, String stepDefinitionType) {
            this.stepName = stepName;
            this.stepDefinitionType = stepDefinitionType;
        }
    }
}
