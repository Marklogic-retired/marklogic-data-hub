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
package com.marklogic.hub.step;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import com.marklogic.hub.error.DataHubConfigurationException;
import com.marklogic.hub.flow.Flow;
import com.marklogic.hub.flow.impl.JobStatus;
import com.marklogic.hub.step.impl.Step;
import com.marklogic.hub.util.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public class RunStepResponse {
    private String jobId;
    private String flowName;

    private String stepName;
    private String stepDefinitionName;
    private String stepDefinitionType;
    private String targetEntityType;
    private String targetDatabase;

    public List<String> stepOutput;
    private Map<String, JsonNode> fullOutput;
    private String status;

    private long totalEvents = 0;
    private long successfulEvents = 0;
    private long failedEvents = 0;
    private long successfulBatches = 0;
    private long failedBatches = 0;
    private boolean success = false;

    public void setStepStartTime(String stepStartTime) {
        this.stepStartTime = stepStartTime;
    }

    public void setStepEndTime(String stepEndTime) {
        this.stepEndTime = stepEndTime;
    }

    private String stepStartTime;
    private String stepEndTime;

    private Flow flow;

    public ObjectNode toObjectNode() {
        try {
            String json = JSONObject.writeValueAsString(this);
            return (ObjectNode) new ObjectMapper().readTree(json);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to convert RunStepResponse into JSON node; cause: " + ex.getMessage());
        }
    }

    /**
     * @return true if the job ran without errors, false otherwise.
     */
    public boolean isSuccess() {
        return success;
    }

    public RunStepResponse withJobId(String jobId) {
        this.jobId = jobId;
        return this;
    }

    public static RunStepResponse withFlow(Flow flow) {
        RunStepResponse runStepResponse = new RunStepResponse();
        runStepResponse.flowName = flow.getName();
        runStepResponse.flow = flow;
        return runStepResponse;
    }

    public RunStepResponse withStep(String stepNum) {
        if(flow == null){
            throw new DataHubConfigurationException("Flow has to be set before setting step");
        }
        Step step = this.flow.getStep(stepNum);
        this.stepName = step.getName();
        this.stepDefinitionName = step.getStepDefinitionName();
        this.stepDefinitionType = step.getStepDefinitionType() != null ? step.getStepDefinitionType().toString() : null;
        TextNode targetEntityTextNode = (TextNode) step.getOptions().getOrDefault("targetEntityType", step.getOptions().get("targetEntity"));
        if (targetEntityTextNode != null) {
            this.targetEntityType = targetEntityTextNode.asText();
        }
        Optional.of(step.getOptions()).map(optionMap -> (TextNode) optionMap.get("targetDatabase")).ifPresent(node -> this.targetDatabase = node.asText());
        return this;
    }

    public RunStepResponse withStepOutput(List<String> stepOutput) {
        this.stepOutput = stepOutput;
        return this;
    }

    public RunStepResponse withFullOutput(Map<String,JsonNode>  fullOutput) {
        this.fullOutput = fullOutput;
        return this;
    }

    public RunStepResponse withStepOutput(String jobOutput) {
        if (this.stepOutput == null) {
            this.stepOutput = new ArrayList<>();
        }
        this.stepOutput.add(jobOutput);
        return this;
    }

    public RunStepResponse withStatus(String status) {
        if(status.contains(JobStatus.COMPLETED_PREFIX)) {
            this.success = true;
        }
        this.status = status;
        return this;
    }

    public RunStepResponse withSuccess(boolean success) {
        this.success = success;
        return this;
    }

    public RunStepResponse setCounts(long totalEvents, long successfulEvents, long failedEvents, long successfulBatches, long failedBatches) {
        this.totalEvents = totalEvents;
        this.successfulEvents = successfulEvents;
        this.failedEvents = failedEvents;
        this.successfulBatches = successfulBatches;
        this.failedBatches = failedBatches;
        return this;
    }

    @JsonIgnore
    public String getJobId() {
        return jobId;
    }

    public String getFlowName() {
        return flowName;
    }

    public Map<String, JsonNode> getFullOutput() {
        return fullOutput;
    }

    public String getStatus() {
        return status;
    }

    public List<String> getStepOutput() {
        return stepOutput;
    }

    public long getSuccessfulEvents() {
        return successfulEvents;
    }

    public long getFailedEvents() {
        return failedEvents;
    }

    public long getTotalEvents() {  return totalEvents; }

    public long getSuccessfulBatches() {
        return successfulBatches;
    }

    public long getFailedBatches() {
        return failedBatches;
    }

    public String getStepName() {
        return stepName;
    }

    public String getStepDefinitionType() {
        return stepDefinitionType;
    }

    public String getStepDefinitionName() {
        return stepDefinitionName;
    }

    public String getStepStartTime() {
        return stepStartTime;
    }

    public String getStepEndTime() {
        return stepEndTime;
    }

    public String getTargetEntityType() {
        return targetEntityType;
    }

    public String getTargetDatabase() {
        return targetDatabase;
    }

    public void setTargetDatabase(String targetDatabase) {
        this.targetDatabase = targetDatabase;
    }

    @Override
    public String toString() {
        return String.format("[flowName: %s, stepName: %s, stepDefinitionName: %s, stepDefinitionType: %s, " +
                        "targetEntityType: %s, targetDatabase: %s, success: %s, status: %s, totalEvents: %d, " +
                        "successfulEvents: %d, " + "failedEvents: %d, successfulBatches: %d, failedBatches: %d, " +
                        "stepStartTime: %s , stepEndTime: %s]", flowName, stepName, stepDefinitionName,
            stepDefinitionType, targetEntityType, targetDatabase, success, status, totalEvents, successfulEvents, failedEvents,
            successfulBatches, failedBatches, stepStartTime, stepEndTime);
    }
}
