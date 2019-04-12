package com.marklogic.hub.flow;

import com.marklogic.hub.job.Job;
import java.util.Map;
import java.util.stream.Collectors;

public class RunFlowResponse {
    String jobId;
    String endTime;
    String flowName;
    String jobStatus;
    String startTime;
    Map<String, Job> stepResponses;

    public RunFlowResponse(String jobId) {
        this.jobId = jobId;
    }

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

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Map<String, Job> getStepResponses() {
        return stepResponses;
    }

    public void setStepResponses(Map<String, Job> stepResponses) {
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
        return String.format("{flowName: %s, jobId: %s, startTime: %s, endTime: %s, jobStatus: %s, stepResponses: %s}", flowName, jobId, startTime,
            endTime, jobStatus, stepResponses.keySet()
                .stream()
                .map(key -> key + "=" + stepResponses.get(key))
                .collect(Collectors.joining(", ", "{", "}")));
    }

}
