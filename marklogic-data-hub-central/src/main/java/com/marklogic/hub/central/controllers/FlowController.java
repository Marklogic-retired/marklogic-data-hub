/*
 * Copyright (c) 2021 MarkLogic Corporation
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
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

@Controller
@RequestMapping("/api/flows")
public class FlowController extends BaseController {

    private Consumer<FlowRunner> flowRunnerConsumer;

    @RequestMapping(method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get all user flows with a few key data points for each step, " +
        "regardless of whether it's referenced or inline", response = FlowsWithStepDetails.class)
    @Secured("ROLE_readFlow")
    public ResponseEntity<JsonNode> getFlowsWithStepDetails() {
        return ResponseEntity.ok(newFlowService().getFlowsWithStepDetails());
    }

    @RequestMapping(value = "/{flowName}/latestJobInfo",method = RequestMethod.GET)
    @ResponseBody
    @ApiOperation(value = "Get latest job details for the flow", response = FlowWithLatestJobDetails.class)
    @Secured("ROLE_readFlow")
    public ResponseEntity<JsonNode> getLatestJobInfo(@PathVariable String flowName) {
        return ResponseEntity.ok(newFlowService().getFlowWithLatestJobInfo(flowName));
    }

    @RequestMapping(method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Create a flow", response = FlowInfo.class)
    @Secured("ROLE_writeFlow")
    public ResponseEntity<JsonNode> createFlow(@RequestBody FlowInfo info) {
        return jsonCreated(newFlowService().createFlow(info.name, info.description));
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.PUT)
    @ResponseBody
    @ApiOperation(value = "Update a flow", response = FlowInfo.class)
    @Secured("ROLE_writeFlow")
    public ResponseEntity<JsonNode> updateFlowInfo(@PathVariable String flowName, @RequestBody UpdateFlowInfo info) {
        return ResponseEntity.ok(newFlowService().updateFlowInfo(flowName, info.description));
    }

    @RequestMapping(value = "/{flowName}", method = RequestMethod.DELETE)
    @ResponseBody
    @Secured("ROLE_writeFlow")
    public ResponseEntity<Void> deleteFlow(@PathVariable String flowName) {
        newFlowService().deleteFlow(flowName);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @RequestMapping(value = "/{flowName}/steps", method = RequestMethod.POST)
    @ApiOperation(value = "Add a step to a flow", response = FlowWithStepDetails.class)
    @Secured("ROLE_writeFlow")
    public ResponseEntity<JsonNode> addStepToFlow(@PathVariable String flowName, @RequestBody AddStepInfo info) {
        return ResponseEntity.ok(newFlowService().addStepToFlow(flowName, info.stepName, info.stepDefinitionType));
    }

    @RequestMapping(value = "/{flowName}/steps/{stepNumber}", method = RequestMethod.DELETE)
    @ApiOperation(value = "Remove a step from a flow", response = FlowWithStepDetails.class)
    @Secured("ROLE_writeFlow")
    public ResponseEntity<JsonNode> removeStepFromFlow(@PathVariable String flowName, @PathVariable String stepNumber) {
        return ResponseEntity.ok(newFlowService().removeStepFromFlow(flowName, stepNumber));
    }

    @RequestMapping(value = "/{flowName}/steps/{stepNumber}", method = RequestMethod.POST)
    @ResponseBody
    @Secured("ROLE_runStep")
    public ResponseEntity<RunFlowResponse> runStep(@PathVariable String flowName, @PathVariable String stepNumber, @RequestPart(value = "files", required = false) MultipartFile[] uploadedFiles) {
        FlowInputs inputs = new FlowInputs(flowName, stepNumber);
        try{
            if(uploadedFiles != null && uploadedFiles.length > 0){
                Path tempDir = Files.createTempDirectory("ingestion-");
                logger.info("Uploading files to " + tempDir.toAbsolutePath().toString() + " in the server. If 'inputFilePath' " +
                    " is specified in the ingestion step, this path overrides it.");
                for (MultipartFile file : uploadedFiles) {
                    Path newFilePath = Paths.get(tempDir.toAbsolutePath().toString(), file.getOriginalFilename());
                    file.transferTo(newFilePath);
                }
                logger.info("Files successfully uploaded");
                inputs.setInputFilePath(tempDir.toAbsolutePath().toString());
            }
        }
        catch (Exception e) {
            logger.error("Uploading files to server failed: " + e.getMessage());
            throw new RuntimeException("Uploading files to server failed; cause: " + e.getMessage(), e);
        }
        FlowRunner flowRunner = newFlowRunner();
        RunFlowResponse runFlowResponse = flowRunner.runFlow(inputs);
        if(flowRunnerConsumer != null){
            flowRunnerConsumer.accept(flowRunner);
        }
        return ResponseEntity.ok(runFlowResponse);
    }

    //Included for testing purposes.
    public void setFlowRunnerConsumer(Consumer<FlowRunner> flowRunnerConsumer) {
        this.flowRunnerConsumer = flowRunnerConsumer;
    }

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
        public String stepId;
        public String stepName;
        public String stepDefinitionType;
        public String sourceFormat;
        public String targetEntityType;
    }

    public static class FlowWithLatestJobDetails extends FlowInfo {
        public List<StepWithLatestJobDetails> steps;
    }

    public static class StepWithLatestJobDetails {
        public String stepId;
        public String stepNumber;
        public String stepName;
        public String stepDefinitionType;
        public String jobId;
        public String lastRunStatus;
        public String stepEndTime;
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
