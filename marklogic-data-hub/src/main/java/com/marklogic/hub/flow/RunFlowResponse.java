package com.marklogic.hub.flow;

import com.marklogic.hub.job.Job;
import java.util.Map;
import java.util.stream.Collectors;

public class RunFlowResponse {
    String jobId;
    String startTime;
    String endTime;
    Map<String, Job> stepResponses;

    public RunFlowResponse(String jobId) {
        this.jobId = jobId;
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
        return String.format("{jobId: %s, startTime: %s, endTime: %s, stepResponses: %s}", jobId, startTime,
            endTime, stepResponses.keySet()
                .stream()
                .map(key -> key + "=" + stepResponses.get(key))
                .collect(Collectors.joining(", ", "{", "}")));
    }

}
