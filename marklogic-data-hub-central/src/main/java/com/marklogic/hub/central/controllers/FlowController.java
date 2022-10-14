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
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.marklogic.hub.dataservices.FlowService;
import com.marklogic.hub.dataservices.JobService;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.FlowInputs;
import com.marklogic.hub.flow.FlowRunner;
import com.marklogic.hub.flow.RunFlowResponse;
import com.marklogic.hub.flow.impl.FlowImpl;
import com.marklogic.hub.flow.impl.FlowRunnerImpl;
import com.marklogic.hub.step.impl.Step;
import io.swagger.annotations.ApiOperation;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;
import java.util.stream.Collectors;

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
    @ApiOperation(value = "Update a flow", response = UpdateFlow.class)
    @Secured("ROLE_writeFlow")
    public ResponseEntity<JsonNode> updateFlow(@PathVariable String flowName, @RequestBody JsonNode flow) {

        ArrayNode stepIdsArray = (ArrayNode) flow.get("steps");
        if (flow.get("description") == null) {
            return ResponseEntity.ok(newFlowService().updateFlow(flowName, "", stepIdsArray));
        }

        return ResponseEntity.ok(newFlowService().updateFlow(flowName, flow.get("description").asText(), stepIdsArray));
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

    @RequestMapping(value = "/{flowName}/steps/{stepName}", method = RequestMethod.POST)
    @ResponseBody
    @Secured("ROLE_runStep")
    public ResponseEntity<RunFlowResponse> runStep(@PathVariable String flowName, @PathVariable String stepName, @RequestPart(value = "files", required = false) MultipartFile[] uploadedFiles) {
        String[] stepNumbers = getStepNumbers(flowName, stepName);
        return ResponseEntity.ok(runStepsInAFlow(flowName, uploadedFiles, stepNumbers));
    }

    @RequestMapping(value = "/{flowName}/run", method = RequestMethod.POST)
    @ResponseBody
    @Secured("ROLE_runStep")
    public ResponseEntity<?> runFlow(@PathVariable String flowName, @RequestParam(value = "stepNames", required = false) String[] stepNames, @RequestPart(value = "files", required = false) MultipartFile[] uploadedFiles ) {
        String[] stepNumbers = getStepNumbers(flowName, stepNames);
        return ResponseEntity.ok(runStepsInAFlow(flowName, uploadedFiles, stepNumbers));
    }


    @RequestMapping(value = "/stopJob/{jobId}", method = RequestMethod.POST)
    @ResponseBody
    @ApiOperation(value = "Cancel a running job with the given ID", response = JobController.Job.class)
    public ResponseEntity<Void> cancelJob(@PathVariable String jobId) {
        return stopJobID(jobId);

    }

    private ResponseEntity stopJobID(String jobId) {
        String currentUser = this.getHubClient().getUsername();
        JsonNode jobsJson = JobService.on(getHubClient().getJobsClient()).getJobWithDetails(jobId);
        String userWhoStartedTheJob = jobsJson.path("job").path("user").asText();
        //get FlowRunner from a map by jobID
        if(userWhoStartedTheJob.equalsIgnoreCase(currentUser)){
            FlowRunner flowRunner = FlowUtil.getInstance().flowMap.get(jobId);
            flowRunner.stopJob(jobId);
            return new ResponseEntity<>(HttpStatus.OK);
        }else{
            //Throws a FORBIDDEN response, because the user should be the same
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    private RunFlowResponse runStepsInAFlow(String flowName, MultipartFile[] uploadedFiles, String[] stepNumbers) {
        FlowInputs inputs;
        if(ArrayUtils.isEmpty(stepNumbers)){
            inputs = new FlowInputs(flowName);
        }
        else{
            inputs = new FlowInputs(flowName, stepNumbers);
        }

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

        //we persist our instance in a map with jobId as key
        FlowUtil.getInstance().flowMap.put(runFlowResponse.getJobId(),flowRunner);

        if(flowRunnerConsumer != null){
            flowRunnerConsumer.accept(flowRunner);
        }

        return runFlowResponse;
    }

    private String[] getStepNumbers(String flowName, String... stepNames) {
        if(ArrayUtils.isEmpty(stepNames)) {
            return null;
        }

        JsonNode jsonFlow = FlowService.on(getHubClient().getStagingClient()).getFullFlow(flowName);
        Flow flow = new FlowImpl().deserialize(jsonFlow);
        Map<String, Step> steps = flow.getSteps();

        List<String> stepNamesList = Arrays.asList(stepNames);
        Map<String, String> stepNameAndNumbers = steps.keySet()
            .stream()
            .filter(stepNumber -> stepNamesList.contains(steps.get(stepNumber).getName()))
            .collect(Collectors.toMap(stepNumber -> steps.get(stepNumber).getName(), stepNumber -> stepNumber));

        List<String> stepNumbers = new LinkedList<>();
        for(String stepName: stepNames) {
            if(stepNameAndNumbers.get(stepName) == null) {
                throw new HttpClientErrorException(String.format("StepName %s doesn't exist in the flow %s", stepName, flowName), HttpStatus.BAD_REQUEST, null, null, null, null);
            }
            stepNumbers.add(stepNameAndNumbers.get(stepName));
        }
        return stepNumbers.toArray(new String[0]);
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

    public static class UpdateFlow {
        public String description;
        public String name;
        public List<String> stepIds;
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

    public static class FlowUtil {
        private static FlowUtil instance = null;
        private Map<String, FlowRunner> flowMap = new HashMap<>();

        public static FlowUtil getInstance()
        {
            if (instance == null)
                instance = new FlowUtil();

            return instance;
        }
    }
}
