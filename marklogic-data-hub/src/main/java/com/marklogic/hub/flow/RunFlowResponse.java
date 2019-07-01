package com.marklogic.hub.flow;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.marklogic.hub.step.RunStepResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

import static java.util.Optional.ofNullable;

public class RunFlowResponse {
    String jobId;
    String endTime;
    String flowName;
    String jobStatus;
    String startTime;
    String lastAttemptedStep;
    String lastCompletedStep;
    String user;
    Map<String, RunStepResponse> stepResponses;

    public RunFlowResponse(String jobId) {
        this.jobId = jobId;
    }

    RunFlowResponse() {}

    @JsonProperty("flow")
    public String getFlowName() {
        return flowName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public String getJobStatus() {
        return jobStatus;
    }

    public void setJobStatus(String jobStatus) {
        this.jobStatus = jobStatus;
    }

    @JsonProperty("timeStarted")
    public String getStartTime() {
        return startTime;
    }

    @JsonProperty("timeEnded")
    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getLastAttemptedStep() {
        return lastAttemptedStep;
    }

    public void setLastAttemptedStep(String lastAttemptedStep) {
        this.lastAttemptedStep = lastAttemptedStep;
    }

    public String getLastCompletedStep() {
        return lastCompletedStep;
    }

    public void setLastCompletedStep(String lastCompletedStep) {
        this.lastCompletedStep = lastCompletedStep;
    }

    public String getUser() {
        return user;
    }

    public void setUser(String user) {
        this.user = user;
    }

    public Map<String, RunStepResponse> getStepResponses() {
        return stepResponses;
    }

    public void setStepResponses(Map<String, RunStepResponse> stepResponses) {
        this.stepResponses = stepResponses;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    @Override
    public String toString() {
        String stepRes = ofNullable(stepResponses).orElse(new HashMap<String, RunStepResponse>()).keySet()
            .stream()
            .map(key -> key + "=" + stepResponses.get(key))
            .collect(Collectors.joining(", ", "{", "}"));

        return String.format("{flowName: %s, jobId: %s, jobStatus: %s, startTime: %s, endTime: %s, stepResponses: %s}", flowName, jobId,
            ofNullable(jobStatus).orElse(""), ofNullable(startTime).orElse(""),
            ofNullable(endTime).orElse(""), stepRes);
    }
}
